/**
 * Zero synced query definitions for ZRocket.
 *
 * This module provides a centralized export point for all synced queries,
 * enabling server-side filtering and permission enforcement for channels,
 * rooms (chats and groups), and messages.
 *
 * @module queries
 *
 * @example
 * ```typescript
 * // Import all queries from a single entry point
 * import {
 *   publicChannels,
 *   channelById,
 *   myChats,
 *   myGroups,
 *   roomMessages,
 *   QueryContext,
 *   isAuthenticated
 * } from '@cbnsndwch/zrocket-contracts/queries';
 *
 * // Use in React components with useQuery hook
 * import { useQuery } from '@rocicorp/zero/react';
 *
 * function ChannelsList() {
 *   const [channels] = useQuery(publicChannels());
 *   return <div>{channels.map(ch => <div key={ch._id}>{ch.name}</div>)}</div>;
 * }
 *
 * function ChatsList() {
 *   const [chats] = useQuery(myChats());
 *   return <div>{chats.map(chat => <div key={chat._id}>{chat.name}</div>)}</div>;
 * }
 * ```
 *
 * @see {@link https://rocicorp.dev/docs/zero/synced-queries Zero Synced Queries Documentation}
 */

// Query context and type guards
export * from './context.js';

// Public channel queries (no authentication required)
export * from './channels.js';

// Private room queries (authentication required)
export * from './rooms.js';

// Message queries (permission-based)
export * from './messages.js';

// Re-export RoomType for convenience in query usage
export { RoomType } from '../rooms/index.js';
