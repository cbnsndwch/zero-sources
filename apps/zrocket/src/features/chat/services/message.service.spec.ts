import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import type { Model, ClientSession } from 'mongoose';

import { Message } from '../entities/message.entity.js';
import { Room } from '../entities/rooms/room-base.entity.js';

import { MessageService } from './message.service.js';

describe('MessageService', () => {
    let service: MessageService;
    let messageModel: Model<Message>;
    let roomModel: Model<Room>;
    let mockSession: ClientSession;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MessageService,
                {
                    provide: getModelToken(Message.name),
                    useValue: {
                        create: vi.fn(),
                        find: vi.fn()
                    }
                },
                {
                    provide: getModelToken(Room.name),
                    useValue: {
                        findById: vi.fn(),
                        updateOne: vi.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<MessageService>(MessageService);
        messageModel = module.get<Model<Message>>(getModelToken(Message.name));
        roomModel = module.get<Model<Room>>(getModelToken(Room.name));

        mockSession = {} as ClientSession;
    });

    describe('sendMessage', () => {
        it('should send a message within a transaction', async () => {
            const mockRoom = {
                _id: 'room-1',
                memberIds: ['user-1', 'user-2'],
                messageCount: 5,
                save: vi.fn().mockResolvedValue(true)
            };

            const mockMessage = {
                _id: 'msg-1',
                roomId: 'room-1',
                t: 'USER',
                sender: { _id: 'user-1', username: 'Alice' },
                contents: {},
                groupable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            vi.spyOn(roomModel, 'findById').mockReturnValue({
                session: vi.fn().mockResolvedValue(mockRoom)
            } as any);

            vi.spyOn(messageModel, 'create').mockResolvedValue([
                mockMessage
            ] as any);

            vi.spyOn(roomModel, 'updateOne').mockResolvedValue({
                acknowledged: true,
                matchedCount: 1,
                modifiedCount: 1,
                upsertedCount: 0,
                upsertedId: null
            } as any);

            const input = {
                roomId: 'room-1',
                content: 'Hello World',
                userId: 'user-1',
                username: 'Alice'
            };

            const result = await service.sendMessage(input, mockSession);

            expect(result).toEqual(mockMessage);
            expect(roomModel.findById).toHaveBeenCalledWith('room-1');
            expect(messageModel.create).toHaveBeenCalledWith(
                [
                    expect.objectContaining({
                        roomId: 'room-1',
                        t: 'USER',
                        groupable: true
                    })
                ],
                { session: mockSession }
            );
            expect(roomModel.updateOne).toHaveBeenCalledWith(
                { _id: 'room-1' },
                expect.objectContaining({
                    $set: expect.objectContaining({
                        lastMessage: expect.any(Object),
                        lastMessageAt: expect.any(Date),
                        updatedAt: expect.any(Date)
                    }),
                    $inc: { messageCount: 1 }
                }),
                { session: mockSession }
            );
        });

        it('should throw error if room not found', async () => {
            vi.spyOn(roomModel, 'findById').mockReturnValue({
                session: vi.fn().mockResolvedValue(null)
            } as any);

            const input = {
                roomId: 'invalid-room',
                content: 'Test',
                userId: 'user-1',
                username: 'Alice'
            };

            await expect(
                service.sendMessage(input, mockSession)
            ).rejects.toThrow('Room invalid-room not found');
        });

        it('should throw error if user is not a member', async () => {
            const mockRoom = {
                _id: 'room-1',
                memberIds: ['user-2', 'user-3'] // user-1 is not a member
            };

            vi.spyOn(roomModel, 'findById').mockReturnValue({
                session: vi.fn().mockResolvedValue(mockRoom)
            } as any);

            const input = {
                roomId: 'room-1',
                content: 'Test',
                userId: 'user-1',
                username: 'Alice'
            };

            await expect(
                service.sendMessage(input, mockSession)
            ).rejects.toThrow('You must be a room member to send messages');
        });

        it('should work without a session (backward compatibility)', async () => {
            const mockRoom = {
                _id: 'room-1',
                memberIds: ['user-1'],
                messageCount: 0,
                save: vi.fn().mockResolvedValue(true)
            };

            const mockMessage = {
                _id: 'msg-1',
                roomId: 'room-1',
                sender: { _id: 'user-1', username: 'Alice' }
            };

            vi.spyOn(roomModel, 'findById').mockReturnValue({
                session: vi.fn().mockResolvedValue(mockRoom)
            } as any);

            vi.spyOn(messageModel, 'create').mockResolvedValue([
                mockMessage
            ] as any);

            vi.spyOn(roomModel, 'updateOne').mockResolvedValue({
                acknowledged: true,
                matchedCount: 1,
                modifiedCount: 1,
                upsertedCount: 0,
                upsertedId: null
            } as any);

            const input = {
                roomId: 'room-1',
                content: 'Test',
                userId: 'user-1',
                username: 'Alice'
            };

            await service.sendMessage(input); // No session

            expect(messageModel.create).toHaveBeenCalledWith(
                expect.anything(),
                { session: undefined }
            );
            expect(roomModel.updateOne).toHaveBeenCalledWith(
                { _id: 'room-1' },
                expect.anything(),
                { session: undefined }
            );
        });
    });
});
