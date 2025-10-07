import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { RoomType } from '@cbnsndwch/zrocket-contracts';

import { Room } from '../chat/entities/rooms/room-base.entity.js';

import { RoomAccessService } from './room-access.service.js';

describe('RoomAccessService', () => {
    let service: RoomAccessService;
    let roomModel: any; // Use any to allow for chainable query mocks

    // Mock data
    const userId = 'user-123';
    const publicChannelId = 'public-channel-456';
    const privateChatId = 'private-chat-789';
    const privateGroupId = 'private-group-012';

    beforeEach(async () => {
        // Create mock room model with chainable query methods
        const mockRoomModel = {
            findOne: vi.fn().mockReturnThis(),
            find: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            lean: vi.fn().mockReturnThis(),
            exec: vi.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoomAccessService,
                {
                    provide: getModelToken(Room.name),
                    useValue: mockRoomModel
                }
            ]
        }).compile();

        service = module.get<RoomAccessService>(RoomAccessService);
        roomModel = module.get(getModelToken(Room.name));
    });

    describe('userHasRoomAccess', () => {
        describe('Public Channels', () => {
            it('should return true for public channels without database query', async () => {
                const result = await service.userHasRoomAccess(
                    userId,
                    publicChannelId,
                    RoomType.PublicChannel
                );

                expect(result).toBe(true);
                // Verify no database query was made
                expect(roomModel.findOne).not.toHaveBeenCalled();
            });

            it('should return true for any user accessing public channels', async () => {
                const result1 = await service.userHasRoomAccess(
                    'user-1',
                    publicChannelId,
                    RoomType.PublicChannel
                );
                const result2 = await service.userHasRoomAccess(
                    'user-2',
                    publicChannelId,
                    RoomType.PublicChannel
                );

                expect(result1).toBe(true);
                expect(result2).toBe(true);
                expect(roomModel.findOne).not.toHaveBeenCalled();
            });
        });

        describe('Direct Messages', () => {
            it('should return true when user is a member of the chat', async () => {
                // Mock finding a room where user is a member
                vi.spyOn(roomModel, 'exec').mockResolvedValue({
                    _id: privateChatId
                } as any);

                const result = await service.userHasRoomAccess(
                    userId,
                    privateChatId,
                    RoomType.DirectMessages
                );

                expect(result).toBe(true);
                expect(roomModel.findOne).toHaveBeenCalledWith({
                    _id: privateChatId,
                    t: RoomType.DirectMessages,
                    memberIds: userId
                });
            });

            it('should return false when user is not a member of the chat', async () => {
                // Mock not finding a room (user not a member)
                vi.spyOn(roomModel, 'exec').mockResolvedValue(null);

                const result = await service.userHasRoomAccess(
                    userId,
                    privateChatId,
                    RoomType.DirectMessages
                );

                expect(result).toBe(false);
                expect(roomModel.findOne).toHaveBeenCalledWith({
                    _id: privateChatId,
                    t: RoomType.DirectMessages,
                    memberIds: userId
                });
            });

            it('should use efficient query with minimal projection', async () => {
                vi.spyOn(roomModel, 'exec').mockResolvedValue({
                    _id: privateChatId
                } as any);

                await service.userHasRoomAccess(
                    userId,
                    privateChatId,
                    RoomType.DirectMessages
                );

                // Verify query optimization
                expect(roomModel.select).toHaveBeenCalledWith('_id');
                expect(roomModel.lean).toHaveBeenCalled();
            });
        });

        describe('Private Groups', () => {
            it('should return true when user is a member of the group', async () => {
                vi.spyOn(roomModel, 'exec').mockResolvedValue({
                    _id: privateGroupId
                } as any);

                const result = await service.userHasRoomAccess(
                    userId,
                    privateGroupId,
                    RoomType.PrivateGroup
                );

                expect(result).toBe(true);
                expect(roomModel.findOne).toHaveBeenCalledWith({
                    _id: privateGroupId,
                    t: RoomType.PrivateGroup,
                    memberIds: userId
                });
            });

            it('should return false when user is not a member of the group', async () => {
                vi.spyOn(roomModel, 'exec').mockResolvedValue(null);

                const result = await service.userHasRoomAccess(
                    userId,
                    privateGroupId,
                    RoomType.PrivateGroup
                );

                expect(result).toBe(false);
            });
        });

        describe('Error Handling', () => {
            it('should return false on database error', async () => {
                vi.spyOn(roomModel, 'exec').mockRejectedValue(
                    new Error('Database connection failed')
                );

                const result = await service.userHasRoomAccess(
                    userId,
                    privateChatId,
                    RoomType.DirectMessages
                );

                expect(result).toBe(false);
            });

            it('should return false on timeout', async () => {
                vi.spyOn(roomModel, 'exec').mockRejectedValue(
                    new Error('Query timeout')
                );

                const result = await service.userHasRoomAccess(
                    userId,
                    privateChatId,
                    RoomType.DirectMessages
                );

                expect(result).toBe(false);
            });
        });
    });

    describe('getUserAccessibleRoomIds', () => {
        it('should return all public channels and user memberships', async () => {
            const mockRooms = [
                { _id: 'public-1' },
                { _id: 'public-2' },
                { _id: 'private-chat-1' },
                { _id: 'private-group-1' }
            ];

            vi.spyOn(roomModel, 'exec').mockResolvedValue(mockRooms as any);

            const result = await service.getUserAccessibleRoomIds(userId);

            expect(result).toEqual([
                'public-1',
                'public-2',
                'private-chat-1',
                'private-group-1'
            ]);
        });

        it('should query with correct filter for public channels and memberships', async () => {
            vi.spyOn(roomModel, 'exec').mockResolvedValue([]);

            await service.getUserAccessibleRoomIds(userId);

            expect(roomModel.find).toHaveBeenCalledWith({
                $or: [
                    { t: RoomType.PublicChannel },
                    { memberIds: userId }
                ]
            });
        });

        it('should use efficient query with minimal projection', async () => {
            vi.spyOn(roomModel, 'exec').mockResolvedValue([]);

            await service.getUserAccessibleRoomIds(userId);

            expect(roomModel.select).toHaveBeenCalledWith('_id');
            expect(roomModel.lean).toHaveBeenCalled();
        });

        it('should return empty array when user has no accessible rooms', async () => {
            vi.spyOn(roomModel, 'exec').mockResolvedValue([]);

            const result = await service.getUserAccessibleRoomIds(userId);

            expect(result).toEqual([]);
        });

        it('should handle large result sets efficiently', async () => {
            // Mock 1000 rooms
            const mockRooms = Array.from({ length: 1000 }, (_, i) => ({
                _id: `room-${i}`
            }));

            vi.spyOn(roomModel, 'exec').mockResolvedValue(mockRooms as any);

            const result = await service.getUserAccessibleRoomIds(userId);

            expect(result).toHaveLength(1000);
            expect(result[0]).toBe('room-0');
            expect(result[999]).toBe('room-999');
        });

        describe('Error Handling', () => {
            it('should return empty array on database error', async () => {
                vi.spyOn(roomModel, 'exec').mockRejectedValue(
                    new Error('Database connection failed')
                );

                const result =
                    await service.getUserAccessibleRoomIds(userId);

                expect(result).toEqual([]);
            });

            it('should return empty array on query timeout', async () => {
                vi.spyOn(roomModel, 'exec').mockRejectedValue(
                    new Error('Query timeout')
                );

                const result =
                    await service.getUserAccessibleRoomIds(userId);

                expect(result).toEqual([]);
            });

            it('should return empty array on invalid data', async () => {
                vi.spyOn(roomModel, 'exec').mockResolvedValue(null as any);

                const result =
                    await service.getUserAccessibleRoomIds(userId);

                expect(result).toEqual([]);
            });
        });
    });

    describe('Performance Considerations', () => {
        it('should handle concurrent access checks efficiently', async () => {
            vi.spyOn(roomModel, 'exec').mockResolvedValue({
                _id: privateChatId
            } as any);

            // Simulate concurrent access checks
            const promises = Array.from({ length: 10 }, (_, i) =>
                service.userHasRoomAccess(
                    `user-${i}`,
                    privateChatId,
                    RoomType.DirectMessages
                )
            );

            const results = await Promise.all(promises);

            expect(results).toHaveLength(10);
            results.forEach(result => expect(result).toBe(true));
        });

        it('should cache public channel access logic (no DB calls)', async () => {
            // Call multiple times for same public channel
            await service.userHasRoomAccess(
                userId,
                publicChannelId,
                RoomType.PublicChannel
            );
            await service.userHasRoomAccess(
                userId,
                publicChannelId,
                RoomType.PublicChannel
            );
            await service.userHasRoomAccess(
                userId,
                publicChannelId,
                RoomType.PublicChannel
            );

            // Should never query database for public channels
            expect(roomModel.findOne).not.toHaveBeenCalled();
        });
    });

    describe('Integration Scenarios', () => {
        it('should work with real-world user access patterns', async () => {
            // User is member of 2 private chats and 1 private group
            const mockUserRooms = [
                { _id: 'chat-1' },
                { _id: 'chat-2' },
                { _id: 'group-1' },
                { _id: 'public-general' }, // Public channel
                { _id: 'public-announcements' } // Public channel
            ];

            vi.spyOn(roomModel, 'exec').mockResolvedValue(
                mockUserRooms as any
            );

            const roomIds = await service.getUserAccessibleRoomIds(userId);

            expect(roomIds).toHaveLength(5);
            expect(roomIds).toContain('chat-1');
            expect(roomIds).toContain('chat-2');
            expect(roomIds).toContain('group-1');
            expect(roomIds).toContain('public-general');
            expect(roomIds).toContain('public-announcements');
        });

        it('should handle mixed room types in access check', async () => {
            // Check access to different room types
            vi.spyOn(roomModel, 'exec')
                .mockResolvedValueOnce({ _id: privateChatId } as any) // Has access to chat
                .mockResolvedValueOnce(null); // No access to group

            const chatAccess = await service.userHasRoomAccess(
                userId,
                privateChatId,
                RoomType.DirectMessages
            );
            const groupAccess = await service.userHasRoomAccess(
                userId,
                privateGroupId,
                RoomType.PrivateGroup
            );
            const channelAccess = await service.userHasRoomAccess(
                userId,
                publicChannelId,
                RoomType.PublicChannel
            );

            expect(chatAccess).toBe(true);
            expect(groupAccess).toBe(false);
            expect(channelAccess).toBe(true); // Public channels always accessible
        });
    });
});
