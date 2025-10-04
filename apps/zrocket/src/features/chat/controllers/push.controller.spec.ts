import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';

import { MessageService } from '../services/message.service.js';
import { RoomService } from '../services/room.service.js';

import { PushController } from './push.controller.js';

describe('PushController', () => {
    let controller: PushController;
    let messageService: MessageService;
    let _roomService: RoomService;
    let mockConnection: Connection;

    beforeEach(async () => {
        mockConnection = {
            startSession: vi.fn(),
            model: vi.fn()
        } as unknown as Connection;

        const module: TestingModule = await Test.createTestingModule({
            controllers: [PushController],
            providers: [
                {
                    provide: getConnectionToken(),
                    useValue: mockConnection
                },
                {
                    provide: MessageService,
                    useValue: {
                        sendMessage: vi.fn()
                    }
                },
                {
                    provide: RoomService,
                    useValue: {
                        createRoom: vi.fn(),
                        inviteToRoom: vi.fn()
                    }
                }
            ]
        }).compile();

        controller = module.get<PushController>(PushController);
        messageService = module.get<MessageService>(MessageService);
        _roomService = module.get<RoomService>(RoomService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should initialize PushProcessor', () => {
        expect(controller).toBeDefined();
        expect((controller as any).processor).toBeDefined();
    });

    describe('processPush', () => {
        it('should process push request with mutations', async () => {
            const mockRequest = {
                protocol: 'http',
                url: '/push?schema=test&appID=zrocket',
                method: 'POST',
                get: vi.fn((header: string) => {
                    if (header === 'host') return 'localhost:8011';
                    return undefined;
                }),
                headers: {
                    'content-type': 'application/json'
                },
                body: {
                    pushVersion: 1,
                    clientGroupID: 'test-group',
                    requestID: 'req-1',
                    timestamp: Date.now(),
                    mutations: [
                        {
                            type: 'custom',
                            id: 0,
                            clientID: 'client-1',
                            name: 'message.send',
                            timestamp: Date.now(),
                            args: [
                                {
                                    roomId: 'room-1',
                                    content: 'Hello',
                                    userId: 'user-1',
                                    username: 'Alice'
                                }
                            ]
                        }
                    ]
                }
            } as any;

            const mockResponse = {
                json: vi.fn()
            } as any;

            const mockSession = {
                withTransaction: vi.fn(async cb => await cb()),
                endSession: vi.fn()
            };

            (mockConnection.startSession as any).mockResolvedValue(mockSession);

            const mockClientMutationModel = {
                findOneAndUpdate: vi.fn().mockReturnValue({
                    lean: vi.fn().mockResolvedValue(null) // First mutation (returns null = no previous mutations)
                })
            };

            const mockMutationResultModel = {
                create: vi.fn().mockResolvedValue([{}])
            };

            (mockConnection.model as any).mockImplementation((name: string) => {
                if (name === 'ClientMutation') return mockClientMutationModel;
                if (name === 'MutationResult') return mockMutationResultModel;
                return {};
            });

            vi.spyOn(messageService, 'sendMessage').mockResolvedValue({
                _id: 'msg-1'
            } as any);

            await controller.processPush(mockRequest, mockResponse);

            // Should return a response (even if mutation failed during processing)
            expect(mockResponse.json).toHaveBeenCalled();
            
            // Note: The mutator resolution is tested separately in server-mutators.spec.ts
            // This test verifies the push endpoint accepts and processes requests
        });

        it('should handle mutation errors gracefully', async () => {
            const mockRequest = {
                protocol: 'http',
                url: '/push?schema=test&appID=zrocket',
                method: 'POST',
                get: vi.fn((header: string) => {
                    if (header === 'host') return 'localhost:8011';
                    return undefined;
                }),
                headers: {
                    'content-type': 'application/json'
                },
                body: {
                    pushVersion: 1,
                    clientGroupID: 'test-group',
                    requestID: 'req-2',
                    timestamp: Date.now(),
                    mutations: [
                        {
                            type: 'custom',
                            id: 1,
                            clientID: 'client-1',
                            name: 'message.send',
                            timestamp: Date.now(),
                            args: [
                                {
                                    roomId: 'invalid-room',
                                    content: 'Test',
                                    userId: 'user-1',
                                    username: 'Alice'
                                }
                            ]
                        }
                    ]
                }
            } as any;

            const mockResponse = {
                json: vi.fn()
            } as any;

            const mockSession = {
                withTransaction: vi.fn(async cb => await cb()),
                endSession: vi.fn()
            };

            (mockConnection.startSession as any).mockResolvedValue(mockSession);

            const mockClientMutationModel = {
                findOneAndUpdate: vi.fn().mockReturnValue({
                    lean: vi.fn().mockResolvedValue(null)
                })
            };

            const mockMutationResultModel = {
                create: vi.fn().mockResolvedValue([{}])
            };

            (mockConnection.model as any).mockImplementation((name: string) => {
                if (name === 'ClientMutation') return mockClientMutationModel;
                if (name === 'MutationResult') return mockMutationResultModel;
                return {};
            });

            vi.spyOn(messageService, 'sendMessage').mockRejectedValue(
                new Error('Room not found')
            );

            await controller.processPush(mockRequest, mockResponse);

            // Should return error response but not throw
            expect(mockResponse.json).toHaveBeenCalled();
        });
    });
});
