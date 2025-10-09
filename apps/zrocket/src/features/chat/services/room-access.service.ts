import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { RoomType } from '@cbnsndwch/zrocket-contracts';

import { Room } from '../entities/rooms/room-base.entity.js';

/**
 * Service for managing room access and membership checks.
 *
 * Provides efficient methods to determine user access to rooms and retrieve
 * all accessible room IDs for a user. This service is optimized for use in
 * server-side query filtering for Zero synced queries.
 *
 * @remarks
 * ## Access Rules
 *
 * - **Public Channels** (`t: 'c'`): Always accessible to all users
 * - **Direct Messages** (`t: 'd'`): Only accessible to members (memberIds check)
 * - **Private Groups** (`t: 'p'`): Only accessible to members (memberIds check)
 *
 * ## Performance Optimization
 *
 * This service relies on MongoDB indexes for efficient queries:
 * - Index on `memberIds` for membership lookups
 * - Index on `t` (room type) for type-based filtering
 * - Composite index on `(t, memberIds)` for optimal performance
 *
 * Ensure these indexes exist in MongoDB:
 * ```javascript
 * db.rooms.createIndex({ memberIds: 1 })
 * db.rooms.createIndex({ t: 1 })
 * db.rooms.createIndex({ t: 1, memberIds: 1 })
 * ```
 *
 * @example
 * ```typescript
 * // Check access to a specific room
 * const hasAccess = await roomAccessService.userHasRoomAccess(
 *   'user-123',
 *   'room-456',
 *   RoomType.DirectMessages
 * );
 *
 * // Get all accessible room IDs for a user
 * const roomIds = await roomAccessService.getUserAccessibleRoomIds('user-123');
 * ```
 *
 * @see {@link https://github.com/cbnsndwch/zero-sources/issues/78 Issue #78 - Create Room Access Service}
 */
@Injectable()
export class RoomAccessService {
    private readonly logger = new Logger(RoomAccessService.name);

    constructor(
        @InjectModel(Room.name)
        private readonly roomModel: Model<Room>
    ) {}

    /**
     * Check if a user has access to a specific room.
     *
     * @param userId - The ID of the user to check access for
     * @param roomId - The ID of the room to check access to
     * @param roomType - The type of the room ('c', 'd', or 'p')
     * @returns True if the user has access to the room, false otherwise
     *
     * @remarks
     * ## Access Logic
     *
     * - **Public Channels** (`roomType === 'c'`): Returns `true` immediately without
     *   a database query, as public channels are accessible to all users
     * - **Private Rooms** (chats and groups): Queries MongoDB to check if the user
     *   is in the `memberIds` array
     *
     * ## Performance
     *
     * - Public channel check: O(1) - no database query
     * - Private room check: O(log n) - indexed lookup on (roomId, memberIds)
     *
     * @example
     * ```typescript
     * // Check access to a public channel (no DB query)
     * const hasChannelAccess = await service.userHasRoomAccess(
     *   'user-123',
     *   'general-channel',
     *   RoomType.PublicChannel
     * ); // Returns true immediately
     *
     * // Check access to a direct message (DB query)
     * const hasChatAccess = await service.userHasRoomAccess(
     *   'user-123',
     *   'dm-456',
     *   RoomType.DirectMessages
     * ); // Returns true only if user is in memberIds
     * ```
     */
    async userHasRoomAccess(
        userId: string,
        roomId: string,
        roomType: RoomType
    ): Promise<boolean> {
        // Public channels are always accessible - no database query needed
        if (roomType === RoomType.PublicChannel) {
            this.logger.verbose(
                `User ${userId} has access to public channel ${roomId} (no DB query)`
            );
            return true;
        }

        // For private rooms (chats and groups), check membership
        try {
            const room = await this.roomModel
                .findOne({
                    _id: roomId,
                    t: roomType,
                    memberIds: userId
                })
                .select('_id') // Only select _id for minimal data transfer
                .lean()
                .exec();

            const hasAccess = !!room;

            this.logger.verbose(
                `User ${userId} ${hasAccess ? 'has' : 'does not have'} access to room ${roomId} (type: ${roomType})`
            );

            return hasAccess;
        } catch (error) {
            this.logger.error(
                `Error checking room access for user ${userId}, room ${roomId}:`,
                error
            );
            // On error, deny access for security
            return false;
        }
    }

    /**
     * Get all room IDs that a user has access to.
     *
     * @param userId - The ID of the user to get accessible rooms for
     * @returns Array of room IDs that the user can access
     *
     * @remarks
     * ## Query Logic
     *
     * Returns room IDs for:
     * 1. All public channels (t: 'c')
     * 2. All private rooms where the user is a member (memberIds contains userId)
     *
     * ## Performance
     *
     * - Uses compound index on (t, memberIds) for optimal query performance
     * - Projects only _id field to minimize data transfer
     * - Uses `.lean()` for faster document serialization
     *
     * ## Use Case
     *
     * This method is primarily used in server-side query filtering to pre-filter
     * messages or other room-related data before sending to the client.
     *
     * @example
     * ```typescript
     * // Get all accessible room IDs for filtering
     * const roomIds = await service.getUserAccessibleRoomIds('user-123');
     *
     * // Use in message query filtering
     * const messages = await messageModel.find({
     *   roomId: { $in: roomIds }
     * });
     * ```
     */
    async getUserAccessibleRoomIds(userId: string): Promise<string[]> {
        try {
            const rooms = await this.roomModel
                .find({
                    $or: [
                        { t: RoomType.PublicChannel }, // All public channels
                        { memberIds: userId } // Private rooms where user is member
                    ]
                })
                .select('_id') // Only select _id for minimal data transfer
                .lean()
                .exec();

            const roomIds = rooms.map(room => room._id.toString());

            this.logger.verbose(
                `User ${userId} has access to ${roomIds.length} rooms`
            );

            return roomIds;
        } catch (error) {
            this.logger.error(
                `Error getting accessible rooms for user ${userId}:`,
                error
            );
            // On error, return empty array for security
            return [];
        }
    }
}
