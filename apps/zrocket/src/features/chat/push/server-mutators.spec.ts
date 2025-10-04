import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ClientSession } from 'mongoose';

import type { MessageService } from '../services/message.service.js';
import type { RoomService } from '../services/room.service.js';

import type { MongoTransaction } from './mongo-transaction.js';
import { createServerMutators } from './server-mutators.js';

describe('Server Mutators', () => {
    let mockMessageService: MessageService;
    let mockRoomService: RoomService;
    let mockSession: ClientSession;
    let mockTx: MongoTransaction;

    beforeEach(() => {
        mockSession = {} as ClientSession;

        mockTx = {
            session: mockSession,
            connection: {} as any,
            clientID: 'client-1',
            mutationID: 1
        };

        mockMessageService = {
            sendMessage: vi.fn().mockResolvedValue({
                _id: 'msg-1',
                roomId: 'room-1',
                content: 'Test message'
            })
        } as any;

        mockRoomService = {
            createRoom: vi.fn().mockResolvedValue({
                _id: 'room-1',
                t: 'd',
                memberIds: ['user1', 'user2']
            }),
            inviteToRoom: vi.fn().mockResolvedValue({
                _id: 'room-1',
                memberIds: ['user1', 'user2', 'user3']
            })
        } as any;
    });

    describe('message.send', () => {
        it('should call messageService.sendMessage with session', async () => {
            const mutators = createServerMutators(
                mockMessageService,
                mockRoomService
            ) as any;

            const args = {
                roomId: 'room-1',
                content: 'Hello World',
                userId: 'user-1',
                username: 'Alice'
            };

            await mutators.message.send(mockTx, args);

            expect(mockMessageService.sendMessage).toHaveBeenCalledWith(
                {
                    roomId: 'room-1',
                    content: 'Hello World',
                    userId: 'user-1',
                    username: 'Alice'
                },
                mockSession
            );
        });

        it('should handle service errors', async () => {
            const mutators = createServerMutators(
                mockMessageService,
                mockRoomService
            ) as any;

            (mockMessageService.sendMessage as any).mockRejectedValue(
                new Error('Room not found')
            );

            const args = {
                roomId: 'invalid-room',
                content: 'Test',
                userId: 'user-1',
                username: 'Alice'
            };

            await expect(mutators.message.send(mockTx, args)).rejects.toThrow(
                'Room not found'
            );
        });
    });

    describe('room.create', () => {
        it('should call roomService.createRoom with session', async () => {
            const mutators = createServerMutators(
                mockMessageService,
                mockRoomService
            ) as any;

            const args = {
                type: 'd' as const,
                memberIds: ['user1', 'user2'],
                usernames: ['Alice', 'Bob'],
                createdBy: 'user1'
            };

            await mutators.room.create(mockTx, args);

            expect(mockRoomService.createRoom).toHaveBeenCalledWith(
                {
                    type: 'd',
                    memberIds: ['user1', 'user2'],
                    usernames: ['Alice', 'Bob']
                },
                'user1',
                mockSession
            );
        });

        it('should create private group with name', async () => {
            const mutators = createServerMutators(
                mockMessageService,
                mockRoomService
            ) as any;

            const args = {
                type: 'p' as const,
                memberIds: ['user1', 'user2', 'user3'],
                usernames: ['Alice', 'Bob', 'Charlie'],
                name: 'Project Team',
                topic: 'Project discussion',
                description: 'Team collaboration space',
                readOnly: false,
                createdBy: 'user1'
            };

            await mutators.room.create(mockTx, args);

            expect(mockRoomService.createRoom).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'p',
                    name: 'Project Team',
                    topic: 'Project discussion',
                    description: 'Team collaboration space'
                }),
                'user1',
                mockSession
            );
        });

        it('should create public channel', async () => {
            const mutators = createServerMutators(
                mockMessageService,
                mockRoomService
            ) as any;

            const args = {
                type: 'c' as const,
                memberIds: ['user1'],
                usernames: ['Alice'],
                name: 'general',
                createdBy: 'user1'
            };

            await mutators.room.create(mockTx, args);

            expect(mockRoomService.createRoom).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'c',
                    name: 'general'
                }),
                'user1',
                mockSession
            );
        });
    });

    describe('room.invite', () => {
        it('should call roomService.inviteToRoom with session', async () => {
            const mutators = createServerMutators(
                mockMessageService,
                mockRoomService
            ) as any;

            const args = {
                roomId: 'room-1',
                userIds: ['user3', 'user4'],
                usernames: ['Charlie', 'Diana']
            };

            await mutators.room.invite(mockTx, args);

            expect(mockRoomService.inviteToRoom).toHaveBeenCalledWith(
                {
                    roomId: 'room-1',
                    userIds: ['user3', 'user4'],
                    usernames: ['Charlie', 'Diana']
                },
                mockSession
            );
        });

        it('should handle service errors', async () => {
            const mutators = createServerMutators(
                mockMessageService,
                mockRoomService
            ) as any;

            (mockRoomService.inviteToRoom as any).mockRejectedValue(
                new Error('Room not found')
            );

            const args = {
                roomId: 'invalid-room',
                userIds: ['user3'],
                usernames: ['Charlie']
            };

            await expect(mutators.room.invite(mockTx, args)).rejects.toThrow(
                'Room not found'
            );
        });
    });
});
