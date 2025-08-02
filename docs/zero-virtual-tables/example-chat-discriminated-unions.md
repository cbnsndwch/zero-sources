# Example - ZRocket: A Rocket.Chat-Style Chat app with Discriminated Unions

## Scenario Overview

This example demonstrates how to use discriminated unions to create a flexible chat system where multiple Zero tables are derived from a few MongoDB collections using type-based discrimination.

## MongoDB Collections Structure

### Collection: `rooms`
Contains different types of rooms discriminated by `t` field:

```typescript
// Direct message room
{
  _id: ObjectId("..."),
  t: "d",
  memberIds: ["user1", "user2"],
  usernames: ["user1", "user2"],
  messageCount: 2,
  lastMessageAt: ISODate("..."),
  updatedAt: ISODate("...")
}

// Private room (group)
{
  _id: ObjectId("..."),
  t: "p",
  name: "Project Alpha Team",
  memberIds: ["user1", "user2", "user3", "user4"],
  usernames: ["user1", "user2", "user3", "user4"],
  messageCount: 1,
  lastMessageAt: ISODate("..."),
  updatedAt: ISODate("..."),
  description: "Private group for Project Alpha discussions",
  topic: "Project Alpha"
}

// Public room (channel)
{
  _id: ObjectId("..."),
  t: "c",
  name: "general",
  description: "General discussion channel",
  topic: "General chat",
  memberIds: ["user1", "user2", "user3", "user4", "user5"],
  usernames: ["user1", "user2", "user3", "user4", "user5"],
  messageCount: 2,
  lastMessageAt: ISODate("..."),
  updatedAt: ISODate("..."),
  featured: true,
  default: true
}
```

### Collection: `messages`
Contains different types of messages discriminated by presence/absence of `t` field:

```typescript
// User message (no 't' field)
{
  _id: ObjectId("..."),
  roomId: ObjectId("..."),
  ts: ISODate("..."),
  createdAt: ISODate("..."),
  sender: {
    id: "user1",
    name: "User One",
    username: "user1"
  },
  contents: {
    root: {
      children: [...], // Lexical JSON structure
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1
    }
  },
  hidden: false
}

// System message (has 't' field)
{
  roomId: ObjectId("..."),
  ts: ISODate("..."),
  t: "user_joined", // System message type
  data: {
    targetUserId: "user3",
    invitedBy: "user1"
  }
}
```

## Zero Schema Tables

The ZRocket implementation creates **separate Zero tables** that all map to the **same MongoDB collections** using discriminated union filters:

**Room Tables** (all from `rooms` collection):
- `chatsTable` → Direct messages with filter `{ t: 'd' }`
- `channelsTable` → Public channels with filter `{ t: 'c' }`  
- `groupsTable` → Private groups with filter `{ t: 'p' }`

**Message Tables** (all from `messages` collection):
- `messages` → User messages with filter `{ t: { $exists: false } }`
- `systemMessages` → System messages with filter `{ t: { $exists: true } }`
    muted: false,
    muteUntil: null
  }
}

// Bot participant
{
  _id: ObjectId("..."),
  type: "bot",
  botId: "notification_bot",
  roomId: ObjectId("..."),
  role: "bot",
  joinedAt: ISODate("..."),
  config: {
    autoRespond: true,
    triggers: ["@bot", "help"]
  }
}
```

## Zero Schema Configuration

```typescript
const chatSystemConfig: ZeroSchemaConfig = {
  tables: {
    // Room tables
    chats: {
      source: 'rooms',
      filter: { 
        type: 'd',
        isArchived: false 
      },
      projection: { 
        _id: 1, 
        participantIds: 1, 
        createdAt: 1, 
        lastMessageAt: 1 
      }
    },
    
    groups: {
      source: 'rooms',
      filter: { 
        type: 'p',
        isArchived: false 
      },
      projection: { 
        _id: 1, 
        name: 1, 
        participantIds: 1, 
        createdAt: 1, 
        lastMessageAt: 1
      }
    },
    
    channels: {
      source: 'rooms',
      filter: { 
        type: 'c',
        isArchived: false 
      },
      projection: { 
        _id: 1, 
        name: 1, 
        description: 1,
        participantIds: 1, 
        createdAt: 1, 
        lastMessageAt: 1
      }
    },

    // Message tables
    textMessages: {
      source: 'messages',
      filter: { 
        type: 'text',
        isDeleted: false 
      },
      projection: { 
        _id: 1, 
        roomId: 1, 
        senderId: 1, 
        content: 1, 
        createdAt: 1 
      }
    },
    
    imageMessages: {
      source: 'messages',
      filter: { 
        type: 'image',
        isDeleted: false 
      },
      projection: { 
        _id: 1, 
        roomId: 1, 
        senderId: 1, 
        imageUrl: 1, 
        caption: 1,
        imageMetadata: 1,
        createdAt: 1 
      }
    },
    
    systemMessages: {
      source: 'messages',
      filter: { 
        type: 'system' 
      },
      projection: { 
        _id: 1, 
        roomId: 1, 
        action: 1, 
        targetUserId: 1, 
        createdAt: 1,
        metadata: 1 
      }
    },

    // Participant tables
    userParticipants: {
      source: 'participants',
      filter: { 
        type: 'user' 
      },
      projection: { 
        _id: 1, 
        userId: 1, 
        roomId: 1, 
        role: 1, 
        joinedAt: 1, 
        lastReadAt: 1,
        'notificationSettings.muted': 1 
      }
    },
    
    botParticipants: {
      source: 'participants',
      filter: { 
        type: 'bot' 
      },
      projection: { 
        _id: 1, 
        botId: 1, 
        roomId: 1, 
        role: 1, 
        joinedAt: 1,
        config: 1 
      }
    }
  }
};
```

## Zero Schema Definitions

Using separate `TableMapping` objects alongside table definitions:

```typescript
import { table, string, boolean, json, number } from '@rocicorp/zero';
import type { TableMapping } from '@cbnsndwch/zero-contracts';

// Room tables with separate mapping configurations
const chats = table('chats')
  .columns({
    id: string(),
    participantIds: json<string[]>(),
    createdAt: string(),
    lastMessageAt: string()
  })
  .primaryKey('id');

const chatsMapping: TableMapping<IDirectMessageRoom> = {
  source: 'rooms',
  filter: { t: { $eq: 'd' }, isArchived: { $ne: true } },
  projection: { _id: 1, participantIds: 1, createdAt: 1, lastMessageAt: 1 }
};

const groups = table('groups')
  .columns({
    id: string(),
    name: string(),
    participantIds: json<string[]>(),
    createdAt: string(),
    lastMessageAt: string()
  })
  .primaryKey('id');

const groupsMapping: TableMapping<IPrivateGroupRoom> = {
  source: 'rooms',
  filter: { t: { $eq: 'p' }, isArchived: { $ne: true } },
  projection: { _id: 1, name: 1, participantIds: 1, createdAt: 1, lastMessageAt: 1 }
};

const channels = table('channels')
  .columns({
    id: string(),
    name: string(),
    description: string().optional(),
    participantIds: json<string[]>(),
    createdAt: string(),
    lastMessageAt: string()
  })
  .primaryKey('id');

const channelsMapping: TableMapping<IPublicChannelRoom> = {
  source: 'rooms',
  filter: { t: { $eq: 'c' }, isArchived: { $ne: true } },
// Message tables with separate mapping configurations
const userMessages = table('userMessages')
  .columns({
    id: string(),
    roomId: string(),
    senderId: string(),
    content: string(),
    createdAt: string()
  })
  .primaryKey('id');

const userMessagesMapping: TableMapping<IUserMessage> = {
  source: 'messages',
  filter: { t: { $in: ['USER', 'text'] }, isDeleted: { $ne: true } },
  projection: { _id: 1, roomId: 1, senderId: 1, content: 1, createdAt: 1 }
};

const systemMessages = table('systemMessages')
  .columns({
    id: string(),
    roomId: string(),
    action: string(),
    targetUserId: string().optional(),
    createdAt: string(),
    metadata: json<any>().optional()
  })
  .primaryKey('id');

const systemMessagesMapping: TableMapping<ISystemMessage> = {
  source: 'messages',
  filter: { t: { $exists: true, $nin: ['USER', 'text'] } },
  projection: { _id: 1, roomId: 1, action: 1, targetUserId: 1, createdAt: 1, metadata: 1 }
};

// Export table mappings for use by change source
export const mapping = {
  chats: chatsMapping,
  groups: groupsMapping,
  channels: channelsMapping,
  userMessages: userMessagesMapping,
  systemMessages: systemMessagesMapping
```

The MongoDB change source (or any future change source) can use these separate mapping configurations to:

1. **Identify the source collection** (`source: 'rooms'`, `source: 'messages'`, etc.)
2. **Apply discriminating filters** (`t: { $eq: 'd' }`, `t: { $in: ['USER', 'text'] }`, etc.)  
3. **Project only required fields** (reducing data transfer and processing)
4. **Route changes to appropriate Zero tables** based on filter matches

## Benefits of This Approach

### 1. **Clean Client Interface**
Clients can query specific entity types without complex filtering:
```typescript
// Get all public channels
const channels = z.query.channels;

// Get all user messages for a room
const userMessages = z.query.userMessages
  .where('roomId', roomId);

// Get all system messages for a room
const systemMessages = z.query.systemMessages
  .where('roomId', roomId);
```

### 2. **Efficient Data Transfer**
Only relevant fields are projected and transferred to Zero clients.

### 3. **Type Safety**
Each Zero table has a specific schema that matches its intended use case.

### 4. **Flexible Backend Schema**
MongoDB collections can evolve independently while maintaining clean Zero interfaces.

### 5. **Maintainable Configuration**
Table mappings are defined separately from schema definitions, making them easier to modify and maintain.

## Change Stream Processing with Mapping Configurations

When the MongoDB change source processes a document change:

1. **Access mapping configurations**: Retrieve the `TableMapping` objects for each Zero table
2. **Match source collections**: For a change in `rooms` collection, find all tables with `source: "rooms"`
3. **Apply filters**: Check if the changed document matches each table's filter criteria:
   - `chats`: `{ t: { $eq: 'd' }, isArchived: { $ne: true } }`
   - `groups`: `{ t: { $eq: 'p' }, isArchived: { $ne: true } }`  
   - `channels`: `{ t: { $eq: 'c' }, isArchived: { $ne: true } }`
4. **Apply projections**: For matching tables, apply the projection to extract only relevant fields
5. **Route to Zero tables**: Send the projected data to the appropriate Zero table(s)

### Example Processing Flow

```typescript
// When a room document changes in MongoDB:
const changedDocument = {
  _id: ObjectId("..."),
  t: "c",
  name: "general",
  description: "General discussion",
  isArchived: false,
  // ... other fields
};

// Change source processes all tables with source: 'rooms'
for (const [tableName, mapping] of Object.entries(mapping)) {
  if (mapping.source === 'rooms') {
    if (matchesFilter(changedDocument, mapping.filter)) {
      const projectedData = applyProjection(changedDocument, mapping.projection);
      routeToZeroTable(tableName, projectedData);
    }
  }
}

// Result: Only 'channels' table receives this change because:
// - t: "c" matches channels filter
// - isArchived: false matches channels filter  
// - type: "c" does NOT match chats or groups filters
```

## Query Examples

```typescript
// Get all public rooms with their user participants
const channelsWithUsers = z.query.channels
  .related('users', z.query.userParticipants
    .where('roomId', (room) => room.id)
  );

// Get recent text messages from direct message rooms
const recentDirectMessages = z.query.textMessages
  .where('roomId', 'in', 
    z.query.chats.select('id')
  )
  .orderBy('createdAt', 'desc')
  .limit(50);

// Get all media (images) shared in a private room
const roomImages = z.query.imageMessages
  .where('roomId', 'in',
    z.query.groups
      .where('name', 'Project Alpha Team')
      .select('id')
  )
  .orderBy('createdAt', 'desc');

// Get system messages for UI signals (but don't display them)
const systemEvents = z.query.systemMessages
  .where('roomId', roomId)
  .where('action', 'in', ['user_joined', 'user_left', 'room_created']);
```

This example demonstrates how discriminated unions enable a flexible, type-safe, and performant chat system architecture with Zero sync.
