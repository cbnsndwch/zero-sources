# Zero Read-Only Architecture

This document describes the simplified architecture where Zero is used only for reads (queries) and regular REST APIs are used for writes.

## Architecture Overview

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└─────┬───────┘
      │
      ├─────────── READ  ───────────┐
      │                             │
      │  ┌──────────────────┐      │
      │  │   Zero Client    │      │
      └──┤  (Reactive Sync) │◄─────┤
         └──────────────────┘      │
                                   │
      ┌─────────── WRITE ─────────┐│
      │                            ││
      ▼                            ││
┌─────────────┐              ┌────▼▼────────┐
│   REST API  │              │  Zero Cache   │
│ Controllers │              │  (Sync Server)│
└──────┬──────┘              └───────┬───────┘
       │                             │
       │                             │
       ▼                             │
┌─────────────┐              ┌──────▼────────┐
│  MongoDB    │──────CDC────►│  Zero Source  │
│  (Primary)  │              │  (Connector)  │
└─────────────┘              └───────────────┘
```

## How It Works

### Reading Data (Zero Queries)

1. Client uses Zero queries to read data
2. Zero returns local data instantly (if available)
3. Zero syncs with server in background
4. Queries automatically update when data changes
5. All clients see updates in real-time

**Example:**

```typescript
// Reactive query - updates automatically
const [messages] = useQuery(
    z.query.messages.where('roomId', currentRoomId).orderBy('createdAt', 'desc')
);
```

### Writing Data (REST API)

1. Client calls REST API endpoint
2. NestJS controller receives request
3. Service validates and writes to MongoDB
4. MongoDB CDC (Change Data Capture) detects change
5. Zero Source connector pushes change to Zero Cache
6. Zero Cache updates all connected clients
7. Client queries automatically update

**Example:**

```typescript
// REST API call for write
await sendMessage({
    roomId: 'room-123',
    content: 'Hello!',
    userId: 'user-456',
    username: 'Alice'
});

// Query will automatically update when MongoDB change is detected
```

## Benefits of This Approach

### ✅ Advantages

1. **Simpler to understand** - Clear separation between reads and writes
2. **Easier debugging** - Standard REST APIs use familiar patterns
3. **Better error handling** - REST errors are well-understood
4. **Works with existing tools** - Use any REST client for testing
5. **No mutation retry issues** - Server processes each request once
6. **Standard validation** - Use NestJS validators and pipes
7. **Familiar patterns** - Most developers know REST APIs

### ⚠️ Trade-offs

1. **Not instant writes** - There's a small delay (100-500ms) between write and UI update
2. **No optimistic updates** - UI updates only after server confirms
3. **Network required** - Cannot write while offline (but can still read cached data)

## Implementation

### Server-Side

#### REST Controllers

Located in `apps/zrocket/src/features/chat/controllers/`:

- **`messages.controller.ts`** - Handles message operations
    - `POST /api/messages` - Send a message
- **`rooms.controller.ts`** - Handles room operations
    - `POST /api/rooms` - Create a room
    - `POST /api/rooms/invite` - Invite users to a room

#### Services

Services remain unchanged - they just write to MongoDB:

- **`message.service.ts`** - Message business logic
- **`room.service.ts`** - Room business logic

### Client-Side

#### API Client

Located at `apps/zrocket/app/zero/api-client.ts`:

```typescript
// Simple fetch-based API client
export async function sendMessage(input: {
    roomId: string;
    content: string;
    userId: string;
    username: string;
}): Promise<{ success: boolean; messageId: string }> {
    const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    });

    if (!response.ok) {
        throw new Error('Failed to send message');
    }

    return response.json();
}
```

#### Usage in Components

Replace custom mutators with REST API calls:

**Before (Custom Mutators):**

```typescript
const mutation = zero.mutate.message.send({
    roomId,
    content: textContent,
    userId: loginState.decoded.sub,
    username: loginState.decoded.name
});
await mutation.server;
```

**After (REST API):**

```typescript
await sendMessage({
    roomId,
    content: textContent,
    userId: loginState.decoded.sub,
    username: loginState.decoded.name
});
```

### Zero Configuration

Zero client is configured without mutators or push endpoint:

```typescript
new ZeroConstructor<Schema>({
    schema,
    logLevel: 'debug',
    server: import.meta.env.VITE_PUBLIC_SYNC_SERVER,
    userID: auth?.decoded?.sub ?? 'anon',
    kvStore: 'document' in globalThis ? 'idb' : 'mem',
    // No mutators - using REST API for writes
    // No push URL - not using custom mutators
    auth: (error?: 'invalid-token') => {
        // ... auth handling
    }
});
```

## Testing

### Testing REST Endpoints

Use any HTTP client:

```bash
# Send a message
curl -X POST http://localhost:8011/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "room-123",
    "content": "Hello!",
    "userId": "user-456",
    "username": "Alice"
  }'
```

### Testing Zero Queries

Queries work the same way:

```typescript
const [messages] = useQuery(z.query.messages.where('roomId', roomId));

// Messages will include the new message after CDC picks it up
```

## Performance Considerations

### Write Latency

With this architecture, writes have slightly higher latency:

- **Custom Mutators**: ~10-50ms (optimistic + immediate)
- **REST + CDC**: ~100-500ms (server → MongoDB → CDC → Zero → Client)

However, this is acceptable for most chat applications and much simpler to reason about.

### Optimization Tips

1. **Show loading state** - Display spinner while write is in progress
2. **Disable inputs** - Prevent duplicate submissions
3. **Show success feedback** - Toast notification on success
4. **Keep queries focused** - Only query data you need

## When to Use Custom Mutators

You might want to use Zero custom mutators instead if you need:

1. **Instant UI updates** - Optimistic updates for < 50ms feedback
2. **Offline writes** - Queue mutations while offline
3. **Complex multi-step operations** - Atomic client + server logic
4. **Conflict resolution** - Custom CRDT or OT logic

For a demo or MVP, REST API is usually the better choice.

## Migration Path

If you want to add custom mutators later:

1. Keep REST APIs as they are (they're useful for testing)
2. Add custom mutators for specific operations that need them
3. Use custom mutators alongside REST APIs
4. Gradually migrate critical paths to custom mutators

The two approaches can coexist peacefully!
