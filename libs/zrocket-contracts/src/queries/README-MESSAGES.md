# Message Queries

Zero synced query definitions for message-related data in ZRocket.

## Overview

This module provides synced queries for retrieving and searching messages across different room types (public channels, private groups, and direct messages). These queries integrate with Zero's server-side filtering to ensure users only see messages they have permission to access.

## Available Queries

### `roomMessages(roomId, roomType, limit?)`

Retrieves user messages for a specific room.

**Parameters:**
- `roomId: string` - The ID of the room to retrieve messages from
- `roomType: RoomType` - The type of room (DirectMessages, PublicChannel, or PrivateGroup)
- `limit?: number` - Maximum number of messages to return (default: 100)

**Access Control:**
- **Public channels**: Accessible to all authenticated users
- **Private groups/chats**: Accessible only to room members
- **Anonymous users**: Receive empty results

**Example:**
```typescript
import { useQuery } from '@rocicorp/zero/react';
import { roomMessages, RoomType } from '@cbnsndwch/zrocket-contracts/queries';

function MessageList({ roomId, roomType }) {
  const [messages] = useQuery(roomMessages(roomId, roomType));
  
  return (
    <div>
      {messages?.map(msg => (
        <MessageItem key={msg._id} message={msg} />
      ))}
    </div>
  );
}

// With custom limit
const [recentMessages] = useQuery(
  roomMessages(channelId, RoomType.PublicChannel, 50)
);
```

### `roomSystemMessages(roomId, roomType, limit?)`

Retrieves system messages (events) for a specific room.

**Parameters:**
- `roomId: string` - The ID of the room to retrieve system messages from
- `roomType: RoomType` - The type of room (DirectMessages, PublicChannel, or PrivateGroup)
- `limit?: number` - Maximum number of system messages to return (default: 100)

**Access Control:**
Same as `roomMessages` - respects room membership and access permissions.

**System message types include:**
- User joins/leaves
- Room settings changes
- Member additions/removals
- Other room events

**Example:**
```typescript
import { useQuery } from '@rocicorp/zero/react';
import { roomSystemMessages, RoomType } from '@cbnsndwch/zrocket-contracts/queries';

function SystemEvents({ roomId, roomType }) {
  const [systemMessages] = useQuery(
    roomSystemMessages(roomId, roomType, 20)
  );
  
  return (
    <div className="system-events">
      {systemMessages?.map(msg => (
        <SystemEvent key={msg._id} event={msg} />
      ))}
    </div>
  );
}
```

### `searchMessages(searchQuery)`

Searches for messages across all accessible rooms.

**Parameters:**
- `searchQuery: string` - The search string to find in message contents

**Access Control:**
- Only searches in public channels and private rooms where user is a member
- Performs full-text search on message contents (server-side)
- Anonymous users receive empty results

**Note:** The actual full-text search implementation depends on MongoDB text indexes and server-side query processing. The client-side implementation is limited and primarily serves as an interface definition.

**Example:**
```typescript
import { useQuery } from '@rocicorp/zero/react';
import { searchMessages } from '@cbnsndwch/zrocket-contracts/queries';

function MessageSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results] = useQuery(searchMessages(searchQuery));
  
  return (
    <div>
      <input
        type="search"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="Search messages..."
      />
      <div className="results">
        {results?.map(msg => (
          <SearchResult key={msg._id} message={msg} />
        ))}
      </div>
    </div>
  );
}
```

## RoomType Enum

The `RoomType` enum is re-exported from this module for convenience:

```typescript
import { RoomType } from '@cbnsndwch/zrocket-contracts/queries';

// Available values:
RoomType.DirectMessages  // 'd' - Direct message rooms
RoomType.PublicChannel   // 'c' - Public channel rooms
RoomType.PrivateGroup    // 'p' - Private group rooms
```

## Message Structure

### User Messages

User messages contain:
- `_id: string` - Unique message identifier
- `roomId: string` - ID of the room the message belongs to
- `sender: IUserSummary & IHasName` - Information about the message sender
- `contents: SerializedEditorState` - Message content in Lexical JSON format
- `createdAt: string` - ISO timestamp of when the message was created
- `updatedAt: string` - ISO timestamp of when the message was last updated
- `groupable?: boolean` - Whether the message can be grouped with adjacent messages
- `repliedBy?: string[]` - User IDs that have replied to this message
- `starredBy?: string[]` - User IDs that have starred this message
- `pinned?: boolean` - Whether the message is pinned
- `pinnedAt?: string` - When the message was pinned (if applicable)
- `pinnedBy?: IUserSummary` - Who pinned the message (if applicable)
- `attachments?: MessageAttachment[]` - File attachments, if any
- `reactions?: Record<string, IMessageReaction>` - Emoji reactions on the message

### System Messages

System messages contain:
- `_id: string` - Unique message identifier
- `roomId: string` - ID of the room the message belongs to
- `t: SystemMessageType` - The type of system message
- `createdAt: string` - ISO timestamp of when the event occurred
- `updatedAt: string` - ISO timestamp of when the event was last updated
- `data?: Dict` - Additional data specific to the system message type

## Server-Side Implementation

These queries are designed to work with Zero's server-side filtering capabilities. The actual filtering logic is implemented in the `/api/zero/get-queries` endpoint on the backend.

### Expected Server Behavior

1. **Authentication**: All queries should verify the user's authentication status via the query context
2. **Room Access**: Check if the user has permission to access the specified room:
   - Public channels: Allow all authenticated users
   - Private groups/chats: Check room membership
3. **Message Filtering**: Apply the appropriate filters based on roomId, roomType, and limit
4. **Search**: For `searchMessages`, perform MongoDB full-text search on message contents

### Implementation Checklist

When implementing server-side query handlers:

- [ ] Extract user ID from query context (`ctx.sub`)
- [ ] Verify room access permissions
- [ ] Apply pagination limits
- [ ] Order results by creation time
- [ ] Handle anonymous users appropriately
- [ ] Return empty results for unauthorized access
- [ ] Implement full-text search for `searchMessages` query

## Testing

To test these queries:

1. **Client-Side Testing**: Use the queries in React components with `useQuery`
2. **Server-Side Testing**: Verify proper filtering by checking results for different user contexts
3. **Permission Testing**: Ensure users can only see messages in rooms they have access to
4. **Search Testing**: Verify search results are accurate and properly filtered

## Related Documentation

- [Zero Synced Queries Documentation](https://rocicorp.dev/docs/zero/synced-queries)
- [Room Queries](./rooms.ts) - Related queries for room data
- [Query Context](./context.ts) - Authentication context for queries
- [Message Contracts](../messages/) - Message type definitions

## Future Enhancements

Potential improvements to these queries:

1. **Advanced Search**: Support for filters (by sender, date range, room type)
2. **Pagination**: Cursor-based pagination for large result sets
3. **Real-time Updates**: Optimistic updates for new messages
4. **Read Status**: Track and filter by read/unread status
5. **Thread Support**: Queries for threaded message conversations
