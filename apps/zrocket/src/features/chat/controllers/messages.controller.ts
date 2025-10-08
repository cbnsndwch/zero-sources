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

import { MessageService } from '../services/message.service.js';
import { RoomAccessService } from '../services/room-access.service.js';

/**
 * Controller for message operations (REST + Zero synced queries).
 *
 * @remarks
 * This controller handles both:
 * - REST endpoints: Send messages (write operations)
 * - Zero synced queries: Read messages with permission filtering
 *
 * Synced queries provided:
 * - `roomMessages` - Messages for a specific room
 * - `searchMessages` - Search across accessible rooms
 */
@Controller('messages')
@UseGuards(JwtAuthGuard) // All operations require authentication
export class MessagesController {
    private readonly logger = new Logger(MessagesController.name);
    private readonly NEVER_MATCHES_ID = '__NEVER_MATCHES__';

    constructor(
        private readonly messageService: MessageService,
        private readonly roomAccessService: RoomAccessService
    ) {}

    /**
     * Send a new message to a room
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async sendMessage(
        @Body()
        body: {
            roomId: string;
            content: string;
            userId: string;
            username: string;
        }
    ) {
        this.logger.log('Sending message:', {
            roomId: body.roomId,
            userId: body.userId,
            contentLength: body.content?.length
        });

        try {
            const message = await this.messageService.sendMessage({
                roomId: body.roomId,
                content: body.content,
                userId: body.userId,
                username: body.username
            });

            this.logger.log('Message sent successfully:', {
                messageId: message._id,
                roomId: body.roomId
            });

            return {
                success: true,
                messageId: message._id,
                message: 'Message sent successfully'
            };
        } catch (error) {
            this.logger.error('Failed to send message:', {
                error: error.message,
                roomId: body.roomId,
                userId: body.userId
            });

            throw error;
        }
    }

    // ============================================================================
    // Zero Synced Queries - Read Operations with Permission Filtering
    // ============================================================================

    /**
     * Zero synced query: Get messages for a specific room.
     *
     * @param user - Authenticated user
     * @param roomId - The ID of the room
     * @param roomType - The type of room (channel, chat, or group)
     * @param limit - Maximum number of messages to return
     * @returns Query builder for room messages
     */
    @SyncedQuery(
        'roomMessages',
        z.tuple([z.string(), z.string(), z.number().optional()])
    )
    async roomMessages(
        @CurrentUser() user: JwtPayload,
        @QueryArg(0) roomId: string,
        @QueryArg(1) roomType: RoomType,
        @QueryArg(2) limit = 100
    ) {
        try {
            // Public channels are accessible to all authenticated users (O(1))
            if (roomType === 'c') {
                this.logger.debug(
                    `roomMessages: User ${user.sub} accessing public channel ${roomId} messages`
                );
                return builder.userMessages
                    .where('roomId', '=', roomId)
                    .orderBy('createdAt', 'desc')
                    .limit(limit);
            }

            // Private rooms require membership check
            const hasAccess = await this.roomAccessService.userHasRoomAccess(
                user.sub,
                roomId,
                roomType
            );

            if (!hasAccess) {
                this.logger.debug(
                    `roomMessages: User ${user.sub} does not have access to room ${roomId}`
                );
                return builder.userMessages.where(
                    '_id',
                    '=',
                    this.NEVER_MATCHES_ID
                );
            }

            this.logger.debug(
                `roomMessages: User ${user.sub} has access to room ${roomId}`
            );

            return builder.userMessages
                .where('roomId', '=', roomId)
                .orderBy('createdAt', 'desc')
                .limit(limit);
        } catch (error) {
            this.logger.error(
                `roomMessages: Error checking access for user ${user.sub} to room ${roomId}`,
                error
            );
            return builder.userMessages.where(
                '_id',
                '=',
                this.NEVER_MATCHES_ID
            );
        }
    }

    /**
     * Zero synced query: Search messages across accessible rooms.
     *
     * @param user - Authenticated user
     * @param searchTerm - The text to search for
     * @param limit - Maximum number of messages to return
     * @returns Query builder for matching messages
     *
     * @remarks
     * Text search on content field is not yet implemented in Zero schema.
     * Currently returns all messages from accessible rooms; client must filter.
     */
    @SyncedQuery('searchMessages', z.tuple([z.string(), z.number().optional()]))
    async searchMessages(
        @CurrentUser() user: JwtPayload,
        @QueryArg(0) searchTerm: string,
        @QueryArg(1) limit = 50
    ) {
        try {
            const allAccessibleRoomIds =
                await this.roomAccessService.getUserAccessibleRoomIds(user.sub);

            this.logger.debug(
                `searchMessages: User ${user.sub} searching in ${allAccessibleRoomIds.length} accessible rooms`
            );

            if (allAccessibleRoomIds.length === 0) {
                return builder.userMessages.where(
                    '_id',
                    '=',
                    this.NEVER_MATCHES_ID
                );
            }

            // TODO: Text search on content field
            // The Zero schema doesn't expose 'content' field in builder.userMessages
            // For now, return all messages from accessible rooms (client filters)
            this.logger.warn(
                `searchMessages: Text search on content not yet implemented. ` +
                    `Returning all messages from accessible rooms. Search term: "${searchTerm}"`
            );

            return builder.userMessages
                .where('roomId', 'IN', allAccessibleRoomIds)
                .orderBy('createdAt', 'desc')
                .limit(limit);
        } catch (error) {
            this.logger.error(
                `searchMessages: Error searching messages for user ${user.sub}`,
                error
            );
            return builder.userMessages.where(
                '_id',
                '=',
                this.NEVER_MATCHES_ID
            );
        }
    }
}
