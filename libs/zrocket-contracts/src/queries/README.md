# Query Definitions

This directory contains type definitions and synced queries for the Zero framework integration in ZRocket.

## Overview

Zero synced queries enable server-side filtering and permission enforcement for real-time data synchronization. This directory provides:

1. **Query Context Types** - Authentication and user context for queries
2. **Query Definitions** - Synced query definitions for channels, rooms, and messages (to be added in subsequent tasks)

## Query Context

The `QueryContext` type provides authenticated user information to synced queries:

```typescript
import { QueryContext, isAuthenticated } from './context.js';

// Context structure
type QueryContext = {
    userID: string;        // Required: User's unique identifier
    role?: 'admin' | 'user';  // Optional: User's role
    username?: string;     // Optional: Display name
};
```

### Usage with Synced Queries

```typescript
import { syncedQueryWithContext } from '@rocicorp/zero';
import { isAuthenticated, type QueryContext } from './context.js';

// Define a query that requires authentication
export const myChats = syncedQueryWithContext<Schema, QueryContext>(
    'myChats',
    z.tuple([]),
    (builder, ctx) => {
        if (!isAuthenticated(ctx)) {
            // Anonymous users get empty results
            return builder.chats.where('_id', '=', 'never-matches');
        }
        
        // Authenticated users see their own chats
        return builder.chats
            .where('ownerId', '=', ctx.userID)
            .orderBy('lastMessageAt', 'desc');
    }
);
```

### Type Guard

The `isAuthenticated()` function provides type-safe checking of authentication status:

```typescript
function myQuery(builder, ctx: QueryContext | undefined) {
    if (!isAuthenticated(ctx)) {
        // ctx is undefined here
        return publicData(builder);
    }
    
    // ctx is QueryContext here (TypeScript knows it's defined)
    return builder.items
        .where('userId', '=', ctx.userID);
}
```

## Architecture

```
┌─────────────────┐
│  Client (Zero)  │
│  + JWT Token    │
└────────┬────────┘
         │ Query Request
         │ with JWT
         ▼
┌─────────────────┐
│  Zero Cache     │
│  + Routes to    │
│    NestJS API   │
└────────┬────────┘
         │ POST /api/zero/get-queries
         │ Authorization: Bearer <JWT>
         ▼
┌─────────────────┐
│  NestJS API     │
│  + Verify JWT   │
│  + Extract ctx  │
│  + Filter query │
└────────┬────────┘
         │ Filtered Query AST
         ▼
┌─────────────────┐
│  Client Sees    │
│  Filtered Data  │
└─────────────────┘
```

## JWT to Context Mapping

The server extracts `QueryContext` from JWT claims:

| JWT Claim | QueryContext Property | Description |
|-----------|----------------------|-------------|
| `sub` | `userID` | User's unique identifier (required) |
| Custom claim | `role` | User role for RBAC (optional) |
| `name` | `username` | Display name (optional) |

## Related Documentation

- [Zero Synced Queries](https://rocicorp.dev/docs/zero/synced-queries)
- [ZRocket Synced Queries PRD](../../../docs/projects/zrocket-synced-queries/PRD.md)
- [JWT Payload Types](../auth/index.ts)

## Future Query Definitions

The following synced queries will be added in subsequent tasks:

- **E02_01**: Public channel queries (`publicChannels`, `channelById`)
- **E02_02**: Private room queries (`myChats`, `myGroups`, `chatById`, `groupById`)
- **E02_03**: Message queries (`roomMessages`, `roomSystemMessages`, `searchMessages`)
- **E02_04**: Query index and exports

See [Epic E02 Stories](../../../docs/projects/zrocket-synced-queries/EPICS_AND_STORIES.md#zsqe02-query-definitions-and-client-integration) for details.
