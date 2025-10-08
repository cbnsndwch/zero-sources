import { Logger } from '@nestjs/common';

import {
    type QueryContext,
    isAuthenticated,
    RoomType
} from '@cbnsndwch/zrocket-contracts';

import type { RoomAccessService } from './room-access.service.js';

/**
 * Result of a permission filter operation.
 *
 * Contains information needed by the get-queries handler to apply
 * appropriate filters to query ASTs.
 */
export interface PermissionFilterResult {
    /**
     * Whether the user is authorized to access any data for this query.
     * If false, the query should return an empty result set.
     */
    authorized: boolean;

    /**
     * Set of room IDs the user has access to.
     * Used to filter queries to only accessible rooms.
     * Empty array means no access or not applicable.
     */
    accessibleRoomIds?: string[];

    /**
     * Specific room ID being accessed (for single-room queries).
     * Used with hasAccess to determine if query should proceed.
     */
    roomId?: string;

    /**
     * Whether the user has access to a specific room (for single-room queries).
     * Only relevant when roomId is specified.
     */
    hasAccess?: boolean;

    /**
     * Room type being accessed (for permission logic).
     */
    roomType?: RoomType;
}

/**
 * Reusable permission filter functions for Zero synced queries.
 *
 * Provides consistent security rule application across all query types,
 * ensuring users can only access data they're authorized to see.
 *
 * @remarks
 * ## Architecture
 *
 * This class provides static methods that determine what data a user can access.
 * Each method:
 * 1. Checks if the user is authenticated
 * 2. For anonymous users: Returns unauthorized result
 * 3. For authenticated users: Uses RoomAccessService to get accessible room IDs
 * 4. Returns a PermissionFilterResult that the get-queries handler uses to filter the AST
 *
 * ## Performance
 *
 * - Target overhead: < 20ms per query
 * - Leverages MongoDB indexes via RoomAccessService
 * - Results can be cached within a single request
 *
 * ## Security
 *
 * - Anonymous users receive empty results for private data
 * - Public channels are accessible to all authenticated users
 * - Private rooms (chats/groups) require membership
 * - Messages inherit room access permissions
 *
 * @example
 * ```typescript
 * // In a get-queries handler:
 * const ctx = await auth.authenticateRequest(request);
 * const filterResult = await PermissionFilters.filterMyChats(
 *   ctx,
 *   roomAccessService
 * );
 *
 * if (!filterResult.authorized) {
 *   return emptyResultAST;
 * }
 *
 * // Apply filter to AST using accessibleRoomIds
 * modifyASTToFilterByRoomIds(ast, filterResult.accessibleRoomIds);
 * ```
 *
 * @see {@link https://github.com/cbnsndwch/zero-sources/issues/79 Issue #79 - Create Permission Filter Logic}
 */
export class PermissionFilters {
    private static readonly logger = new Logger(PermissionFilters.name);

    /**
     * Filter myChats query to only show chats where user is a member.
     *
     * @param ctx - Query context (may be undefined for anonymous users)
     * @param roomAccessService - Service to check room membership
     * @returns Permission filter result with accessible room IDs
     *
     * @remarks
     * ## Access Rules
     * - **Anonymous users**: Empty result set (no chats visible)
     * - **Authenticated users**: Only chats where user is in memberIds array
     *
     * ## Implementation
     * Uses RoomAccessService to get all accessible chat IDs, returns them
     * so the get-queries handler can filter the AST accordingly.
     *
     * ## Performance
     * - Single DB query via RoomAccessService (indexed)
     * - Expected overhead: < 10ms
     *
     * @example
     * ```typescript
     * const result = await PermissionFilters.filterMyChats(ctx, roomAccess);
     * if (!result.authorized) {
     *   return emptyResultAST;
     * }
     * // Use result.accessibleRoomIds to filter the query AST
     * ```
     */
    static async filterMyChats(
        ctx: QueryContext | undefined,
        roomAccessService: RoomAccessService
    ): Promise<PermissionFilterResult> {
        const startTime = Date.now();

        if (!isAuthenticated(ctx)) {
            this.logger.verbose('Anonymous user - denying access to chats');
            return {
                authorized: false,
                accessibleRoomIds: []
            };
        }

        try {
            // Get all accessible room IDs for the authenticated user
            const accessibleRoomIds =
                await roomAccessService.getUserAccessibleRoomIds(ctx.sub);

            const elapsed = Date.now() - startTime;
            this.logger.verbose(
                `Filtered myChats for user ${ctx.sub}: ${accessibleRoomIds.length} accessible rooms (${elapsed}ms)`
            );

            return {
                authorized: true,
                accessibleRoomIds
            };
        } catch (error) {
            this.logger.error(
                `Error filtering myChats for user ${ctx.sub}:`,
                error
            );
            // On error, deny access for security
            return {
                authorized: false,
                accessibleRoomIds: []
            };
        }
    }

    /**
     * Filter myGroups query to only show groups where user is a member.
     *
     * @param ctx - Query context (may be undefined for anonymous users)
     * @param roomAccessService - Service to check room membership
     * @returns Permission filter result with accessible room IDs
     *
     * @remarks
     * ## Access Rules
     * - **Anonymous users**: Empty result set (no groups visible)
     * - **Authenticated users**: Only groups where user is in memberIds array
     *
     * ## Implementation
     * Uses RoomAccessService to get all accessible group IDs, returns them
     * so the get-queries handler can filter the AST accordingly.
     *
     * ## Performance
     * - Single DB query via RoomAccessService (indexed)
     * - Expected overhead: < 10ms
     *
     * @example
     * ```typescript
     * const result = await PermissionFilters.filterMyGroups(ctx, roomAccess);
     * if (!result.authorized) {
     *   return emptyResultAST;
     * }
     * // Use result.accessibleRoomIds to filter the query AST
     * ```
     */
    static async filterMyGroups(
        ctx: QueryContext | undefined,
        roomAccessService: RoomAccessService
    ): Promise<PermissionFilterResult> {
        const startTime = Date.now();

        if (!isAuthenticated(ctx)) {
            this.logger.verbose('Anonymous user - denying access to groups');
            return {
                authorized: false,
                accessibleRoomIds: []
            };
        }

        try {
            // Get all accessible room IDs for the authenticated user
            const accessibleRoomIds =
                await roomAccessService.getUserAccessibleRoomIds(ctx.sub);

            const elapsed = Date.now() - startTime;
            this.logger.verbose(
                `Filtered myGroups for user ${ctx.sub}: ${accessibleRoomIds.length} accessible rooms (${elapsed}ms)`
            );

            return {
                authorized: true,
                accessibleRoomIds
            };
        } catch (error) {
            this.logger.error(
                `Error filtering myGroups for user ${ctx.sub}:`,
                error
            );
            // On error, deny access for security
            return {
                authorized: false,
                accessibleRoomIds: []
            };
        }
    }

    /**
     * Filter chatById query to only show chat if user is a member.
     *
     * @param ctx - Query context (may be undefined for anonymous users)
     * @param roomAccessService - Service to check room membership
     * @param chatId - The ID of the chat to check access for
     * @returns Permission filter result with access information
     *
     * @remarks
     * ## Access Rules
     * - **Anonymous users**: Empty result set (chat not visible)
     * - **Authenticated users**: Chat visible only if user is in memberIds array
     *
     * ## Implementation
     * Checks membership via RoomAccessService.userHasRoomAccess().
     *
     * ## Performance
     * - Single indexed DB lookup via RoomAccessService
     * - Expected overhead: < 5ms
     *
     * @example
     * ```typescript
     * const result = await PermissionFilters.filterChatById(ctx, roomAccess, chatId);
     * if (!result.authorized || !result.hasAccess) {
     *   return emptyResultAST;
     * }
     * ```
     */
    static async filterChatById(
        ctx: QueryContext | undefined,
        roomAccessService: RoomAccessService,
        chatId: string
    ): Promise<PermissionFilterResult> {
        const startTime = Date.now();

        if (!isAuthenticated(ctx)) {
            this.logger.verbose(
                `Anonymous user - denying access to chat ${chatId}`
            );
            return {
                authorized: false,
                roomId: chatId,
                hasAccess: false,
                roomType: RoomType.DirectMessages
            };
        }

        try {
            // Check if user has access to this specific chat
            const hasAccess = await roomAccessService.userHasRoomAccess(
                ctx.sub,
                chatId,
                RoomType.DirectMessages
            );

            const elapsed = Date.now() - startTime;
            this.logger.verbose(
                `User ${ctx.sub} ${hasAccess ? 'granted' : 'denied'} access to chat ${chatId} (${elapsed}ms)`
            );

            return {
                authorized: hasAccess,
                roomId: chatId,
                hasAccess,
                roomType: RoomType.DirectMessages
            };
        } catch (error) {
            this.logger.error(
                `Error filtering chatById for user ${ctx.sub}, chat ${chatId}:`,
                error
            );
            // On error, deny access for security
            return {
                authorized: false,
                roomId: chatId,
                hasAccess: false,
                roomType: RoomType.DirectMessages
            };
        }
    }

    /**
     * Filter groupById query to only show group if user is a member.
     *
     * @param ctx - Query context (may be undefined for anonymous users)
     * @param roomAccessService - Service to check room membership
     * @param groupId - The ID of the group to check access for
     * @returns Permission filter result with access information
     *
     * @remarks
     * ## Access Rules
     * - **Anonymous users**: Empty result set (group not visible)
     * - **Authenticated users**: Group visible only if user is in memberIds array
     *
     * ## Implementation
     * Checks membership via RoomAccessService.userHasRoomAccess().
     *
     * ## Performance
     * - Single indexed DB lookup via RoomAccessService
     * - Expected overhead: < 5ms
     *
     * @example
     * ```typescript
     * const result = await PermissionFilters.filterGroupById(ctx, roomAccess, groupId);
     * if (!result.authorized || !result.hasAccess) {
     *   return emptyResultAST;
     * }
     * ```
     */
    static async filterGroupById(
        ctx: QueryContext | undefined,
        roomAccessService: RoomAccessService,
        groupId: string
    ): Promise<PermissionFilterResult> {
        const startTime = Date.now();

        if (!isAuthenticated(ctx)) {
            this.logger.verbose(
                `Anonymous user - denying access to group ${groupId}`
            );
            return {
                authorized: false,
                roomId: groupId,
                hasAccess: false,
                roomType: RoomType.PrivateGroup
            };
        }

        try {
            // Check if user has access to this specific group
            const hasAccess = await roomAccessService.userHasRoomAccess(
                ctx.sub,
                groupId,
                RoomType.PrivateGroup
            );

            const elapsed = Date.now() - startTime;
            this.logger.verbose(
                `User ${ctx.sub} ${hasAccess ? 'granted' : 'denied'} access to group ${groupId} (${elapsed}ms)`
            );

            return {
                authorized: hasAccess,
                roomId: groupId,
                hasAccess,
                roomType: RoomType.PrivateGroup
            };
        } catch (error) {
            this.logger.error(
                `Error filtering groupById for user ${ctx.sub}, group ${groupId}:`,
                error
            );
            // On error, deny access for security
            return {
                authorized: false,
                roomId: groupId,
                hasAccess: false,
                roomType: RoomType.PrivateGroup
            };
        }
    }

    /**
     * Filter roomMessages query to only show messages if user has room access.
     *
     * @param ctx - Query context (may be undefined for anonymous users)
     * @param roomAccessService - Service to check room membership
     * @param roomId - The ID of the room to check access for
     * @param roomType - The type of the room (chat, channel, or group)
     * @returns Permission filter result with access information
     *
     * @remarks
     * ## Access Rules
     * - **Anonymous users**: Empty result set (no messages visible)
     * - **Public channels**: All authenticated users can see messages
     * - **Private rooms (chats/groups)**: Only members can see messages
     *
     * ## Implementation
     * For public channels, grants access immediately for authenticated users.
     * For private rooms, checks membership via RoomAccessService.userHasRoomAccess().
     *
     * ## Performance
     * - Public channels: O(1) - no DB query needed
     * - Private rooms: Single indexed DB lookup
     * - Expected overhead: < 5ms for private rooms, < 1ms for public channels
     *
     * @example
     * ```typescript
     * const result = await PermissionFilters.filterRoomMessages(
     *   ctx,
     *   roomAccess,
     *   roomId,
     *   RoomType.DirectMessages
     * );
     * if (!result.authorized || !result.hasAccess) {
     *   return emptyResultAST;
     * }
     * ```
     */
    static async filterRoomMessages(
        ctx: QueryContext | undefined,
        roomAccessService: RoomAccessService,
        roomId: string,
        roomType: RoomType
    ): Promise<PermissionFilterResult> {
        const startTime = Date.now();

        if (!isAuthenticated(ctx)) {
            this.logger.verbose(
                `Anonymous user - denying access to messages in room ${roomId}`
            );
            return {
                authorized: false,
                roomId,
                hasAccess: false,
                roomType
            };
        }

        // Public channels are accessible to all authenticated users
        if (roomType === RoomType.PublicChannel) {
            this.logger.verbose(
                `User ${ctx.sub} granted access to public channel ${roomId} messages (no DB query)`
            );
            return {
                authorized: true,
                roomId,
                hasAccess: true,
                roomType
            };
        }

        try {
            // For private rooms, check if user has access
            const hasAccess = await roomAccessService.userHasRoomAccess(
                ctx.sub,
                roomId,
                roomType
            );

            const elapsed = Date.now() - startTime;
            this.logger.verbose(
                `User ${ctx.sub} ${hasAccess ? 'granted' : 'denied'} access to messages in room ${roomId} (${elapsed}ms)`
            );

            return {
                authorized: hasAccess,
                roomId,
                hasAccess,
                roomType
            };
        } catch (error) {
            this.logger.error(
                `Error filtering roomMessages for user ${ctx.sub}, room ${roomId}:`,
                error
            );
            // On error, deny access for security
            return {
                authorized: false,
                roomId,
                hasAccess: false,
                roomType
            };
        }
    }

    /**
     * Filter searchMessages query to only show messages from rooms user has access to.
     *
     * @param ctx - Query context (may be undefined for anonymous users)
     * @param roomAccessService - Service to check room membership
     * @returns Permission filter result with accessible room IDs
     *
     * @remarks
     * ## Access Rules
     * - **Anonymous users**: Empty result set (no messages visible)
     * - **Authenticated users**: Only messages from rooms where user is a member
     *   or from public channels
     *
     * ## Implementation
     * Uses RoomAccessService to get all accessible room IDs, returns them
     * so the get-queries handler can filter messages to accessible rooms.
     *
     * ## Performance
     * - Single DB query via RoomAccessService (indexed)
     * - Expected overhead: < 10ms
     *
     * @example
     * ```typescript
     * const result = await PermissionFilters.filterSearchMessages(ctx, roomAccess);
     * if (!result.authorized) {
     *   return emptyResultAST;
     * }
     * // Use result.accessibleRoomIds to filter messages by roomId
     * ```
     */
    static async filterSearchMessages(
        ctx: QueryContext | undefined,
        roomAccessService: RoomAccessService
    ): Promise<PermissionFilterResult> {
        const startTime = Date.now();

        if (!isAuthenticated(ctx)) {
            this.logger.verbose(
                'Anonymous user - denying access to message search'
            );
            return {
                authorized: false,
                accessibleRoomIds: []
            };
        }

        try {
            // Get all accessible room IDs for the authenticated user
            const accessibleRoomIds =
                await roomAccessService.getUserAccessibleRoomIds(ctx.sub);

            const elapsed = Date.now() - startTime;
            this.logger.verbose(
                `Filtered searchMessages for user ${ctx.sub}: ${accessibleRoomIds.length} accessible rooms (${elapsed}ms)`
            );

            return {
                authorized: true,
                accessibleRoomIds
            };
        } catch (error) {
            this.logger.error(
                `Error filtering searchMessages for user ${ctx.sub}:`,
                error
            );
            // On error, deny access for security
            return {
                authorized: false,
                accessibleRoomIds: []
            };
        }
    }
}
