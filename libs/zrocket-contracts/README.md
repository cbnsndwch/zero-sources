# @cbnsndwch/zrocket-contracts

> Complete Zero schema for ZRocket - demonstrating discriminated union tables and real-time chat

[![npm version](https://img.shields.io/npm/v/@cbnsndwch/zrocket-contracts.svg)](https://www.npmjs.com/package/@cbnsndwch/zrocket-contracts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE.md)

## Overview

`@cbnsndwch/zrocket-contracts` provides the complete Zero schema, table mappings, and permissions for ZRocket - a Rocket.Chat-style application that demonstrates advanced patterns for building real-time collaborative applications with Rocicorp Zero. It showcases discriminated union tables, polymorphic collections, and type-safe schema definitions.

## Features

- 🎯 **Discriminated Union Tables**: Multiple Zero tables from single MongoDB collections
- 💬 **Chat Application Schema**: Complete schema for rooms, messages, users, and participants
- 🏷️ **Room Types**: Separate tables for chats, groups, and channels from a single collection
- 📝 **Message Types**: User messages and system messages with distinct schemas
- 🔒 **Type Safety**: Full TypeScript support with proper type definitions
- 📊 **Rich Metadata**: Support for rich message content (Lexical JSON)
- 📤 **Schema Export**: Built-in configuration export for change sources
- ✅ **Production Ready**: Battle-tested schema patterns

## Installation

```bash
pnpm add @cbnsndwch/zrocket-contracts
```

**Peer Dependencies:**

```json
{
    "@rocicorp/zero": "*"
}
```

## Quick Start

### Import Complete Schema

```typescript
import { schema } from '@cbnsndwch/zrocket-contracts';
import { Zero } from '@rocicorp/zero';

const zero = new Zero({
    server: 'ws://localhost:4848',
    schema,
    userID: 'user-123'
});

// Query chats
const chats = await zero.query.chats
    .where('participantIds', 'has', 'user-123')
    .run();
```

### Import Individual Tables

```typescript
import {
    chatsTable,
    channelsTable,
    groupsTable,
    userMessagesTable,
    systemMessagesTable
} from '@cbnsndwch/zrocket-contracts';
```

### Import Table Mappings

```typescript
import { tableMappings } from '@cbnsndwch/zrocket-contracts';

console.log(tableMappings);
// {
//   chats: { collection: 'rooms', discriminator: { field: 'type', value: 'chat' } },
//   channels: { collection: 'rooms', discriminator: { field: 'type', value: 'channel' } },
//   ...
// }
```

## Schema Architecture

### Discriminated Union Pattern

ZRocket uses discriminated unions to create multiple Zero tables from single MongoDB collections:

#### Room Types (Single `rooms` Collection)

```typescript
// MongoDB: One collection
db.rooms.insertOne({
    _id: 'room-123',
    type: 'chat', // Discriminator field
    name: 'Team Chat',
    participantIds: ['user-1', 'user-2']
});

// Zero: Three separate tables
zero.query.chats.run(); // WHERE type = 'chat'
zero.query.channels.run(); // WHERE type = 'channel'
zero.query.groups.run(); // WHERE type = 'group'
```

#### Message Types (Single `messages` Collection)

```typescript
// MongoDB: One collection
db.messages.insertOne({
    _id: 'msg-123',
    type: 'user',      // Discriminator field
    content: { ... },  // Rich text content
    userId: 'user-1',
});

// Zero: Two separate tables
zero.query.userMessages.run()    // WHERE type = 'user'
zero.query.systemMessages.run()  // WHERE type = 'system'
```

## Schema Tables

### Room Tables

#### `chats` Table

Direct messages between two users.

```typescript
interface Chat {
    id: string;
    name: string;
    participantIds: string[];
    lastMessageAt: number;
    createdAt: number;
    updatedAt: number;
}
```

#### `channels` Table

Public or private channels for team communication.

```typescript
interface Channel {
    id: string;
    name: string;
    description?: string;
    isPrivate: boolean;
    participantIds: string[];
    lastMessageAt: number;
    createdAt: number;
    updatedAt: number;
}
```

#### `groups` Table

Group conversations with multiple participants.

```typescript
interface Group {
    id: string;
    name: string;
    participantIds: string[];
    lastMessageAt: number;
    createdAt: number;
    updatedAt: number;
}
```

### Message Tables

#### `userMessages` Table

Messages sent by users.

```typescript
interface UserMessage {
    id: string;
    roomId: string;
    userId: string;
    content: object; // Lexical JSON
    replyToId?: string;
    reactions?: Record<string, string[]>;
    createdAt: number;
    updatedAt: number;
}
```

#### `systemMessages` Table

System-generated messages (e.g., "User joined").

```typescript
interface SystemMessage {
    id: string;
    roomId: string;
    messageType: 'user_joined' | 'user_left' | 'room_created';
    metadata?: Record<string, unknown>;
    createdAt: number;
}
```

### Supporting Tables

#### `users` Table

```typescript
interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    status: 'online' | 'away' | 'offline';
    createdAt: number;
}
```

#### `participants` Table

```typescript
interface Participant {
    id: string;
    roomId: string;
    userId: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt: number;
}
```

## Configuration Export

### Export for Change Sources

The library includes scripts to export schema configuration for use with change sources:

```bash
# Export schema and mappings
pnpm build:schema
```

### Exported Files

- **`zrocket-schema.json`** - Complete Zero schema definition
- **`zrocket-table-mappings.json`** - MongoDB collection to Zero table mappings
- **`zrocket-permissions.json`** - Permission rules (if applicable)

### Use in Change Source

```yaml
# config.yml for zero-source-mongodb
schema:
    source: file
    schemaFile: ./schemas/zrocket-schema.json
    tableMappingsFile: ./schemas/zrocket-table-mappings.json

db:
    uri: mongodb://localhost:27017/zrocket
    db: zrocket
    publish: [rooms, messages, users, participants]
```

## Usage Examples

### Query Rooms by Type

```typescript
import { Zero } from '@rocicorp/zero';
import { schema } from '@cbnsndwch/zrocket-contracts';

const zero = new Zero({
    server: 'ws://localhost:4848',
    schema,
    userID: 'user-123'
});

// Get all chats for current user
const myChats = await zero.query.chats
    .where('participantIds', 'has', 'user-123')
    .orderBy('lastMessageAt', 'desc')
    .run();

// Get public channels
const publicChannels = await zero.query.channels
    .where('isPrivate', '=', false)
    .run();

// Get groups I'm in
const myGroups = await zero.query.groups
    .where('participantIds', 'has', 'user-123')
    .run();
```

### Query Messages

```typescript
// Get user messages for a room
const messages = await zero.query.userMessages
    .where('roomId', '=', 'room-123')
    .orderBy('createdAt', 'asc')
    .limit(50)
    .run();

// Get system messages
const systemMessages = await zero.query.systemMessages
    .where('roomId', '=', 'room-123')
    .run();

// Get messages with relationships
const messagesWithUsers = await zero.query.userMessages
    .related('user') // Automatically loads user data
    .where('roomId', '=', 'room-123')
    .run();
```

### Real-time Subscriptions

```typescript
// Subscribe to new messages
zero.query.userMessages
    .where('roomId', '=', 'room-123')
    .orderBy('createdAt', 'desc')
    .limit(50)
    .subscribe(messages => {
        console.log('Messages updated:', messages);
        // UI automatically updates
    });

// Subscribe to room changes
zero.query.chats.where('participantIds', 'has', 'user-123').subscribe(chats => {
    console.log('Chats updated:', chats);
});
```

## Benefits of This Pattern

### Single Source of Truth

- ✅ One MongoDB collection for all room types
- ✅ One MongoDB collection for all message types
- ✅ Simplified database schema

### Type Safety

- ✅ Distinct TypeScript types for each table
- ✅ Compile-time type checking
- ✅ IntelliSense support

### Query Optimization

- ✅ Zero automatically filters by discriminator
- ✅ Only fetch data you need
- ✅ Efficient indexes on discriminator fields

### Flexibility

- ✅ Add new room types without schema changes
- ✅ Different fields for different types
- ✅ Type-specific business logic

## Best Practices

1. **Indexing**: Create MongoDB indexes on discriminator fields

    ```javascript
    db.rooms.createIndex({ type: 1, lastMessageAt: -1 });
    db.messages.createIndex({ type: 1, roomId: 1, createdAt: -1 });
    ```

2. **Validation**: Use MongoDB schema validation for discriminated types

    ```javascript
    db.createCollection('rooms', {
        validator: {
            $jsonSchema: {
                properties: {
                    type: { enum: ['chat', 'channel', 'group'] }
                }
            }
        }
    });
    ```

3. **Migration**: Plan discriminator field migrations carefully

## Integration with ZRocket App

This package is used by the [ZRocket application](../../apps/zrocket) to demonstrate:

- Real-time chat with Rocicorp Zero
- Discriminated union patterns
- React Router 7 + NestJS integration
- MongoDB change streaming

See the [ZRocket README](../../apps/zrocket/README.md) for a complete working example.

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Export schema files
pnpm build:schema

# Run tests
pnpm test

# Lint code
pnpm lint
```

## Contributing

Contributions are welcome! Please see the [main repository](https://github.com/cbnsndwch/zero-sources) for contribution guidelines.

## License

MIT © [Sergio Leon](https://cbnsndwch.io)

## Related Packages

- [@cbnsndwch/zero-contracts](../zero-contracts) - Core contracts and utilities
- [@cbnsndwch/zero-source-mongodb](../zero-source-mongodb) - MongoDB change source
- [@cbnsndwch/zero-nest-mongoose](../zero-nest-mongoose) - Schema generation

## Resources

- [Rocicorp Zero Documentation](https://zero.rocicorp.dev/)
- [ZRocket Application](../../apps/zrocket)
- [Discriminated Unions Guide](../../docs/zero-virtual-tables/example-chat-discriminated-unions.md)
- [Architecture Documentation](../../docs/refactor/README-SEPARATED-ARCHITECTURE.md)
