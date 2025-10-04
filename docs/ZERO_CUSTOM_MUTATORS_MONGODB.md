# Zero Custom Mutators Implementation with MongoDB

## Overview

This implementation adds Zero's custom mutators support to the ZRocket application, using MongoDB/Mongoose with NestJS services on the server side. The implementation follows Zero's ServerTransaction API pattern and leverages the push processor protocol.

## Architecture

### Three-Layer Approach

1. **Client Layer** (`app/zero/mutators.ts`)
    - Declares mutator interfaces
    - No actual logic - all execution happens server-side
    - Mutations are sent to the push endpoint via Zero's protocol

2. **Push Processor Layer** (`src/features/chat/push/`)
    - **MongoDB Database Adapter** (`mongodb-database.ts`): Implements Zero's `Database` interface using Mongoose sessions and transactions
    - **Mongo Transaction** (`mongo-transaction.ts`): Wraps MongoDB ClientSession for use with custom mutators
    - **Server Mutators** (`server-mutators.ts`): Implements actual mutation logic by delegating to NestJS services

3. **Service Layer** (`src/features/chat/services/`)
    - **MessageService**: Handles message creation within transactions
    - **RoomService**: Handles room creation and member management within transactions
    - Both services now accept optional `ClientSession` parameter for transactional operations

## Key Components

### 1. MongoDB Database Adapter

**File**: `src/features/chat/push/mongodb-database.ts`

Implements Zero's `Database<MongoTransaction>` interface:

```typescript
export class MongoDatabase implements Database<MongoTransaction> {
    async transaction<R>(
        callback: (
            tx: MongoTransaction,
            hooks: TransactionProviderHooks
        ) => Promise<R>,
        input: TransactionProviderInput
    ): Promise<R>;
}
```

**Features**:

- Wraps Mongoose `ClientSession` in Zero's transaction protocol
- Implements `TransactionProviderHooks` for:
    - `updateClientMutationID`: Tracks last processed mutation per client (idempotency)
    - `writeMutationResult`: Stores mutation results for debugging and replay

### 2. Server-Side Mutators

**File**: `src/features/chat/push/server-mutators.ts`

Defines the actual server-side mutation implementations:

```typescript
export function createServerMutators(
    messageService: MessageService,
    roomService: RoomService
): CustomMutatorDefs<MongoTransaction>;
```

**Mutators**:

- `message.send`: Sends a message to a room
- `room.create`: Creates a new room (DM, private group, or channel)
- `room.invite`: Invites users to an existing room

All mutators:

- Accept a `MongoTransaction` as the first parameter
- Delegate to NestJS services with the transaction session
- Run within MongoDB ACID transactions
- Validate business rules (e.g., room membership, permissions)

### 3. Push Controller

**File**: `src/features/chat/controllers/push.controller.ts`

NestJS controller that exposes the push endpoint at `POST /push`:

```typescript
@Controller('push')
export class PushController {
    async processPush(@Req() request: Request)
}
```

**Features**:

- Initializes `PushProcessor` with MongoDB database adapter
- Creates server mutators with injected NestJS services
- Processes incoming push requests from zero-cache
- Returns structured responses per Zero's push protocol

### 4. Client-Side Mutators

**File**: `app/zero/mutators.ts`

Declares mutators on the client:

```typescript
export function createMutators() {
    return {
        message: {
            send: async (_tx, _args) => {
                // No client logic - server handles everything
            }
        },
        room: {
            create: async (_tx, _args) => {},
            invite: async (_tx, _args) => {}
        }
    };
}
```

**Key Points**:

- No actual implementation - all logic server-side only
- Mutations are sent to push endpoint automatically by Zero
- Type-safe arguments match server-side implementations

### 5. Supporting Entities

**Client Mutation Tracking** (`entities/client-mutation.entity.ts`):

- Tracks the last mutation ID processed for each client
- Enables idempotent mutation processing
- Prevents duplicate mutations from being applied

**Mutation Results** (`entities/mutation-result.entity.ts`):

- Stores the result of each processed mutation
- Useful for debugging and understanding mutation history
- Indexed by clientGroupID, clientID, and mutationID

## Service Updates

Both `MessageService` and `RoomService` were updated to support transactional operations:

**Before**:

```typescript
async sendMessage(input: SendMessageInput): Promise<Message>
```

**After**:

```typescript
async sendMessage(input: SendMessageInput, session?: ClientSession): Promise<Message>
```

**Changes**:

- Added optional `ClientSession` parameter
- All MongoDB operations now accept the session
- Operations run within the provided transaction if available
- Maintains backward compatibility (session is optional)

## Configuration

### Environment Variables

**`.env`** (server config):

```bash
# Push processor endpoint URL
ZERO_PUSH_URL='http://localhost:8011/api/push'
```

**`.env.local`** (client config):

```bash
# Application server URL (for push endpoint)
VITE_PUBLIC_SERVER=http://localhost:8011
```

### Zero Client Setup

**File**: `app/zero/setup.ts`

```typescript
new ZeroConstructor<Schema, Mutators>({
    // ... other config
    push: {
        url: `${import.meta.env.VITE_PUBLIC_SERVER}/push`
    }
});
```

### Zero Cache Setup

Set the `ZERO_PUSH_URL` environment variable to allow zero-cache to call the push endpoint:

```bash
ZERO_PUSH_URL='http://localhost:8011/push'
```

## Usage Examples

### Client-Side

```typescript
// Send a message
await zero.mutate.message.send({
    roomId: 'room-123',
    content: 'Hello World',
    userId: auth.sub,
    username: auth.name
});

// Create a room
await zero.mutate.room.create({
    type: 'd', // Direct message
    memberIds: ['user1', 'user2'],
    usernames: ['Alice', 'Bob'],
    createdBy: auth.sub
});

// Invite users to room
await zero.mutate.room.invite({
    roomId: 'room-123',
    userIds: ['user3'],
    usernames: ['Charlie']
});
```

### Server-Side Business Logic

All validation and business logic happens in the NestJS services:

```typescript
// In MessageService
async sendMessage(input: SendMessageInput, session?: ClientSession): Promise<Message> {
    // Verify room exists
    const room = await this.roomModel.findById(input.roomId).session(session ?? null);

    // Validate membership
    if (!room.memberIds.includes(input.userId)) {
        throw new Error('You must be a room member to send messages');
    }

    // Create message within transaction
    const [message] = await this.messageModel.create([...], { session });

    // Update room metadata
    room.messageCount += 1;
    room.lastMessage = {...};
    await room.save({ session });

    return message;
}
```

## Benefits

1. **Server Authority**: All business logic runs server-side where it can be trusted
2. **Transactional Integrity**: MongoDB transactions ensure consistency
3. **Type Safety**: TypeScript types ensure client and server stay in sync
4. **Idempotency**: Client mutation tracking prevents duplicate operations
5. **Service Reuse**: Leverages existing NestJS services and validation
6. **Scalability**: Clean separation enables independent scaling
7. **Testability**: Services can be unit tested with mock sessions

## Migration from REST Endpoints

This implementation replaces traditional REST endpoints for mutations:

**Before** (REST):

```typescript
@Post('messages')
async createMessage(@Body() dto: CreateMessageDto) {
    return this.messageService.sendMessage(dto);
}
```

**After** (Custom Mutators):

```typescript
// No REST endpoint needed!
// Push controller handles all mutations via Zero protocol
```

**Benefits**:

- Automatic optimistic updates on client
- Real-time sync to other clients
- No need to manually invalidate caches
- Built-in retry and error handling
- Consistent mutation ordering

## Testing

Comprehensive test suites have been added to ensure the custom mutators implementation works correctly.

### Test Files

1. **`mongodb-database.spec.ts`** - Tests for the MongoDB Database adapter
2. **`server-mutators.spec.ts`** - Tests for server-side mutator implementations
3. **`message.service.spec.ts`** - Tests for MessageService with session support
4. **`push.controller.spec.ts`** - Integration tests for the push endpoint

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test mongodb-database.spec.ts

# Run with coverage
pnpm test --coverage

# Watch mode
pnpm test --watch
```

### Unit Tests

#### MongoDB Database Adapter Tests

Tests transaction management, session handling, and idempotency tracking:

```typescript
describe('MongoDatabase', () => {
    it('should start and end a session', async () => {
        await database.transaction(callback, input);
        expect(mockConnection.startSession).toHaveBeenCalled();
        expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('updateClientMutationID should track mutation ID', async () => {
        const result = await hooks.updateClientMutationID();
        expect(result).toEqual({ lastMutationID: 3 });
    });
});
```

#### Server Mutators Tests

Tests that mutators correctly delegate to services:

```typescript
describe('Server Mutators', () => {
    it('message.send should call messageService with session', async () => {
        await mutators.message.send(mockTx, args);
        expect(mockMessageService.sendMessage).toHaveBeenCalledWith(
            expect.anything(),
            mockSession
        );
    });
});
```

#### Service Tests

Tests services with transaction support:

```typescript
describe('MessageService', () => {
    it('should send message within transaction', async () => {
        const message = await service.sendMessage(input, mockSession);

        expect(message).toBeDefined();
        expect(messageModel.create).toHaveBeenCalledWith(expect.anything(), {
            session: mockSession
        });
    });

    it('should work without session (backward compatibility)', async () => {
        await service.sendMessage(input); // No session
        expect(messageModel.create).toHaveBeenCalledWith(expect.anything(), {
            session: undefined
        });
    });
});
```

### Integration Tests

#### Push Controller Tests

Tests the full push endpoint flow:

```typescript
describe('PushController', () => {
    it('should process push request with mutations', async () => {
        const mockRequest = {
            url: 'http://localhost:8011/push?schema=test&appID=zrocket',
            json: () => Promise.resolve({
                mutations: [{
                    id: 1,
                    clientID: 'client-1',
                    name: 'message.send',
                    args: { roomId: 'room-1', content: 'Hello', ... }
                }]
            })
        };

        const result = await controller.processPush(mockRequest, {});
        expect(result).toBeDefined();
        expect(messageService.sendMessage).toHaveBeenCalled();
    });

    it('should handle mutation errors gracefully', async () => {
        messageService.sendMessage.mockRejectedValue(
            new Error('Room not found')
        );

        const result = await controller.processPush(mockRequest, {});
        // Should return error response but not throw
        expect(result).toBeDefined();
    });
});
```

### Test Coverage

The test suite covers:

- ✅ Transaction lifecycle (start, commit, rollback, end)
- ✅ Client mutation ID tracking (idempotency)
- ✅ Mutation result storage
- ✅ Server mutator delegation to services
- ✅ Service operations with and without sessions
- ✅ Error handling at all levels
- ✅ Validation logic (room membership, permissions)
- ✅ Push protocol request/response handling
- ✅ Backward compatibility (optional sessions)

## Next Steps

1. **Add More Mutators**: Implement additional mutations (delete message, update room, etc.)
2. **Add Permissions**: Implement fine-grained permissions in mutators
3. **Add Validation**: Use Zod or class-validator for input validation
4. **Add Metrics**: Track mutation latency and success rates
5. **Add Retry Logic**: Implement custom retry strategies if needed
6. **Add Notifications**: Send email/push notifications from mutators
7. **Remove REST Endpoints**: Clean up any remaining REST mutation endpoints

## Troubleshooting

### Common Issues

**1. Push endpoint not called**

- Verify `ZERO_PUSH_URL` is set in zero-cache config
- Check that `push.url` is set in Zero client config
- Ensure the server is running on the specified port

**2. Transaction errors**

- MongoDB must be running as a replica set for transactions
- Verify connection string includes `replicaSet` parameter
- Check MongoDB version (transactions require 4.0+)

**3. Type errors**

- Ensure client and server mutator signatures match
- Check that imports are using `.js` extensions
- Verify TypeScript strict mode is enabled

**4. Idempotency issues**

- Check that `ClientMutation` collection has unique index
- Verify mutation IDs are being tracked correctly
- Review `updateClientMutationID` logic

## References

- [Zero Custom Mutators Docs](https://zero.rocicorp.dev/docs/custom-mutators)
- [Zero ServerTransaction API](https://zero.rocicorp.dev/docs/custom-mutators#custom-database-connections)
- [MongoDB Transactions](https://www.mongodb.com/docs/manual/core/transactions/)
- [Mongoose Sessions](https://mongoosejs.com/docs/transactions.html)
