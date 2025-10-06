import { syncedQueryWithContext } from '@rocicorp/zero';
import { z } from 'zod';

import { builder } from '../schema/index.js';
import { RoomType } from '../rooms/index.js';
import type { QueryContext } from './context.js';

/**
 * Zod schema for RoomType enum validation in queries.
 */
const roomTypeSchema = z.enum([
    RoomType.DirectMessages,
    RoomType.PublicChannel,
    RoomType.PrivateGroup
]);

/**
 * Query to retrieve user messages for a specific room.
 *
 * @param roomId - The ID of the room to retrieve messages from
 * @param roomType - The type of room (chat, channel, or group)
 * @param limit - Maximum number of messages to return (default: 100)
 *
 * @remarks
 * **Client-side**: Returns messages ordered by creation time (newest first)
 * **Server-side**: Filters messages based on room access permissions:
 * - Public channels: accessible to all authenticated users
 * - Private groups/chats: accessible only to room members
 *
 * Anonymous users receive empty results for all room types on the server.
 *
 * @example
 * ```typescript
 * // In a React component - get messages for a public channel:
 * import { useQuery } from '@rocicorp/zero/react';
 * import { roomMessages, RoomType } from '@cbnsndwch/zrocket-contracts/queries/messages';
 *
 * const [messages] = useQuery(roomMessages(channelId, RoomType.PublicChannel));
 *
 * // Get messages with a custom limit:
 * const [recentMessages] = useQuery(roomMessages(roomId, RoomType.DirectMessages, 50));
 * ```
 *
 * @see {@link https://rocicorp.dev/docs/zero/synced-queries Zero Synced Queries}
 */
export const roomMessages = syncedQueryWithContext(
    'roomMessages',
    z.tuple([
        z.string(), // roomId
        roomTypeSchema, // roomType
        z.number().int().positive().default(100) // limit with default
    ]),
    (
        _ctx: QueryContext,
        roomId: string,
        _roomType: RoomType,
        limit: number
    ) => {
        // Server-side implementation will verify room access before returning messages
        // Client-side shows messages optimistically if they exist locally
        return builder.userMessages
            .where('roomId', '=', roomId)
            .orderBy('createdAt', 'desc')
            .limit(limit);
    }
);

/**
 * Query to retrieve system messages for a specific room.
 *
 * @param roomId - The ID of the room to retrieve system messages from
 * @param roomType - The type of room (chat, channel, or group)
 * @param limit - Maximum number of system messages to return (default: 100)
 *
 * @remarks
 * System messages include events like user joins, leaves, room settings changes, etc.
 *
 * **Client-side**: Returns system messages ordered by creation time (newest first)
 * **Server-side**: Filters system messages based on room access permissions:
 * - Public channels: accessible to all authenticated users
 * - Private groups/chats: accessible only to room members
 *
 * Anonymous users receive empty results for all room types on the server.
 *
 * @example
 * ```typescript
 * // In a React component - get system messages for a room:
 * import { useQuery } from '@rocicorp/zero/react';
 * import { roomSystemMessages, RoomType } from '@cbnsndwch/zrocket-contracts/queries/messages';
 *
 * const [systemMessages] = useQuery(
 *   roomSystemMessages(roomId, RoomType.PrivateGroup)
 * );
 *
 * // Get system messages with a custom limit:
 * const [recentEvents] = useQuery(
 *   roomSystemMessages(roomId, RoomType.PublicChannel, 20)
 * );
 * ```
 *
 * @see {@link https://rocicorp.dev/docs/zero/synced-queries Zero Synced Queries}
 */
export const roomSystemMessages = syncedQueryWithContext(
    'roomSystemMessages',
    z.tuple([
        z.string(), // roomId
        roomTypeSchema, // roomType
        z.number().int().positive().default(100) // limit with default
    ]),
    (
        _ctx: QueryContext,
        roomId: string,
        _roomType: RoomType,
        limit: number
    ) => {
        // Server-side implementation will verify room access before returning system messages
        // Client-side shows system messages optimistically if they exist locally
        return builder.systemMessages
            .where('roomId', '=', roomId)
            .orderBy('createdAt', 'desc')
            .limit(limit);
    }
);

/**
 * Query to search messages across accessible rooms.
 *
 * @param searchQuery - The search string to find in message contents
 *
 * @remarks
 * **Client-side**: Returns messages matching the search query ordered by relevance
 * **Server-side**: Filters messages based on room access permissions and search query:
 * - Only searches in public channels and private rooms where user is a member
 * - Performs full-text search on message contents
 *
 * Anonymous users receive empty results on the server.
 *
 * **Note**: This query definition provides the interface. The actual full-text search
 * implementation depends on MongoDB text indexes and server-side query processing.
 * The client-side implementation is limited and primarily serves as a fallback.
 *
 * @example
 * ```typescript
 * // In a React component - search for messages:
 * import { useQuery } from '@rocicorp/zero/react';
 * import { searchMessages } from '@cbnsndwch/zrocket-contracts/queries/messages';
 *
 * const [results] = useQuery(searchMessages('project deadline'));
 * ```
 *
 * @see {@link https://rocicorp.dev/docs/zero/synced-queries Zero Synced Queries}
 */
export const searchMessages = syncedQueryWithContext(
    'searchMessages',
    z.tuple([z.string()]),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_ctx: QueryContext, _searchQuery: string) => {
        // Server-side implementation will:
        // 1. Verify user has access to rooms (using context)
        // 2. Perform full-text search on message contents
        // 3. Return messages ordered by relevance score

        // Client-side: Return all messages - actual search filtering happens server-side
        // The client query just defines the interface; server-side will apply the search
        return builder.userMessages.orderBy('createdAt', 'desc').limit(50);
    }
);
