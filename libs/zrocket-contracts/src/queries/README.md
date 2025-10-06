# Query Definitions

This directory contains type definitions and synced queries for the Zero framework integration in ZRocket.

## Overview

Zero synced queries enable server-side filtering and permission enforcement for real-time data synchronization. This directory provides:

1. **Query Context Types** - Authentication and user context for queries
2. **Query Definitions** - Synced query definitions for channels, rooms, and messages (to be added in subsequent tasks)

## Query Context

The `QueryContext` type provides authenticated user information to synced queries.

**Important**: `QueryContext` is simply an alias for `JwtPayload` - we use the JWT payload directly as the query context.

```typescript
import { QueryContext, isAuthenticated } from './context.js';
import type { JwtPayload } from '../auth/index.js';

// QueryContext = JwtPayload (no transformations!)
type QueryContext = JwtPayload;

// Available fields (from JwtPayload):
// - sub: string                 // User's unique identifier
// - email: string               // User's email address
// - name?: string               // Full display name
// - preferred_username?: string // Username handle
// - picture?: string            // Profile picture URL
// - roles?: string[]            // User roles for RBAC
// - iat?: number                // Issued at timestamp
// - exp?: number                // Expiration timestamp
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
            .where('ownerId', '=', ctx.sub)  // Use 'sub' field
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
        .where('userId', '=', ctx.sub);  // Use 'sub' field
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

## JWT to Context - No Mapping Needed!

`QueryContext` **IS** `JwtPayload` - there's no mapping or transformation:

```typescript
// In the authentication helper:
const jwt: JwtPayload = await this.jwtService.verify(token);
return jwt; // That's it! No field mapping needed.
```

**Benefits:**
- ✅ Zero transformations - pass JWT through directly
- ✅ Single source of truth for field definitions
- ✅ All JWT claims available in queries (including `iat`, `exp` if needed)
- ✅ No field name confusion or duplication
- ✅ Simpler authentication helper implementation

See `../auth/index.ts` for the complete `JwtPayload` definition.

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
