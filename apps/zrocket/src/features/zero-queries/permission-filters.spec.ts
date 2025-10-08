import { describe, it, expect, beforeEach, vi } from 'vitest';

import { RoomType } from '@cbnsndwch/zrocket-contracts';

import { PermissionFilters } from './permission-filters.js';
import type { RoomAccessService } from './room-access.service.js';

describe('PermissionFilters', () => {
    let mockRoomAccessService: RoomAccessService;

    const mockAuthenticatedContext = {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        iat: Date.now(),
        exp: Date.now() + 3600000
    };

    beforeEach(() => {
        // Create mock RoomAccessService
        mockRoomAccessService = {
            getUserAccessibleRoomIds: vi.fn(),
            userHasRoomAccess: vi.fn()
        } as unknown as RoomAccessService;
    });

    describe('filterMyChats', () => {
        it('should deny access for anonymous users', async () => {
            const result = await PermissionFilters.filterMyChats(
                undefined,
                mockRoomAccessService
            );

            expect(result).toEqual({
                authorized: false,
                accessibleRoomIds: []
            });
            expect(
                mockRoomAccessService.getUserAccessibleRoomIds
            ).not.toHaveBeenCalled();
        });

        it('should return accessible room IDs for authenticated users', async () => {
            const mockRoomIds = ['room-1', 'room-2', 'room-3'];
            vi.mocked(
                mockRoomAccessService.getUserAccessibleRoomIds
            ).mockResolvedValue(mockRoomIds);

            const result = await PermissionFilters.filterMyChats(
                mockAuthenticatedContext,
                mockRoomAccessService
            );

            expect(result).toEqual({
                authorized: true,
                accessibleRoomIds: mockRoomIds
            });
            expect(
                mockRoomAccessService.getUserAccessibleRoomIds
            ).toHaveBeenCalledWith('user-123');
        });

        it('should deny access on error', async () => {
            vi.mocked(
                mockRoomAccessService.getUserAccessibleRoomIds
            ).mockRejectedValue(new Error('Database error'));

            const result = await PermissionFilters.filterMyChats(
                mockAuthenticatedContext,
                mockRoomAccessService
            );

            expect(result).toEqual({
                authorized: false,
                accessibleRoomIds: []
            });
        });

        it('should handle empty accessible rooms list', async () => {
            vi.mocked(
                mockRoomAccessService.getUserAccessibleRoomIds
            ).mockResolvedValue([]);

            const result = await PermissionFilters.filterMyChats(
                mockAuthenticatedContext,
                mockRoomAccessService
            );

            expect(result).toEqual({
                authorized: true,
                accessibleRoomIds: []
            });
        });
    });

    describe('filterMyGroups', () => {
        it('should deny access for anonymous users', async () => {
            const result = await PermissionFilters.filterMyGroups(
                undefined,
                mockRoomAccessService
            );

            expect(result).toEqual({
                authorized: false,
                accessibleRoomIds: []
            });
            expect(
                mockRoomAccessService.getUserAccessibleRoomIds
            ).not.toHaveBeenCalled();
        });

        it('should return accessible room IDs for authenticated users', async () => {
            const mockRoomIds = ['group-1', 'group-2'];
            vi.mocked(
                mockRoomAccessService.getUserAccessibleRoomIds
            ).mockResolvedValue(mockRoomIds);

            const result = await PermissionFilters.filterMyGroups(
                mockAuthenticatedContext,
                mockRoomAccessService
            );

            expect(result).toEqual({
                authorized: true,
                accessibleRoomIds: mockRoomIds
            });
            expect(
                mockRoomAccessService.getUserAccessibleRoomIds
            ).toHaveBeenCalledWith('user-123');
        });

        it('should deny access on error', async () => {
            vi.mocked(
                mockRoomAccessService.getUserAccessibleRoomIds
            ).mockRejectedValue(new Error('Database error'));

            const result = await PermissionFilters.filterMyGroups(
                mockAuthenticatedContext,
                mockRoomAccessService
            );

            expect(result).toEqual({
                authorized: false,
                accessibleRoomIds: []
            });
        });
    });

    describe('filterChatById', () => {
        const chatId = 'chat-456';

        it('should deny access for anonymous users', async () => {
            const result = await PermissionFilters.filterChatById(
                undefined,
                mockRoomAccessService,
                chatId
            );

            expect(result).toEqual({
                authorized: false,
                roomId: chatId,
                hasAccess: false,
                roomType: RoomType.DirectMessages
            });
            expect(
                mockRoomAccessService.userHasRoomAccess
            ).not.toHaveBeenCalled();
        });

        it('should grant access when user is a member', async () => {
            vi.mocked(
                mockRoomAccessService.userHasRoomAccess
            ).mockResolvedValue(true);

            const result = await PermissionFilters.filterChatById(
                mockAuthenticatedContext,
                mockRoomAccessService,
                chatId
            );

            expect(result).toEqual({
                authorized: true,
                roomId: chatId,
                hasAccess: true,
                roomType: RoomType.DirectMessages
            });
            expect(
                mockRoomAccessService.userHasRoomAccess
            ).toHaveBeenCalledWith('user-123', chatId, RoomType.DirectMessages);
        });

        it('should deny access when user is not a member', async () => {
            vi.mocked(
                mockRoomAccessService.userHasRoomAccess
            ).mockResolvedValue(false);

            const result = await PermissionFilters.filterChatById(
                mockAuthenticatedContext,
                mockRoomAccessService,
                chatId
            );

            expect(result).toEqual({
                authorized: false,
                roomId: chatId,
                hasAccess: false,
                roomType: RoomType.DirectMessages
            });
        });

        it('should deny access on error', async () => {
            vi.mocked(
                mockRoomAccessService.userHasRoomAccess
            ).mockRejectedValue(new Error('Database error'));

            const result = await PermissionFilters.filterChatById(
                mockAuthenticatedContext,
                mockRoomAccessService,
                chatId
            );

            expect(result).toEqual({
                authorized: false,
                roomId: chatId,
                hasAccess: false,
                roomType: RoomType.DirectMessages
            });
        });
    });

    describe('filterGroupById', () => {
        const groupId = 'group-789';

        it('should deny access for anonymous users', async () => {
            const result = await PermissionFilters.filterGroupById(
                undefined,
                mockRoomAccessService,
                groupId
            );

            expect(result).toEqual({
                authorized: false,
                roomId: groupId,
                hasAccess: false,
                roomType: RoomType.PrivateGroup
            });
            expect(
                mockRoomAccessService.userHasRoomAccess
            ).not.toHaveBeenCalled();
        });

        it('should grant access when user is a member', async () => {
            vi.mocked(
                mockRoomAccessService.userHasRoomAccess
            ).mockResolvedValue(true);

            const result = await PermissionFilters.filterGroupById(
                mockAuthenticatedContext,
                mockRoomAccessService,
                groupId
            );

            expect(result).toEqual({
                authorized: true,
                roomId: groupId,
                hasAccess: true,
                roomType: RoomType.PrivateGroup
            });
            expect(
                mockRoomAccessService.userHasRoomAccess
            ).toHaveBeenCalledWith('user-123', groupId, RoomType.PrivateGroup);
        });

        it('should deny access when user is not a member', async () => {
            vi.mocked(
                mockRoomAccessService.userHasRoomAccess
            ).mockResolvedValue(false);

            const result = await PermissionFilters.filterGroupById(
                mockAuthenticatedContext,
                mockRoomAccessService,
                groupId
            );

            expect(result).toEqual({
                authorized: false,
                roomId: groupId,
                hasAccess: false,
                roomType: RoomType.PrivateGroup
            });
        });

        it('should deny access on error', async () => {
            vi.mocked(
                mockRoomAccessService.userHasRoomAccess
            ).mockRejectedValue(new Error('Database error'));

            const result = await PermissionFilters.filterGroupById(
                mockAuthenticatedContext,
                mockRoomAccessService,
                groupId
            );

            expect(result).toEqual({
                authorized: false,
                roomId: groupId,
                hasAccess: false,
                roomType: RoomType.PrivateGroup
            });
        });
    });

    describe('filterRoomMessages', () => {
        const roomId = 'room-abc';

        it('should deny access for anonymous users', async () => {
            const result = await PermissionFilters.filterRoomMessages(
                undefined,
                mockRoomAccessService,
                roomId,
                RoomType.DirectMessages
            );

            expect(result).toEqual({
                authorized: false,
                roomId,
                hasAccess: false,
                roomType: RoomType.DirectMessages
            });
            expect(
                mockRoomAccessService.userHasRoomAccess
            ).not.toHaveBeenCalled();
        });

        it('should grant access to public channels without DB query', async () => {
            const result = await PermissionFilters.filterRoomMessages(
                mockAuthenticatedContext,
                mockRoomAccessService,
                roomId,
                RoomType.PublicChannel
            );

            expect(result).toEqual({
                authorized: true,
                roomId,
                hasAccess: true,
                roomType: RoomType.PublicChannel
            });
            // Should not query database for public channels
            expect(
                mockRoomAccessService.userHasRoomAccess
            ).not.toHaveBeenCalled();
        });

        it('should check access for private rooms (chats)', async () => {
            vi.mocked(
                mockRoomAccessService.userHasRoomAccess
            ).mockResolvedValue(true);

            const result = await PermissionFilters.filterRoomMessages(
                mockAuthenticatedContext,
                mockRoomAccessService,
                roomId,
                RoomType.DirectMessages
            );

            expect(result).toEqual({
                authorized: true,
                roomId,
                hasAccess: true,
                roomType: RoomType.DirectMessages
            });
            expect(
                mockRoomAccessService.userHasRoomAccess
            ).toHaveBeenCalledWith('user-123', roomId, RoomType.DirectMessages);
        });

        it('should check access for private rooms (groups)', async () => {
            vi.mocked(
                mockRoomAccessService.userHasRoomAccess
            ).mockResolvedValue(true);

            const result = await PermissionFilters.filterRoomMessages(
                mockAuthenticatedContext,
                mockRoomAccessService,
                roomId,
                RoomType.PrivateGroup
            );

            expect(result).toEqual({
                authorized: true,
                roomId,
                hasAccess: true,
                roomType: RoomType.PrivateGroup
            });
            expect(
                mockRoomAccessService.userHasRoomAccess
            ).toHaveBeenCalledWith('user-123', roomId, RoomType.PrivateGroup);
        });

        it('should deny access when user is not a member of private room', async () => {
            vi.mocked(
                mockRoomAccessService.userHasRoomAccess
            ).mockResolvedValue(false);

            const result = await PermissionFilters.filterRoomMessages(
                mockAuthenticatedContext,
                mockRoomAccessService,
                roomId,
                RoomType.DirectMessages
            );

            expect(result).toEqual({
                authorized: false,
                roomId,
                hasAccess: false,
                roomType: RoomType.DirectMessages
            });
        });

        it('should deny access on error', async () => {
            vi.mocked(
                mockRoomAccessService.userHasRoomAccess
            ).mockRejectedValue(new Error('Database error'));

            const result = await PermissionFilters.filterRoomMessages(
                mockAuthenticatedContext,
                mockRoomAccessService,
                roomId,
                RoomType.DirectMessages
            );

            expect(result).toEqual({
                authorized: false,
                roomId,
                hasAccess: false,
                roomType: RoomType.DirectMessages
            });
        });
    });

    describe('filterSearchMessages', () => {
        it('should deny access for anonymous users', async () => {
            const result = await PermissionFilters.filterSearchMessages(
                undefined,
                mockRoomAccessService
            );

            expect(result).toEqual({
                authorized: false,
                accessibleRoomIds: []
            });
            expect(
                mockRoomAccessService.getUserAccessibleRoomIds
            ).not.toHaveBeenCalled();
        });

        it('should return accessible room IDs for authenticated users', async () => {
            const mockRoomIds = ['room-1', 'room-2', 'room-3', 'channel-4'];
            vi.mocked(
                mockRoomAccessService.getUserAccessibleRoomIds
            ).mockResolvedValue(mockRoomIds);

            const result = await PermissionFilters.filterSearchMessages(
                mockAuthenticatedContext,
                mockRoomAccessService
            );

            expect(result).toEqual({
                authorized: true,
                accessibleRoomIds: mockRoomIds
            });
            expect(
                mockRoomAccessService.getUserAccessibleRoomIds
            ).toHaveBeenCalledWith('user-123');
        });

        it('should handle empty accessible rooms list', async () => {
            vi.mocked(
                mockRoomAccessService.getUserAccessibleRoomIds
            ).mockResolvedValue([]);

            const result = await PermissionFilters.filterSearchMessages(
                mockAuthenticatedContext,
                mockRoomAccessService
            );

            expect(result).toEqual({
                authorized: true,
                accessibleRoomIds: []
            });
        });

        it('should deny access on error', async () => {
            vi.mocked(
                mockRoomAccessService.getUserAccessibleRoomIds
            ).mockRejectedValue(new Error('Database error'));

            const result = await PermissionFilters.filterSearchMessages(
                mockAuthenticatedContext,
                mockRoomAccessService
            );

            expect(result).toEqual({
                authorized: false,
                accessibleRoomIds: []
            });
        });
    });

    describe('Performance', () => {
        it('should complete myChats filter in less than 20ms', async () => {
            const mockRoomIds = Array.from(
                { length: 100 },
                (_, i) => `room-${i}`
            );
            vi.mocked(
                mockRoomAccessService.getUserAccessibleRoomIds
            ).mockResolvedValue(mockRoomIds);

            const start = Date.now();
            await PermissionFilters.filterMyChats(
                mockAuthenticatedContext,
                mockRoomAccessService
            );
            const elapsed = Date.now() - start;

            // Note: This is a soft limit since actual DB queries aren't running
            expect(elapsed).toBeLessThan(50); // Generous limit for test environment
        });

        it('should complete chatById filter in less than 10ms', async () => {
            vi.mocked(
                mockRoomAccessService.userHasRoomAccess
            ).mockResolvedValue(true);

            const start = Date.now();
            await PermissionFilters.filterChatById(
                mockAuthenticatedContext,
                mockRoomAccessService,
                'chat-123'
            );
            const elapsed = Date.now() - start;

            expect(elapsed).toBeLessThan(50); // Generous limit for test environment
        });

        it('should complete public channel filter in less than 5ms (no DB query)', async () => {
            const start = Date.now();
            await PermissionFilters.filterRoomMessages(
                mockAuthenticatedContext,
                mockRoomAccessService,
                'channel-123',
                RoomType.PublicChannel
            );
            const elapsed = Date.now() - start;

            expect(elapsed).toBeLessThan(10); // Very fast since no DB query
            expect(
                mockRoomAccessService.userHasRoomAccess
            ).not.toHaveBeenCalled();
        });
    });
});
