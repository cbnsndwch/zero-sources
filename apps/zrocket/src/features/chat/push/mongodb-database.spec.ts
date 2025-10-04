import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Connection, ClientSession } from 'mongoose';
import type { TransactionProviderHooks } from '@rocicorp/zero/server';

import { MongoDatabase } from './mongodb-database.js';

describe('MongoDatabase', () => {
    let mockConnection: Connection;
    let mockSession: ClientSession;
    let database: MongoDatabase;

    beforeEach(() => {
        // Mock Mongoose session
        mockSession = {
            withTransaction: vi.fn(),
            endSession: vi.fn()
        } as unknown as ClientSession;

        // Mock Mongoose connection
        mockConnection = {
            startSession: vi.fn().mockResolvedValue(mockSession),
            model: vi.fn()
        } as unknown as Connection;

        database = new MongoDatabase(mockConnection);
    });

    describe('transaction', () => {
        it('should start and end a session', async () => {
            const callback = vi.fn().mockResolvedValue('result');
            const input = {
                upstreamSchema: 'test-schema',
                clientGroupID: 'group-1',
                clientID: 'client-1',
                mutationID: 1
            };

            // Setup withTransaction to call the callback
            (mockSession.withTransaction as any).mockImplementation(
                async (cb: any) => {
                    return await cb();
                }
            );

            await database.transaction(callback, input);

            expect(mockConnection.startSession).toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();
        });

        it('should pass transaction and hooks to callback', async () => {
            let capturedTx: any;
            let capturedHooks: TransactionProviderHooks | undefined;

            const callback = vi.fn().mockImplementation((tx, hooks) => {
                capturedTx = tx;
                capturedHooks = hooks;
                return Promise.resolve('result');
            });

            const input = {
                upstreamSchema: 'test-schema',
                clientGroupID: 'group-1',
                clientID: 'client-1',
                mutationID: 5
            };

            (mockSession.withTransaction as any).mockImplementation(
                async (cb: any) => {
                    return await cb();
                }
            );

            await database.transaction(callback, input);

            expect(capturedTx).toBeDefined();
            expect(capturedTx.session).toBe(mockSession);
            expect(capturedTx.connection).toBe(mockConnection);
            expect(capturedTx.clientID).toBe('client-1');
            expect(capturedTx.mutationID).toBe(5);

            expect(capturedHooks).toBeDefined();
            expect(capturedHooks?.updateClientMutationID).toBeInstanceOf(
                Function
            );
            expect(capturedHooks?.writeMutationResult).toBeInstanceOf(Function);
        });

        it('should end session even if callback throws', async () => {
            const callback = vi.fn().mockRejectedValue(new Error('Test error'));
            const input = {
                upstreamSchema: 'test-schema',
                clientGroupID: 'group-1',
                clientID: 'client-1',
                mutationID: 1
            };

            (mockSession.withTransaction as any).mockImplementation(
                async (cb: any) => {
                    try {
                        return await cb();
                    } catch (error) {
                        throw error;
                    }
                }
            );

            await expect(database.transaction(callback, input)).rejects.toThrow(
                'Test error'
            );

            expect(mockSession.endSession).toHaveBeenCalled();
        });
    });

    describe('TransactionProviderHooks', () => {
        it('updateClientMutationID should track mutation ID', async () => {
            const mockModel = {
                findOneAndUpdate: vi.fn().mockReturnValue({
                    lean: vi.fn().mockResolvedValue({ lastMutationID: 3 })
                })
            };

            (mockConnection.model as any).mockReturnValue(mockModel);

            let hooks: TransactionProviderHooks | undefined;
            const callback = vi.fn().mockImplementation((_tx, h) => {
                hooks = h;
                return Promise.resolve('result');
            });

            const input = {
                upstreamSchema: 'test-schema',
                clientGroupID: 'group-1',
                clientID: 'client-1',
                mutationID: 5
            };

            (mockSession.withTransaction as any).mockImplementation(
                async (cb: any) => {
                    return await cb();
                }
            );

            await database.transaction(callback, input);

            const result = await hooks!.updateClientMutationID();

            expect(result).toEqual({ lastMutationID: 3 });
            expect(mockConnection.model).toHaveBeenCalledWith('ClientMutation');
            expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
                {
                    clientGroupID: 'group-1',
                    clientID: 'client-1'
                },
                expect.objectContaining({
                    $set: expect.objectContaining({
                        lastMutationID: 5,
                        upstreamSchema: 'test-schema'
                    })
                }),
                expect.objectContaining({
                    upsert: true,
                    new: false,
                    session: mockSession
                })
            );
        });

        it('updateClientMutationID should return 0 for new client', async () => {
            const mockModel = {
                findOneAndUpdate: vi.fn().mockReturnValue({
                    lean: vi.fn().mockResolvedValue(null)
                })
            };

            (mockConnection.model as any).mockReturnValue(mockModel);

            let hooks: TransactionProviderHooks | undefined;
            const callback = vi.fn().mockImplementation((_tx, h) => {
                hooks = h;
                return Promise.resolve('result');
            });

            const input = {
                upstreamSchema: 'test-schema',
                clientGroupID: 'group-1',
                clientID: 'client-1',
                mutationID: 1
            };

            (mockSession.withTransaction as any).mockImplementation(
                async (cb: any) => {
                    return await cb();
                }
            );

            await database.transaction(callback, input);

            const result = await hooks!.updateClientMutationID();

            expect(result).toEqual({ lastMutationID: 0 });
        });

        it('writeMutationResult should store mutation result', async () => {
            const mockModel = {
                create: vi.fn().mockResolvedValue([{ _id: 'result-1' }])
            };

            (mockConnection.model as any).mockReturnValue(mockModel);

            let hooks: TransactionProviderHooks | undefined;
            const callback = vi.fn().mockImplementation((_tx, h) => {
                hooks = h;
                return Promise.resolve('result');
            });

            const input = {
                upstreamSchema: 'test-schema',
                clientGroupID: 'group-1',
                clientID: 'client-1',
                mutationID: 5
            };

            (mockSession.withTransaction as any).mockImplementation(
                async (cb: any) => {
                    return await cb();
                }
            );

            await database.transaction(callback, input);

            const mutationResult = {
                ok: true,
                mutationID: 5
            };

            await hooks!.writeMutationResult(mutationResult as any);

            expect(mockConnection.model).toHaveBeenCalledWith('MutationResult');
            expect(mockModel.create).toHaveBeenCalledWith(
                [
                    expect.objectContaining({
                        clientGroupID: 'group-1',
                        clientID: 'client-1',
                        mutationID: 5,
                        upstreamSchema: 'test-schema',
                        result: mutationResult
                    })
                ],
                { session: mockSession }
            );
        });
    });
});
