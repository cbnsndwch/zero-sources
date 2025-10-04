import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import type { Model, ClientSession } from 'mongoose';
import { RoomType } from '@cbnsndwch/zrocket-contracts';

import { DirectMessagesRoom } from '../entities/rooms/direct-messages-room.entity.js';
import { PrivateGroupRoom } from '../entities/rooms/private-group.entity.js';
import { PublicChannelRoom } from '../entities/rooms/public-channel.entity.js';
import { Room } from '../entities/rooms/room-base.entity.js';

import { RoomService } from './room.service.js';

describe('RoomService', () => {
    let service: RoomService;
    let roomModel: Model<Room>;
    let directMessageModel: Model<DirectMessagesRoom>;
    let privateGroupModel: Model<PrivateGroupRoom>;
    let publicChannelModel: Model<PublicChannelRoom>;
    let mockSession: ClientSession;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoomService,
                {
                    provide: getModelToken(Room.name),
                    useValue: {
                        findById: vi.fn(),
                        find: vi.fn()
                    }
                },
                {
                    provide: getModelToken(DirectMessagesRoom.name),
                    useValue: {
                        create: vi.fn()
                    }
                },
                {
                    provide: getModelToken(PrivateGroupRoom.name),
                    useValue: {
                        create: vi.fn()
                    }
                },
                {
                    provide: getModelToken(PublicChannelRoom.name),
                    useValue: {
                        create: vi.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<RoomService>(RoomService);
        roomModel = module.get<Model<Room>>(getModelToken(Room.name));
        directMessageModel = module.get<Model<DirectMessagesRoom>>(
            getModelToken(DirectMessagesRoom.name)
        );
        privateGroupModel = module.get<Model<PrivateGroupRoom>>(
            getModelToken(PrivateGroupRoom.name)
        );
        publicChannelModel = module.get<Model<PublicChannelRoom>>(
            getModelToken(PublicChannelRoom.name)
        );

        mockSession = {} as ClientSession;
    });

    describe('createRoom', () => {
        it('should create a direct message room with session', async () => {
            const mockRoom = {
                _id: 'room-1',
                t: 'd',
                memberIds: ['user-1', 'user-2'],
                usernames: ['Alice', 'Bob'],
                messageCount: 0
            };

            vi.spyOn(directMessageModel, 'create').mockResolvedValue([
                mockRoom
            ] as any);

            const input = {
                type: RoomType.DirectMessages,
                memberIds: ['user-1', 'user-2'],
                usernames: ['Alice', 'Bob']
            };

            const result = await service.createRoom(
                input,
                'user-1',
                mockSession
            );

            expect(result).toEqual(mockRoom);
            expect(directMessageModel.create).toHaveBeenCalledWith(
                [
                    expect.objectContaining({
                        t: 'd',
                        memberIds: ['user-1', 'user-2'],
                        usernames: ['Alice', 'Bob']
                    })
                ],
                { session: mockSession }
            );
        });

        it('should create a private group with session', async () => {
            const mockRoom = {
                _id: 'room-1',
                t: 'p',
                name: 'Project Team',
                memberIds: ['user-1', 'user-2', 'user-3']
            };

            vi.spyOn(privateGroupModel, 'create').mockResolvedValue([
                mockRoom
            ] as any);

            const input = {
                type: RoomType.PrivateGroup,
                memberIds: ['user-1', 'user-2', 'user-3'],
                usernames: ['Alice', 'Bob', 'Charlie'],
                name: 'Project Team',
                topic: 'Project discussion',
                description: 'Team collaboration space',
                readOnly: false
            };

            const result = await service.createRoom(
                input,
                'user-1',
                mockSession
            );

            expect(result).toEqual(mockRoom);
            expect(privateGroupModel.create).toHaveBeenCalledWith(
                [
                    expect.objectContaining({
                        t: 'p',
                        name: 'Project Team',
                        topic: 'Project discussion',
                        archived: false
                    })
                ],
                { session: mockSession }
            );
        });

        it('should create a public channel with session', async () => {
            const mockRoom = {
                _id: 'room-1',
                t: 'c',
                name: 'general',
                memberIds: ['user-1']
            };

            vi.spyOn(publicChannelModel, 'create').mockResolvedValue([
                mockRoom
            ] as any);

            const input = {
                type: RoomType.PublicChannel,
                memberIds: ['user-1'],
                usernames: ['Alice'],
                name: 'general'
            };

            const result = await service.createRoom(
                input,
                'user-1',
                mockSession
            );

            expect(result).toEqual(mockRoom);
            expect(publicChannelModel.create).toHaveBeenCalledWith(
                [
                    expect.objectContaining({
                        t: 'c',
                        name: 'general'
                    })
                ],
                { session: mockSession }
            );
        });

        it('should throw error if private group has no name', async () => {
            const input = {
                type: RoomType.PrivateGroup,
                memberIds: ['user-1'],
                usernames: ['Alice']
            };

            await expect(
                service.createRoom(input, 'user-1', mockSession)
            ).rejects.toThrow('Private groups require a name');
        });

        it('should work without session (backward compatibility)', async () => {
            const mockRoom = {
                _id: 'room-1',
                t: 'd'
            };

            vi.spyOn(directMessageModel, 'create').mockResolvedValue([
                mockRoom
            ] as any);

            const input = {
                type: RoomType.DirectMessages,
                memberIds: ['user-1', 'user-2'],
                usernames: ['Alice', 'Bob']
            };

            await service.createRoom(input, 'user-1'); // No session

            expect(directMessageModel.create).toHaveBeenCalledWith(
                expect.anything(),
                {} // Empty options when no session
            );
        });
    });

    describe('inviteToRoom', () => {
        it('should invite users to room with session', async () => {
            const mockRoom = {
                _id: 'room-1',
                memberIds: ['user-1', 'user-2'],
                usernames: ['Alice', 'Bob'],
                updatedAt: new Date(),
                save: vi.fn().mockResolvedValue(true)
            };

            vi.spyOn(roomModel, 'findById').mockReturnValue({
                session: vi.fn().mockResolvedValue(mockRoom)
            } as any);

            const input = {
                roomId: 'room-1',
                userIds: ['user-3'],
                usernames: ['Charlie']
            };

            const result = await service.inviteToRoom(input, mockSession);

            expect(result).toEqual(mockRoom);
            expect(mockRoom.memberIds).toContain('user-3');
            expect(mockRoom.usernames).toContain('Charlie');
            expect(mockRoom.save).toHaveBeenCalledWith({
                session: mockSession
            });
        });

        it('should throw error if room not found', async () => {
            vi.spyOn(roomModel, 'findById').mockReturnValue({
                session: vi.fn().mockResolvedValue(null)
            } as any);

            const input = {
                roomId: 'invalid-room',
                userIds: ['user-3'],
                usernames: ['Charlie']
            };

            await expect(
                service.inviteToRoom(input, mockSession)
            ).rejects.toThrow('Room invalid-room not found');
        });

        it('should skip duplicate members', async () => {
            const mockRoom = {
                _id: 'room-1',
                memberIds: ['user-1', 'user-2'],
                usernames: ['Alice', 'Bob'],
                save: vi.fn().mockResolvedValue(true)
            };

            vi.spyOn(roomModel, 'findById').mockReturnValue({
                session: vi.fn().mockResolvedValue(mockRoom)
            } as any);

            const input = {
                roomId: 'room-1',
                userIds: ['user-2'], // Already a member
                usernames: ['Bob']
            };

            const result = await service.inviteToRoom(input, mockSession);

            expect(result.memberIds).toHaveLength(2); // No change
            expect(mockRoom.save).not.toHaveBeenCalled(); // Not saved
        });

        it('should work without session (backward compatibility)', async () => {
            const mockRoom = {
                _id: 'room-1',
                memberIds: ['user-1'],
                usernames: ['Alice'],
                save: vi.fn().mockResolvedValue(true)
            };

            vi.spyOn(roomModel, 'findById').mockReturnValue({
                session: vi.fn().mockResolvedValue(mockRoom)
            } as any);

            const input = {
                roomId: 'room-1',
                userIds: ['user-2'],
                usernames: ['Bob']
            };

            await service.inviteToRoom(input); // No session

            expect(mockRoom.save).toHaveBeenCalledWith(); // Called without session
        });
    });
});
