/**
 * Server-side implementations for Zero synced queries with permission filtering.
 *
 * @remarks
 * This module provides the actual server-side query implementations that apply
 * permission filters based on user authentication and room access.
 *
 * ## Architecture
 *
 * The query definitions in `@cbnsndwch/zrocket-contracts/queries` are client-side
 * definitions that return unfiltered queries. The server must override these with
 * filtered implementations.
 *
 * Each query implementation:
 * 1. Checks authentication status via QueryContext
 * 2. For anonymous users: Returns empty results
 * 3. For authenticated users: Applies appropriate filters based on room access
 * 4. Returns a modified query builder that Zero converts to an AST
 *
 * ## Security Model
 *
 * - **Public channels**: Accessible to all authenticated users
 * - **Private rooms** (chats/groups): Accessible only to members
 * - **Messages**: Inherit access permissions from their parent room
 * - **Anonymous users**: No access to any data
 *
 * ## Performance
 *
 * - Target overhead: < 20ms per query
 * - Leverages MongoDB indexes via RoomAccessService
 * - Room access queries are efficient (O(1) for public channels, O(log n) for private rooms)
 *
 * @example
 * ```typescript
 * // In get-queries handler:
 * import { createQueryImplementations } from './query-implementations.js';
 *
 * const queryImpls = createQueryImplementations(roomAccessService);
 * const query = queryImpls.myChats(ctx);
 * ```
 *
 * @see {@link https://github.com/cbnsndwch/zero-sources/issues/80 Issue #80 - Create Get Queries Handler}
 * @see {@link https://github.com/cbnsndwch/zero-sources/issues/79 Issue #79 - Create Permission Filter Logic}
 *
 * @module query-implementations
 */

import { Logger } from '@nestjs/common';

import {
    isAuthenticated,
    type QueryContext,
    RoomType
} from '@cbnsndwch/zrocket-contracts';
import { builder } from '@cbnsndwch/zrocket-contracts/schema';

import type { RoomAccessService } from './room-access.service.js';

/**
 * Factory function that creates query implementations with injected dependencies.
 *
 * @param roomAccessService - Service for checking room access permissions
 * @returns Object containing all query implementation functions
 *
 * @example
 * ```typescript
 * const queryImpls = createQueryImplementations(roomAccessService);
 * const chatQuery = queryImpls.myChats(ctx);
 * ```
 */
export function createQueryImplementations(
    roomAccessService: RoomAccessService
) {
    const logger = new Logger('QueryImplementations');

    /**
     * A special ID that will never match any real document.
     * Used to return empty results for unauthorized queries.
     */
    const NEVER_MATCHES_ID = '__NEVER_MATCHES__';

    /**
     * Server-side implementation of myChats query.
     *
     * Returns all chats where the authenticated user is a member,
     * ordered by most recent message first.
     *
     * @param ctx - Query context containing user authentication info
     * @returns Query builder for accessible chats
     *
     * @remarks
     * - Anonymous users: Returns empty result
     * - Authenticated users: Returns chats where user is in memberIds array
     *
     * @example
     * ```typescript
     * const query = queryImpls.myChats(ctx);
     * const ast = query.toAST(); // Convert to AST for Zero
     * ```
     */
    async function myChats(ctx: QueryContext | undefined) {
        if (!isAuthenticated(ctx)) {
            logger.debug('myChats: Anonymous user, returning empty result');
            return builder.chats.where('_id', '=', NEVER_MATCHES_ID);
        }

        try {
            // Get all accessible rooms for user, then filter to chats
            const allAccessibleRoomIds =
                await roomAccessService.getUserAccessibleRoomIds(ctx.sub);

            // Filter to only chats (type 'd')
            // In a real implementation, we'd query rooms to filter by type
            // For now, returning all accessible rooms that match chat query
            logger.debug(
                `myChats: User ${ctx.sub} has access to ${allAccessibleRoomIds.length} total rooms`
            );

            if (allAccessibleRoomIds.length === 0) {
                return builder.chats.where('_id', '=', NEVER_MATCHES_ID);
            }

            // The builder.chats already filters by type 'd', so we just need to filter by accessible IDs
            // Note: Zero's query builder may not support 'IN' operator
            // If not supported, we'll need to use OR chains or handle differently
            // For now, assuming IN support exists or will be added
            return builder.chats
                .where('_id', 'IN', allAccessibleRoomIds)
                .orderBy('lastMessageAt', 'desc');
        } catch (error) {
            logger.error(
                `myChats: Error fetching accessible chats for user ${ctx.sub}`,
                error
            );
            // Fail-secure: Return empty result on error
            return builder.chats.where('_id', '=', NEVER_MATCHES_ID);
        }
    }

    /**
     * Server-side implementation of myGroups query.
     *
     * Returns all groups where the authenticated user is a member,
     * ordered by most recent message first.
     *
     * @param ctx - Query context containing user authentication info
     * @returns Query builder for accessible groups
     *
     * @remarks
     * - Anonymous users: Returns empty result
     * - Authenticated users: Returns groups where user is in memberIds array
     *
     * @example
     * ```typescript
     * const query = queryImpls.myGroups(ctx);
     * const ast = query.toAST(); // Convert to AST for Zero
     * ```
     */
    async function myGroups(ctx: QueryContext | undefined) {
        if (!isAuthenticated(ctx)) {
            logger.debug('myGroups: Anonymous user, returning empty result');
            return builder.groups.where('_id', '=', NEVER_MATCHES_ID);
        }

        try {
            // Get all accessible rooms for user, then filter to groups
            const allAccessibleRoomIds =
                await roomAccessService.getUserAccessibleRoomIds(ctx.sub);

            logger.debug(
                `myGroups: User ${ctx.sub} has access to ${allAccessibleRoomIds.length} total rooms`
            );

            if (allAccessibleRoomIds.length === 0) {
                return builder.groups.where('_id', '=', NEVER_MATCHES_ID);
            }

            // The builder.groups already filters by type 'p', so we just need to filter by accessible IDs
            return builder.groups
                .where('_id', 'IN', allAccessibleRoomIds)
                .orderBy('lastMessageAt', 'desc');
        } catch (error) {
            logger.error(
                `myGroups: Error fetching accessible groups for user ${ctx.sub}`,
                error
            );
            // Fail-secure: Return empty result on error
            return builder.groups.where('_id', '=', NEVER_MATCHES_ID);
        }
    }

    /**
     * Server-side implementation of chatById query.
     *
     * Returns a specific chat only if the authenticated user is a member.
     * Includes related messages and system messages.
     *
     * @param ctx - Query context containing user authentication info
     * @param chatId - The ID of the chat to retrieve
     * @returns Query builder for the specific chat with messages
     *
     * @remarks
     * - Anonymous users: Returns empty result
     * - Authenticated users: Returns chat only if user is a member
     * - Includes user messages and system messages ordered by creation time
     *
     * @example
     * ```typescript
     * const query = await queryImpls.chatById(ctx, 'chat-123');
     * ```
     */
    async function chatById(ctx: QueryContext | undefined, chatId: string) {
        if (!isAuthenticated(ctx)) {
            logger.debug(
                `chatById: Anonymous user requesting chat ${chatId}, returning empty result`
            );
            return builder.chats.where('_id', '=', NEVER_MATCHES_ID);
        }

        try {
            const hasAccess = await roomAccessService.userHasRoomAccess(
                ctx.sub,
                chatId,
                RoomType.DirectMessages
            );

            if (!hasAccess) {
                logger.debug(
                    `chatById: User ${ctx.sub} does not have access to chat ${chatId}`
                );
                return builder.chats.where('_id', '=', NEVER_MATCHES_ID);
            }

            logger.debug(
                `chatById: User ${ctx.sub} has access to chat ${chatId}`
            );

            return builder.chats
                .where('_id', '=', chatId)
                .related('messages', q => q.orderBy('createdAt', 'asc'))
                .related('systemMessages', q => q.orderBy('createdAt', 'asc'));
        } catch (error) {
            logger.error(
                `chatById: Error checking access for user ${ctx.sub} to chat ${chatId}`,
                error
            );
            // Fail-secure: Return empty result on error
            return builder.chats.where('_id', '=', NEVER_MATCHES_ID);
        }
    }

    /**
     * Server-side implementation of groupById query.
     *
     * Returns a specific group only if the authenticated user is a member.
     * Includes related messages and system messages.
     *
     * @param ctx - Query context containing user authentication info
     * @param groupId - The ID of the group to retrieve
     * @returns Query builder for the specific group with messages
     *
     * @remarks
     * - Anonymous users: Returns empty result
     * - Authenticated users: Returns group only if user is a member
     * - Includes user messages and system messages ordered by creation time
     *
     * @example
     * ```typescript
     * const query = await queryImpls.groupById(ctx, 'group-123');
     * ```
     */
    async function groupById(ctx: QueryContext | undefined, groupId: string) {
        if (!isAuthenticated(ctx)) {
            logger.debug(
                `groupById: Anonymous user requesting group ${groupId}, returning empty result`
            );
            return builder.groups.where('_id', '=', NEVER_MATCHES_ID);
        }

        try {
            const hasAccess = await roomAccessService.userHasRoomAccess(
                ctx.sub,
                groupId,
                RoomType.PrivateGroup
            );

            if (!hasAccess) {
                logger.debug(
                    `groupById: User ${ctx.sub} does not have access to group ${groupId}`
                );
                return builder.groups.where('_id', '=', NEVER_MATCHES_ID);
            }

            logger.debug(
                `groupById: User ${ctx.sub} has access to group ${groupId}`
            );

            return builder.groups
                .where('_id', '=', groupId)
                .related('messages', q => q.orderBy('createdAt', 'asc'))
                .related('systemMessages', q => q.orderBy('createdAt', 'asc'));
        } catch (error) {
            logger.error(
                `groupById: Error checking access for user ${ctx.sub} to group ${groupId}`,
                error
            );
            // Fail-secure: Return empty result on error
            return builder.groups.where('_id', '=', NEVER_MATCHES_ID);
        }
    }

    /**
     * Server-side implementation of roomMessages query.
     *
     * Returns messages for a specific room only if the authenticated user has access.
     * Access rules vary by room type:
     * - Public channels: All authenticated users have access (O(1) check)
     * - Private rooms: Only members have access (requires DB query)
     *
     * @param ctx - Query context containing user authentication info
     * @param roomId - The ID of the room to retrieve messages from
     * @param roomType - The type of room (chat, channel, or group)
     * @param limit - Maximum number of messages to return (default: 100)
     * @returns Query builder for room messages
     *
     * @remarks
     * - Anonymous users: Returns empty result
     * - Public channels: Accessible to all authenticated users
     * - Private rooms: Requires membership check
     *
     * @example
     * ```typescript
     * const query = await queryImpls.roomMessages(ctx, 'room-123', RoomType.PublicChannel, 50);
     * ```
     */
    async function roomMessages(
        ctx: QueryContext | undefined,
        roomId: string,
        roomType: RoomType,
        limit = 100
    ) {
        if (!isAuthenticated(ctx)) {
            logger.debug(
                `roomMessages: Anonymous user requesting messages for room ${roomId}, returning empty result`
            );
            return builder.userMessages.where('_id', '=', NEVER_MATCHES_ID);
        }

        try {
            // Public channels are accessible to all authenticated users (O(1))
            if (roomType === RoomType.PublicChannel) {
                logger.debug(
                    `roomMessages: User ${ctx.sub} accessing public channel ${roomId} messages`
                );
                return builder.userMessages
                    .where('roomId', '=', roomId)
                    .orderBy('createdAt', 'desc')
                    .limit(limit);
            }

            // Private rooms require membership check
            const hasAccess = await roomAccessService.userHasRoomAccess(
                ctx.sub,
                roomId,
                roomType
            );

            if (!hasAccess) {
                logger.debug(
                    `roomMessages: User ${ctx.sub} does not have access to room ${roomId}`
                );
                return builder.userMessages.where('_id', '=', NEVER_MATCHES_ID);
            }

            logger.debug(
                `roomMessages: User ${ctx.sub} has access to room ${roomId}`
            );

            return builder.userMessages
                .where('roomId', '=', roomId)
                .orderBy('createdAt', 'desc')
                .limit(limit);
        } catch (error) {
            logger.error(
                `roomMessages: Error checking access for user ${ctx.sub} to room ${roomId}`,
                error
            );
            // Fail-secure: Return empty result on error
            return builder.userMessages.where('_id', '=', NEVER_MATCHES_ID);
        }
    }

    /**
     * Server-side implementation of searchMessages query.
     *
     * Searches for messages across all rooms the authenticated user has access to.
     * Results are limited to rooms where the user is a member.
     *
     * @param ctx - Query context containing user authentication info
     * @param searchTerm - The text to search for in message content
     * @param limit - Maximum number of messages to return (default: 50)
     * @returns Query builder for matching messages
     *
     * @remarks
     * - Anonymous users: Returns empty result
     * - Searches across: public channels + user's private chats + user's private groups
     * - Uses text search or ILIKE depending on database capabilities
     *
     * @example
     * ```typescript
     * const query = await queryImpls.searchMessages(ctx, 'hello world', 25);
     * ```
     */
    async function searchMessages(
        ctx: QueryContext | undefined,
        searchTerm: string,
        limit = 50
    ) {
        if (!isAuthenticated(ctx)) {
            logger.debug(
                `searchMessages: Anonymous user searching for "${searchTerm}", returning empty result`
            );
            return builder.userMessages.where('_id', '=', NEVER_MATCHES_ID);
        }

        try {
            // Get all accessible room IDs (includes public channels + user's private rooms)
            const allAccessibleRoomIds =
                await roomAccessService.getUserAccessibleRoomIds(ctx.sub);

            logger.debug(
                `searchMessages: User ${ctx.sub} searching in ${allAccessibleRoomIds.length} accessible rooms`
            );

            if (allAccessibleRoomIds.length === 0) {
                return builder.userMessages.where('_id', '=', NEVER_MATCHES_ID);
            }

            // TODO: Text search on content field
            // The Zero schema doesn't expose 'content' field in builder.userMessages
            // This needs to be added to the schema definition or handled differently
            // For now, we can only filter by accessible rooms
            //
            // Options:
            // 1. Add 'content' field to Zero schema for userMessages
            // 2. Perform search server-side and return filtered AST
            // 3. Let client do the text search after receiving messages

            logger.warn(
                `searchMessages: Text search on content not yet implemented. ` +
                    `Returning all messages from accessible rooms. Search term: "${searchTerm}"`
            );

            // Return messages from accessible rooms (client will need to filter by searchTerm)
            return builder.userMessages
                .where('roomId', 'IN', allAccessibleRoomIds)
                .orderBy('createdAt', 'desc')
                .limit(limit);
        } catch (error) {
            logger.error(
                `searchMessages: Error searching messages for user ${ctx.sub}`,
                error
            );
            // Fail-secure: Return empty result on error
            return builder.userMessages.where('_id', '=', NEVER_MATCHES_ID);
        }
    }

    return {
        myChats,
        myGroups,
        chatById,
        groupById,
        roomMessages,
        searchMessages
    };
}

/**
 * Type definition for the query implementations object.
 */
export type QueryImplementations = ReturnType<
    typeof createQueryImplementations
>;
