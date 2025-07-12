# ZRocket Demo - Discriminated Union Tables

This demo showcases the implementation of discriminated union tables in Zero using MongoDB as the source. Multiple Zero tables are created from single MongoDB collections using filter-based discrimination.

## Architecture Overview

### Core Concept
Instead of the traditional 1:1 mapping between MongoDB collections and Zero tables, discriminated unions allow multiple Zero tables to be derived from a single MongoDB collection based on document characteristics.

### Implementation Components

1. **Discriminated Schema** (`libs/zchat-contracts/src/discriminated-schema.ts`)
   - Defines multiple Zero tables from single collections
   - Uses naming conventions to map table configurations

2. **Discriminated Change Maker** (`libs/zero-source-mongodb/src/v0/discriminated-change-maker-v0.ts`)
   - Routes MongoDB change stream events to appropriate Zero tables
   - Applies filters and projections during routing

3. **Table Service** (`libs/zero-source-mongodb/src/v0/discriminated-table.service.ts`)
   - Manages discriminated table configurations
   - Provides lookup and routing logic

4. **Filter Utilities** (`libs/zero-source-mongodb/src/utils/discriminated-union.ts`)
   - MongoDB-style filter matching
   - Document projection application
   - Nested field support

## Table Mappings

### From `rooms` Collection
- **chats**: Direct messages (`t: 'd'`, not archived)
- **groups**: Private groups (`t: 'p'`, not archived) 
- **channels**: Public channels (`t: 'c'`, not archived)

### From `messages` Collection
- **textMessages**: Text messages (`t: 'text'`, not hidden)
- **imageMessages**: Image messages (`t: 'image'`, not hidden)
- **systemMessages**: System events (`t: 'system'`)

### From `participants` Collection
- **userParticipants**: Human users (`type: 'user'`)
- **botParticipants**: Bot participants (`type: 'bot'`)

### Traditional Tables
- **users**: Direct 1:1 mapping (no discrimination)

## Running the Demo

### 1. Start ZRocket API Server
```bash
cd apps/zchat-api
pnpm run build
pnpm run start:zrocket
```

### 2. Start Zero Cache (Discriminated Schema)
```bash
cd apps/zchat-api  
pnpm run dev:zrocket:zero
```

### 3. Seed Sample Data
```bash
curl -X POST http://localhost:8012/zrocket/seed-data
```

### 4. View Demo Information
```bash
curl http://localhost:8012/zrocket/demo-info
```

## API Endpoints

- `GET /zrocket/demo-info` - Demo architecture information
- `POST /zrocket/seed-data` - Seeds sample MongoDB data
- `GET /zrocket/collections/{collection}` - View raw MongoDB data
- `GET /zrocket/tables` - List discriminated Zero tables
- `GET /api-docs` - Swagger API documentation

## Features Demonstrated

### Real-time Filtering
Documents are automatically routed to appropriate Zero tables based on filter criteria. When a room document with `t: 'c'` is inserted, it appears in the `channels` table but not in `chats` or `groups`.

### Projection Support
Only relevant fields are synced to each table. For example, `channels` includes `description` and `featured` fields, while `chats` includes `usernames` but not `description`.

### Dynamic Routing on Updates
When documents are updated and no longer match a filter, they're removed from that Zero table. If they now match a different filter, they're inserted into the appropriate table.

### Efficient Change Streams
A single MongoDB change stream monitors all source collections, reducing overhead compared to multiple streams.

## Technical Benefits

1. **Cleaner Client APIs**: Clients query specific entity types without complex filtering
2. **Efficient Data Transfer**: Only relevant fields are projected and synced
3. **Type Safety**: Each Zero table has a specific schema for its use case
4. **Flexible Backend Schema**: MongoDB collections can evolve independently
5. **Reduced Complexity**: Complex filtering happens at the change source level

## Testing

Run the discriminated union utility tests:
```bash
cd libs/zero-source-mongodb
pnpm test
```

## Sample Data Structure

The demo creates sample data including:
- 4 users (alice, bob, charlie, diana)
- 6 rooms (2 direct messages, 2 private groups, 2 public channels)
- 4 messages (2 text, 1 image, 1 system)
- 3 participants (2 users, 1 bot)

Each document type demonstrates different discriminated union routing scenarios.