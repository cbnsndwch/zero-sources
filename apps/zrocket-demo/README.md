# ZRocket Demo - Discriminated Unions with Zero and MongoDB

This demo showcases how to use **discriminated unions** to create multiple Zero tables from MongoDB collections using type-based discrimination, inspired by Rocket.Chat-style chat systems.

## Overview

ZRocket demonstrates the powerful concept of creating flexible, type-safe Zero schemas where multiple specialized tables are derived from a few MongoDB collections using discriminated unions. This approach enables:

- **Clean Client Interface**: Query specific entity types without complex filtering
- **Efficient Data Transfer**: Only relevant fields are projected and transferred
- **Type Safety**: Each Zero table has a specific schema for its use case
- **Flexible Backend Schema**: MongoDB collections can evolve independently

## Architecture

### MongoDB Collections

The demo uses three main MongoDB collections with discriminated union patterns:

1. **`rooms`** collection - discriminated by `type` field:
   - `type: 'd'` → Direct message rooms
   - `type: 'p'` → Private group rooms  
   - `type: 'c'` → Public channel rooms

2. **`messages`** collection - discriminated by `type` field:
   - `type: 'text'` → Text messages
   - `type: 'image'` → Image upload messages
   - `type: 'system'` → System/notification messages

3. **`participants`** collection - discriminated by `type` field:
   - `type: 'user'` → Human user participants
   - `type: 'bot'` → Bot participants

### Zero Tables

Each MongoDB collection maps to multiple specialized Zero tables:

**From `rooms` collection:**
- `chats` - Direct message rooms (`type: 'd'`)
- `groups` - Private group rooms (`type: 'p'`) 
- `channels` - Public channel rooms (`type: 'c'`)

**From `messages` collection:**
- `textMessages` - Text messages (`type: 'text'`)
- `imageMessages` - Image messages (`type: 'image'`)
- `systemMessages` - System messages (`type: 'system'`)

**From `participants` collection:**
- `userParticipants` - User participants (`type: 'user'`)
- `botParticipants` - Bot participants (`type: 'bot'`)

## Key Implementation Details

### Discriminated Union Configuration

Each Zero table uses the `.from()` modifier with a JSON configuration:

```typescript
const chats = table('chats')
  .from(JSON.stringify({
    source: 'rooms',                    // Source MongoDB collection
    filter: { type: 'd', isArchived: false },  // Discriminator filter
    projection: { _id: 1, participantIds: 1, createdAt: 1, lastMessageAt: 1 }  // Field projection
  }))
  .columns({
    id: string(),
    participantIds: json<string[]>(),
    createdAt: string(),
    lastMessageAt: string()
  })
  .primaryKey('id');
```

### Change Stream Processing

When the MongoDB change source processes document changes:

1. **Parse configurations**: Extract JSON config from each table's `.from()` modifier
2. **Match collections**: Find tables with matching `source` collection  
3. **Apply filters**: Check if changed document matches table's filter criteria
4. **Apply projections**: Extract only the fields specified in projection
5. **Route to Zero tables**: Send projected data to appropriate table(s)

## Running the Demo

### Prerequisites

- Node.js 22+
- Yarn 4+

### Quick Demo (No MongoDB Required)

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Build the libraries:**
   ```bash
   yarn build:libs
   ```

3. **Run the demo:**
   ```bash
   cd apps/zrocket-demo
   PORT=8001 yarn demo
   ```

4. **Explore the API:**
   ```bash
   # Overview and concept
   curl http://localhost:8001/zrocket

   # Schema structure
   curl http://localhost:8001/zrocket/schema

   # Example queries
   curl http://localhost:8001/zrocket/demo-queries

   # Implementation details
   curl http://localhost:8001/zrocket/implementation
   ```

### Full Demo with MongoDB (Optional)

For the complete experience with data seeding:

1. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

2. **Run with data seeding:**
   ```bash
   cd apps/zrocket-demo
   SEED_DATA=true yarn dev
   ```

### Environment Variables

- `MONGODB_URI` - MongoDB connection string (default: `mongodb://localhost:27017/zrocket-demo`)
- `SEED_DATA` - Set to `true` to seed sample data on startup
- `PORT` - Server port (default: 8001)

## API Endpoints

Once running, visit these endpoints to explore the demo:

- **`GET /zrocket`** - Demo overview and discriminated union explanation
- **`GET /zrocket/schema`** - Zero schema structure and table configurations
- **`GET /zrocket/data`** - Sample data grouped by discriminator types
- **`GET /zrocket/demo-queries`** - Example Zero queries and their MongoDB equivalents

## Example Queries

With the discriminated union setup, clients can query specific entity types cleanly:

```typescript
// Get all public channels (no filtering needed!)
const channels = z.query.channels;

// Get all text messages for a room
const textMessages = z.query.textMessages.where('roomId', roomId);

// Get all image messages for a room  
const imageMessages = z.query.imageMessages.where('roomId', roomId);

// Get only human participants (no bots)
const humanParticipants = z.query.userParticipants.where('roomId', roomId);

// Get channels with their user participants
const channelsWithUsers = z.query.channels
  .related('users', z.query.userParticipants
    .where('roomId', (room) => room.id)
  );
```

## Benefits Demonstrated

1. **Type Safety**: Each table has a schema specific to its entity type
2. **Query Simplicity**: No need for complex filtering in client code
3. **Performance**: Only relevant fields are transferred via projections
4. **Flexibility**: MongoDB schema can evolve while maintaining clean Zero interfaces
5. **Scalability**: Different entity types can be optimized independently

## Files Structure

```
apps/zrocket-demo/
├── src/
│   ├── features/zrocket/
│   │   ├── entities/          # MongoDB entity definitions
│   │   ├── schemas/           # Zero table schemas with discriminated unions
│   │   ├── controllers/       # Demo API endpoints
│   │   └── services/          # Data seeding service
│   ├── app.module.ts         # Main app module
│   └── main.ts               # Application entry point
└── README.md                 # This file
```

This implementation showcases the future direction for Zero with MongoDB change sources that can intelligently route data from collections to multiple specialized tables based on discriminator fields and projections.