import { useQuery } from '@rocicorp/zero/react';

import { roomMessages, RoomType } from '@cbnsndwch/zrocket-contracts';

/**
 * Hook to retrieve messages for a specific room using synced queries.
 *
 * @param roomId - The ID of the room to retrieve messages from
 * @param roomType - The type of room (DirectMessages, PublicChannel, or PrivateGroup)
 * @param limit - Maximum number of messages to return (default: 100)
 *
 * @returns Array of user messages sorted by creation time (oldest first)
 *
 * @remarks
 * This hook uses Zero's synced query system to fetch messages with proper
 * permission filtering on the server side:
 * - Public channels: accessible to all authenticated users
 * - Private groups/chats: accessible only to room members
 * - Anonymous users receive empty results
 *
 * Messages are automatically sorted by creation time (oldest first) to maintain
 * consistent display order in chat interfaces.
 *
 * @example
 * ```typescript
 * // In a React component - get messages for a public channel:
 * const messages = useRoomMessages(channelId, RoomType.PublicChannel);
 *
 * // Get messages for a private chat with custom limit:
 * const messages = useRoomMessages(chatId, RoomType.DirectMessages, 50);
 * ```
 */
export default function useRoomMessages(
    roomId: string | undefined,
    roomType: RoomType,
    limit: number = 100
) {
    // Handle undefined roomId by providing empty string
    // The query will be disabled when roomId is undefined
    // Context is provided by Zero framework at runtime on the server
    // Pass null as placeholder for client-side TypeScript compliance
    const query = roomMessages(null as any, roomId ?? '', roomType, limit);
    const [messages] = useQuery(query, { enabled: Boolean(roomId) });

    // Messages come from the query sorted desc (newest first) by the query definition
    // We need to reverse them to show oldest first for chat display
    // Handle both array results and single results
    const messagesArray = Array.isArray(messages)
        ? messages
        : messages
          ? [messages]
          : [];

    // Sort by creation time (oldest first) for proper chat display
    return messagesArray.sort(
        (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}
