import { syncedQueryWithContext } from '@rocicorp/zero';
import { z } from 'zod';

import { builder } from '../schema/index.js';
import type { QueryContext } from './context.js';

/**
 * Query to retrieve all private chats (direct messages) for the authenticated user.
 *
 * @remarks
 * **Client-side**: Returns all chats ordered by most recent message
 * **Server-side**: Filters to only chats where user is a member (implemented in get-queries endpoint)
 *
 * Anonymous users receive empty results on the server.
 *
 * @example
 * ```typescript
 * // In a React component:
 * import { useQuery } from '@rocicorp/zero/react';
 * import { myChats } from '@cbnsndwch/zrocket-contracts/queries/rooms';
 *
 * const [chats] = useQuery(myChats());
 * ```
 *
 * @see {@link https://rocicorp.dev/docs/zero/synced-queries Zero Synced Queries}
 */
export const myChats = syncedQueryWithContext(
    'myChats',
    z.tuple([]),
    (_ctx: QueryContext) => {
        // Server-side implementation will filter by membership (ctx.sub IN memberIds)
        // Client-side shows all chats optimistically
        return builder.chats.orderBy('lastMessageAt', 'desc');
    }
);

/**
 * Query to retrieve all private groups for the authenticated user.
 *
 * @remarks
 * **Client-side**: Returns all groups ordered by most recent message
 * **Server-side**: Filters to only groups where user is a member (implemented in get-queries endpoint)
 *
 * Anonymous users receive empty results on the server.
 *
 * @example
 * ```typescript
 * // In a React component:
 * import { useQuery } from '@rocicorp/zero/react';
 * import { myGroups } from '@cbnsndwch/zrocket-contracts/queries/rooms';
 *
 * const [groups] = useQuery(myGroups());
 * ```
 *
 * @see {@link https://rocicorp.dev/docs/zero/synced-queries Zero Synced Queries}
 */
export const myGroups = syncedQueryWithContext(
    'myGroups',
    z.tuple([]),
    (_ctx: QueryContext) => {
        // Server-side implementation will filter by membership (ctx.sub IN memberIds)
        // Client-side shows all groups optimistically
        return builder.groups.orderBy('lastMessageAt', 'desc');
    }
);

/**
 * Query to retrieve all private rooms for the authenticated user.
 *
 * @remarks
 * **Note**: This query currently returns only chats. It is an alias for {@link myChats}.
 * To retrieve both chats and groups, use {@link myChats} and {@link myGroups} separately.
 *
 * **Client-side**: Returns chats ordered by most recent message
 * **Server-side**: Filters to only chats where user is a member (implemented in get-queries endpoint)
 *
 * Anonymous users receive empty results on the server.
 *
 * @see {@link myChats}
 * @see {@link myGroups}
 * @see {@link https://rocicorp.dev/docs/zero/synced-queries Zero Synced Queries}
 */
export const myRooms = syncedQueryWithContext(
    'myRooms',
    z.tuple([]),
    (_ctx: QueryContext) => {
        // Return chats - in practice, use myChats() and myGroups() separately
        // Server-side implementation will filter by membership
        return builder.chats.orderBy('lastMessageAt', 'desc');
    }
);

/**
 * Query to retrieve a specific chat by ID for the authenticated user.
 *
 * @param chatId - The ID of the chat to retrieve
 *
 * @remarks
 * **Client-side**: Returns the chat with all messages if found
 * **Server-side**: Returns the chat only if user is a member (implemented in get-queries endpoint)
 *
 * Anonymous users or non-members receive empty results on the server.
 * Includes related user messages and system messages ordered by creation time.
 *
 * @example
 * ```typescript
 * // In a React component:
 * import { useQuery } from '@rocicorp/zero/react';
 * import { chatById } from '@cbnsndwch/zrocket-contracts/queries/rooms';
 *
 * const [chat] = useQuery(chatById(chatId));
 * ```
 *
 * @see {@link https://rocicorp.dev/docs/zero/synced-queries Zero Synced Queries}
 */
export const chatById = syncedQueryWithContext(
    'chatById',
    z.tuple([z.string()]),
    (_ctx: QueryContext, chatId: string) => {
        // Server-side implementation will verify membership before returning
        // Client-side shows chat optimistically if it exists locally
        return builder.chats
            .where('_id', '=', chatId)
            .related('messages', q => q.orderBy('createdAt', 'asc'))
            .related('systemMessages', q => q.orderBy('createdAt', 'asc'));
    }
);

/**
 * Query to retrieve a specific group by ID for the authenticated user.
 *
 * @param groupId - The ID of the group to retrieve
 *
 * @remarks
 * **Client-side**: Returns the group with all messages if found
 * **Server-side**: Returns the group only if user is a member (implemented in get-queries endpoint)
 *
 * Anonymous users or non-members receive empty results on the server.
 * Includes related user messages and system messages ordered by creation time.
 *
 * @example
 * ```typescript
 * // In a React component:
 * import { useQuery } from '@rocicorp/zero/react';
 * import { groupById } from '@cbnsndwch/zrocket-contracts/queries/rooms';
 *
 * const [group] = useQuery(groupById(groupId));
 * ```
 *
 * @see {@link https://rocicorp.dev/docs/zero/synced-queries Zero Synced Queries}
 */
export const groupById = syncedQueryWithContext(
    'groupById',
    z.tuple([z.string()]),
    (_ctx: QueryContext, groupId: string) => {
        // Server-side implementation will verify membership before returning
        // Client-side shows group optimistically if it exists locally
        return builder.groups
            .where('_id', '=', groupId)
            .related('messages', q => q.orderBy('createdAt', 'asc'))
            .related('systemMessages', q => q.orderBy('createdAt', 'asc'));
    }
);
