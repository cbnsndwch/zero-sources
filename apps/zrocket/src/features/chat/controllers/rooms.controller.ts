import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Logger,
    Post,
    UseGuards
} from '@nestjs/common';
import { z } from 'zod';

import type { JwtPayload, RoomType } from '@cbnsndwch/zrocket-contracts';
import { builder } from '@cbnsndwch/zrocket-contracts/schema';
import { SyncedQuery, QueryArg } from '@cbnsndwch/nest-zero-synced-queries';

import { CurrentUser } from '../../auth/decorators/index.js';
import { JwtAuthGuard } from '../../auth/jwt/index.js';

import { RoomService } from '../services/room.service.js';
import { RoomAccessService } from '../services/room-access.service.js';

/**
 * Controller for room operations (REST + Zero synced queries).
 *
 * @remarks
 * This controller handles both:
 * - REST endpoints: Create/update rooms (write operations)
 * - Zero synced queries: Read room data with permission filtering
 *
 * Synced queries provided:
 * - `myChats` - User's accessible chats (authenticated)
 * - `myGroups` - User's accessible groups (authenticated)
 * - `chatById` - Specific chat with messages (authenticated)
 * - `groupById` - Specific group with messages (authenticated)
 * - `publicChannels` - All public channels (no auth required)
 * - `channelById` - Specific public channel with messages (no auth required)
 */
@Controller('rooms')
@UseGuards(JwtAuthGuard) // All operations require authentication
export class RoomsController {
    private readonly logger = new Logger(RoomsController.name);
    private readonly NEVER_MATCHES_ID = '__NEVER_MATCHES__';

    constructor(
        private readonly roomService: RoomService,
        private readonly roomAccessService: RoomAccessService
    ) {}

    /**
     * Create a new room
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createRoom(
        @Body()
        body: {
            type: RoomType;
            memberIds: string[];
            usernames: string[];
            name?: string;
            topic?: string;
            description?: string;
            readOnly?: boolean;
            createdBy: string;
        }
    ) {
        this.logger.log('Creating room:', {
            type: body.type,
            memberCount: body.memberIds?.length,
            createdBy: body.createdBy
        });

        try {
            const room = await this.roomService.createRoom(
                {
                    type: body.type,
                    memberIds: body.memberIds,
                    usernames: body.usernames,
                    name: body.name,
                    topic: body.topic,
                    description: body.description,
                    readOnly: body.readOnly
                },
                body.createdBy
            );

            this.logger.log('Room created successfully:', {
                roomId: room._id,
                type: body.type
            });

            return {
                success: true,
                roomId: room._id,
                message: 'Room created successfully'
            };
        } catch (error) {
            this.logger.error('Failed to create room:', {
                error: error.message,
                type: body.type,
                createdBy: body.createdBy
            });

            throw error;
        }
    }

    /**
     * Invite users to a room
     */
    @Post('invite')
    @HttpCode(HttpStatus.OK)
    async inviteToRoom(
        @Body()
        body: {
            roomId: string;
            userIds: string[];
            usernames: string[];
        }
    ) {
        this.logger.log('Inviting users to room:', {
            roomId: body.roomId,
            userCount: body.userIds?.length
        });

        try {
            await this.roomService.inviteToRoom({
                roomId: body.roomId,
                userIds: body.userIds,
                usernames: body.usernames
            });

            this.logger.log('Users invited successfully:', {
                roomId: body.roomId,
                userCount: body.userIds?.length
            });

            return {
                success: true,
                message: 'Users invited successfully'
            };
        } catch (error) {
            this.logger.error('Failed to invite users:', {
                error: error.message,
                roomId: body.roomId
            });

            throw error;
        }
    }

    // ============================================================================
    // Zero Synced Queries - Read Operations with Permission Filtering
    // ============================================================================

    /**
     * Zero synced query: Get all chats where user is a member.
     *
     * @param user - Authenticated user (auto-injected by JwtAuthGuard)
     * @returns Query builder for accessible chats
     */
    @SyncedQuery('myChats', z.tuple([]))
    async myChats(@CurrentUser() user: JwtPayload) {
        try {
            const allAccessibleRoomIds =
                await this.roomAccessService.getUserAccessibleRoomIds(user.sub);

            this.logger.debug(
                `myChats: User ${user.sub} has access to ${allAccessibleRoomIds.length} total rooms`
            );

            if (allAccessibleRoomIds.length === 0) {
                return builder.chats.where('_id', '=', this.NEVER_MATCHES_ID);
            }

            return builder.chats
                .where('_id', 'IN', allAccessibleRoomIds)
                .orderBy('lastMessageAt', 'desc');
        } catch (error) {
            this.logger.error(
                `myChats: Error fetching accessible chats for user ${user.sub}`,
                error
            );
            return builder.chats.where('_id', '=', this.NEVER_MATCHES_ID);
        }
    }

    /**
     * Zero synced query: Get all groups where user is a member.
     *
     * @param user - Authenticated user
     * @returns Query builder for accessible groups
     */
    @SyncedQuery('myGroups', z.tuple([]))
    async myGroups(@CurrentUser() user: JwtPayload) {
        try {
            const allAccessibleRoomIds =
                await this.roomAccessService.getUserAccessibleRoomIds(user.sub);

            this.logger.debug(
                `myGroups: User ${user.sub} has access to ${allAccessibleRoomIds.length} total rooms`
            );

            if (allAccessibleRoomIds.length === 0) {
                return builder.groups.where('_id', '=', this.NEVER_MATCHES_ID);
            }

            return builder.groups
                .where('_id', 'IN', allAccessibleRoomIds)
                .orderBy('lastMessageAt', 'desc');
        } catch (error) {
            this.logger.error(
                `myGroups: Error fetching accessible groups for user ${user.sub}`,
                error
            );
            return builder.groups.where('_id', '=', this.NEVER_MATCHES_ID);
        }
    }

    /**
     * Zero synced query: Get a specific chat by ID (with permission check).
     *
     * @param user - Authenticated user
     * @param chatId - The ID of the chat to retrieve
     * @returns Query builder for the chat with messages
     */
    @SyncedQuery('chatById', z.tuple([z.string()]))
    async chatById(
        @CurrentUser() user: JwtPayload,
        @QueryArg(0) chatId: string
    ) {
        try {
            const hasAccess = await this.roomAccessService.userHasRoomAccess(
                user.sub,
                chatId,
                'dm' as RoomType
            );

            if (!hasAccess) {
                this.logger.debug(
                    `chatById: User ${user.sub} does not have access to chat ${chatId}`
                );
                return builder.chats.where('_id', '=', this.NEVER_MATCHES_ID);
            }

            this.logger.debug(
                `chatById: User ${user.sub} has access to chat ${chatId}`
            );

            return builder.chats
                .where('_id', '=', chatId)
                .related('messages', q => q.orderBy('createdAt', 'asc'))
                .related('systemMessages', q => q.orderBy('createdAt', 'asc'));
        } catch (error) {
            this.logger.error(
                `chatById: Error checking access for user ${user.sub} to chat ${chatId}`,
                error
            );
            return builder.chats.where('_id', '=', this.NEVER_MATCHES_ID);
        }
    }

    /**
     * Zero synced query: Get a specific group by ID (with permission check).
     *
     * @param user - Authenticated user
     * @param groupId - The ID of the group to retrieve
     * @returns Query builder for the group with messages
     */
    @SyncedQuery('groupById', z.tuple([z.string()]))
    async groupById(
        @CurrentUser() user: JwtPayload,
        @QueryArg(0) groupId: string
    ) {
        try {
            const hasAccess = await this.roomAccessService.userHasRoomAccess(
                user.sub,
                groupId,
                'g' as RoomType
            );

            if (!hasAccess) {
                this.logger.debug(
                    `groupById: User ${user.sub} does not have access to group ${groupId}`
                );
                return builder.groups.where('_id', '=', this.NEVER_MATCHES_ID);
            }

            this.logger.debug(
                `groupById: User ${user.sub} has access to group ${groupId}`
            );

            return builder.groups
                .where('_id', '=', groupId)
                .related('messages', q => q.orderBy('createdAt', 'asc'))
                .related('systemMessages', q => q.orderBy('createdAt', 'asc'));
        } catch (error) {
            this.logger.error(
                `groupById: Error checking access for user ${user.sub} to group ${groupId}`,
                error
            );
            return builder.groups.where('_id', '=', this.NEVER_MATCHES_ID);
        }
    }

    /**
     * Zero synced query: Get all public channels (no authentication required).
     *
     * @remarks
     * Public channels are accessible to all users, including anonymous users.
     * No permission filtering is applied.
     *
     * @returns Query builder for all public channels ordered by name
     */
    @SyncedQuery('publicChannels', z.tuple([]))
    async publicChannels() {
        this.logger.debug('publicChannels: Fetching all public channels');
        return builder.channels.orderBy('name', 'asc');
    }

    /**
     * Zero synced query: Get a specific public channel by ID (no authentication required).
     *
     * @param channelId - The ID of the channel to retrieve
     *
     * @remarks
     * Public channels are accessible to all users, including anonymous users.
     * No permission filtering is applied.
     * Includes up to 100 most recent messages ordered by creation time.
     *
     * @returns Query builder for the channel with related messages
     */
    @SyncedQuery('channelById', z.tuple([z.string()]))
    async channelById(@QueryArg(0) channelId: string) {
        this.logger.debug(`channelById: Fetching public channel ${channelId}`);

        return builder.channels
            .where('_id', '=', channelId)
            .related('messages', q => q.orderBy('createdAt', 'desc').limit(100))
            .related('systemMessages', q =>
                q.orderBy('createdAt', 'desc').limit(100)
            );
    }
}
