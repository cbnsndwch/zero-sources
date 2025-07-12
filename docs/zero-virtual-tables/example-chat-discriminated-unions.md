# Example: Rocket.Chat-Style System with Discriminated Unions

## Scenario Overview

This example demonstrates how to use discriminated unions to create a flexible chat system where multiple Zero tables are derived from a few MongoDB collections using type-based discrimination.

## MongoDB Collections Structure

### Collection: `rooms`
Contains different types of rooms discriminated by `type` field:

```typescript
// Direct message room
{
  _id: ObjectId("..."),
  type: "d",
  participantIds: ["user1", "user2"],
  createdAt: ISODate("..."),
  lastMessageAt: ISODate("..."),
  isArchived: false
}

// Private room (group)
{
  _id: ObjectId("..."),
  type: "p",
  name: "Project Alpha Team",
  participantIds: ["user1", "user2", "user3", "user4"],
  createdAt: ISODate("..."),
  lastMessageAt: ISODate("..."),
  isArchived: false
}

// Public room (channel)
{
  _id: ObjectId("..."),
  type: "c",
  name: "general",
  description: "General discussion channel",
  participantIds: ["user1", "user2", "user3", "user4", "user5"],
  createdAt: ISODate("..."),
  lastMessageAt: ISODate("..."),
  isArchived: false
}
```

### Collection: `messages`
Contains different types of messages discriminated by `type` field:

```typescript
// Text message
{
  _id: ObjectId("..."),
  type: "text",
  roomId: ObjectId("..."),
  senderId: "user1",
  content: "Hello, how are you?",
  createdAt: ISODate("..."),
  isDeleted: false
}

// Image upload message
{
  _id: ObjectId("..."),
  type: "image",
  roomId: ObjectId("..."),
  senderId: "user2",
  imageUrl: "https://storage.example.com/images/...",
  caption: "Check out this photo!",
  imageMetadata: {
    width: 1920,
    height: 1080,
    fileSize: 2048000,
    mimeType: "image/jpeg"
  },
  createdAt: ISODate("..."),
  isDeleted: false
}

// System message (not displayed in UI, carries signals)
{
  _id: ObjectId("..."),
  type: "system",
  roomId: ObjectId("..."),
  action: "user_joined",
  targetUserId: "user3",
  createdAt: ISODate("..."),
  metadata: {
    invitedBy: "user1"
  }
}
```

### Collection: `participants`
Contains different types of participants discriminated by `type` field:

```typescript
// Regular user participant
{
  _id: ObjectId("..."),
  type: "user",
  userId: "user1",
  roomId: ObjectId("..."),
  role: "member", // owner, admin, member
  joinedAt: ISODate("..."),
  lastReadAt: ISODate("..."),
  notificationSettings: {
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

Based on the configuration above, here are the corresponding Zero schema table definitions:

```typescript
import { table, string, boolean, json, number } from '@rocicorp/zero';

// Room tables
const chats = table('chats')
  .columns({
    id: string(),
    participantIds: json<string[]>(),
    createdAt: string(),
    lastMessageAt: string()
  })
  .primaryKey('id');

const groups = table('groups')
  .columns({
    id: string(),
    name: string(),
    participantIds: json<string[]>(),
    createdAt: string(),
    lastMessageAt: string()
  })
  .primaryKey('id');

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

// Message tables
const textMessages = table('textMessages')
  .columns({
    id: string(),
    roomId: string(),
    senderId: string(),
    content: string(),
    createdAt: string()
  })
  .primaryKey('id');

const imageMessages = table('imageMessages')
  .columns({
    id: string(),
    roomId: string(),
    senderId: string(),
    imageUrl: string(),
    caption: string().optional(),
    imageMetadata: json<{
      width: number;
      height: number;
      fileSize: number;
      mimeType: string;
    }>(),
    createdAt: string()
  })
  .primaryKey('id');

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

// Participant tables
const userParticipants = table('userParticipants')
  .columns({
    id: string(),
    userId: string(),
    roomId: string(),
    role: string(),
    joinedAt: string(),
    lastReadAt: string(),
    muted: boolean().optional()
  })
  .primaryKey('id');

const botParticipants = table('botParticipants')
  .columns({
    id: string(),
    botId: string(),
    roomId: string(),
    role: string(),
    joinedAt: string(),
    config: json<any>()
  })
  .primaryKey('id');
```

## Benefits of This Approach

### 1. **Clean Client Interface**
Clients can query specific entity types without complex filtering:
```typescript
// Get all public channels
const channels = z.query.channels;

// Get all text messages for a room
const textMessages = z.query.textMessages
  .where('roomId', roomId);

// Get all image messages for a room
const imageMessages = z.query.imageMessages
  .where('roomId', roomId);

// Get only user participants (no bots)
const humanParticipants = z.query.userParticipants
  .where('roomId', roomId);
```

### 2. **Efficient Data Transfer**
Only relevant fields are projected and transferred to Zero clients.

### 3. **Type Safety**
Each Zero table has a specific schema that matches its intended use case.

### 4. **Flexible Backend Schema**
MongoDB collections can evolve independently while maintaining clean Zero interfaces.

## Change Stream Processing

When a document changes in MongoDB:

1. **Rooms collection change**: 
   - Check if it matches `chats`, `groups`, or `channels` filters
   - Apply appropriate projections and route to matching Zero tables

2. **Messages collection change**:
   - Route to `textMessages`, `imageMessages`, or `systemMessages` based on type
   - Apply projections specific to each message type

3. **Participants collection change**:
   - Route to `userParticipants` or `botParticipants` based on type
   - Apply appropriate projections

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
