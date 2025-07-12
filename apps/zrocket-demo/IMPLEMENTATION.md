# ZRocket Demo - Discriminated Unions Implementation

## Overview

This document provides a comprehensive guide to the ZRocket demo implementation, showcasing how discriminated unions work with Zero and MongoDB to create multiple specialized Zero tables from shared MongoDB collections.

## Quick Start

To run the ZRocket demo:

```bash
# From the repository root
cd apps/zrocket-demo

# Run the demo (no MongoDB required)
PORT=8001 yarn demo

# Visit the demo endpoints
curl http://localhost:8001/zrocket
curl http://localhost:8001/zrocket/schema  
curl http://localhost:8001/zrocket/demo-queries
curl http://localhost:8001/zrocket/implementation
```

## Discriminated Union Architecture

### Core Concept

**Discriminated Unions** allow multiple Zero tables to be derived from a single MongoDB collection using type-based discrimination. Instead of having one Zero table per MongoDB collection, you can create specialized tables that represent different entity types within the same collection.

### Example: From 3 MongoDB Collections to 8 Zero Tables

**MongoDB Collections:**
1. `rooms` collection (3 entity types)
2. `messages` collection (3 entity types)  
3. `participants` collection (2 entity types)

**Zero Tables (8 specialized tables):**
1. `chats` - Direct message rooms (`type: 'd'`)
2. `groups` - Private group rooms (`type: 'p'`)
3. `channels` - Public channel rooms (`type: 'c'`)
4. `textMessages` - Text messages (`type: 'text'`)
5. `imageMessages` - Image messages (`type: 'image'`)
6. `systemMessages` - System messages (`type: 'system'`)
7. `userParticipants` - User participants (`type: 'user'`)
8. `botParticipants` - Bot participants (`type: 'bot'`)

## Implementation Details

### Zero Table Definition with Discriminated Unions

Each Zero table uses the `.from()` modifier with a JSON configuration:

```typescript
const chats = table('chats')
  .from(JSON.stringify({
    source: 'rooms',                          // Source MongoDB collection
    filter: { type: 'd', isArchived: false }, // Discriminator filter
    projection: { _id: 1, participantIds: 1, createdAt: 1, lastMessageAt: 1 }
  }))
  .columns({
    id: string(),
    participantIds: json<string[]>(),
    createdAt: string(),
    lastMessageAt: string()
  })
  .primaryKey('id');
```

### Configuration Format

The `.from()` JSON configuration has three key components:

1. **`source`**: The MongoDB collection name
2. **`filter`**: Discriminator criteria (determines which documents from the collection match this table)
3. **`projection`**: Field selection (determines which fields are included in this Zero table)

### MongoDB Change Stream Processing

When a MongoDB change source processes document changes:

1. **Parse configurations**: Extract JSON config from each table's `.from()` modifier
2. **Match collections**: Find tables with matching `source` collection
3. **Apply filters**: Check if changed document matches table's filter criteria  
4. **Apply projections**: Extract only the fields specified in projection
5. **Route to Zero tables**: Send projected data to appropriate table(s)

**Example Processing Flow:**
```typescript
// MongoDB document change
const changedDocument = {
  _id: ObjectId("..."),
  type: "c",           // Public channel
  name: "general", 
  isArchived: false,
  // ... other fields
};

// Change source finds all tables with source: 'rooms'
// Checks filters:
// - chats filter: { type: 'd', isArchived: false } ❌ (type doesn't match)
// - groups filter: { type: 'p', isArchived: false } ❌ (type doesn't match) 
// - channels filter: { type: 'c', isArchived: false } ✅ (matches!)

// Only 'channels' table receives this change
```

## Client Query Benefits

### Before (Traditional Approach)
```typescript
// Complex filtering required on client
const publicChannels = z.query.rooms
  .where('type', 'c')
  .where('isArchived', false);

const textMessages = z.query.messages
  .where('type', 'text')
  .where('isDeleted', false)
  .where('roomId', roomId);
```

### After (Discriminated Unions)
```typescript
// Clean, simple queries
const publicChannels = z.query.channels;  // Already filtered!

const textMessages = z.query.textMessages
  .where('roomId', roomId);  // Only text messages, no type filtering needed
```

## Key Benefits

1. **Type Safety**: Each table has a schema specific to its entity type
2. **Query Simplicity**: No complex filtering needed in client code
3. **Performance**: Only relevant fields are transferred via projections
4. **Flexibility**: MongoDB schema can evolve while maintaining clean Zero interfaces
5. **Scalability**: Different entity types can be optimized independently

## MongoDB Entity Schemas

### Room Entity (Discriminated by `type`)
```typescript
{
  _id: ObjectId,
  type: 'd' | 'p' | 'c',     // Discriminator
  name?: string,             // For private/public rooms
  description?: string,      // For public channels only
  participantIds: string[],
  isArchived: boolean,
  // ... timestamps
}
```

### Message Entity (Discriminated by `type`)
```typescript
{
  _id: ObjectId,
  type: 'text' | 'image' | 'system',  // Discriminator
  roomId: ObjectId,
  senderId?: string,
  content?: string,          // For text messages
  imageUrl?: string,         // For image messages
  imageMetadata?: object,    // For image messages
  action?: string,           // For system messages
  metadata?: object,         // For system messages
  isDeleted: boolean,
  // ... timestamps
}
```

### Participant Entity (Discriminated by `type`)
```typescript
{
  _id: ObjectId,
  type: 'user' | 'bot',      // Discriminator
  userId?: string,           // For user participants
  botId?: string,            // For bot participants
  roomId: ObjectId,
  role: string,
  joinedAt: Date,
  lastReadAt?: Date,         // For user participants
  notificationSettings?: object,  // For user participants
  config?: object,           // For bot participants
  // ... timestamps
}
```

## Future Extensions

This discriminated union approach enables future enhancements:

1. **Dynamic Table Creation**: New entity types can be added without changing MongoDB schema
2. **Conditional Projections**: Different projections based on document state
3. **Nested Discriminators**: Multiple levels of discrimination
4. **Cross-Collection Relationships**: Relationships between discriminated tables

## API Endpoints (Demo)

The ZRocket demo exposes several endpoints to showcase the implementation:

- **`GET /zrocket`** - Overview and concept explanation
- **`GET /zrocket/schema`** - Zero schema with discriminated union details
- **`GET /zrocket/demo-queries`** - Example queries and their benefits
- **`GET /zrocket/implementation`** - Technical implementation details

This implementation demonstrates the future direction for Zero with MongoDB change sources that can intelligently route data from collections to multiple specialized tables based on discriminator fields and projections.