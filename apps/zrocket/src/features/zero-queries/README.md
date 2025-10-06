# Zero Queries Feature

This feature provides authentication infrastructure and API endpoints for Zero synced query requests.

## Overview

The Zero Queries feature bridges HTTP authentication with Zero's query context system, enabling server-side filtering and access control for synced queries. It provides a NestJS module that integrates authentication, query routing, and access control for Zero's synced query system.

## Components

### `ZeroQueriesModule`

NestJS module that encapsulates all Zero synced query functionality.

**Purpose**: Organize and provide dependency injection for query-related services and controllers.

**Features**:
- Modular architecture with proper DI configuration
- Exports `ZeroQueryAuth` for use in other modules
- Registers query endpoints via `ZeroQueriesController`
- Leverages globally configured JwtModule, MongooseModule, and ConfigModule

### `ZeroQueriesController`

HTTP controller for Zero synced query endpoints.

**Purpose**: Handle incoming query requests from Zero cache server at `/api/zero/get-queries`.

**Features**:
- POST endpoint at `/api/zero/get-queries`
- Request authentication using `ZeroQueryAuth`
- Placeholder response (full implementation coming in future issues)
- Comprehensive error handling and logging

### `ZeroQueryAuth`

Authentication helper class that extracts and validates JWT tokens from request headers.

**Purpose**: Consistently authenticate query requests and provide QueryContext for server-side query filtering.

**Features**:
- JWT extraction from Authorization headers
- Token validation and verification
- Anonymous access support (no auth header)
- Comprehensive error handling

## Usage

### Module Integration

Import the `ZeroQueriesModule` in your application:

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ZeroQueriesModule } from './features/zero-queries';

@Module({
  imports: [
    // ... other modules
    ZeroQueriesModule
  ]
})
export class AppModule {}
```

The module is already integrated in the ZRocket application and provides the `/api/zero/get-queries` endpoint.

### Using ZeroQueryAuth in Other Modules

The `ZeroQueryAuth` service is exported by `ZeroQueriesModule` and can be used in other modules:

```typescript
// your.module.ts
import { Module } from '@nestjs/common';
import { ZeroQueriesModule } from '../zero-queries';
import { YourService } from './your.service';

@Module({
  imports: [ZeroQueriesModule],
  providers: [YourService]
})
export class YourModule {}

// your.service.ts
import { Injectable } from '@nestjs/common';
import { ZeroQueryAuth } from '../zero-queries';

@Injectable()
export class YourService {
  constructor(private readonly auth: ZeroQueryAuth) {}

  async processRequest(request: Request) {
    const context = await this.auth.authenticateRequest(request);
    // Use context for filtering...
  }
}
```

### Direct Authentication Usage

```typescript
import { ZeroQueryAuth } from './features/zero-queries';

// Inject via constructor (typical pattern)
constructor(private readonly auth: ZeroQueryAuth) {}

// Authenticate a request
const ctx = await this.auth.authenticateRequest(request);

if (ctx) {
  // Authenticated - apply user-specific filters
  query.where('ownerId', '=', ctx.sub);
} else {
  // Anonymous - show only public data
  query.where('isPublic', '=', true);
}
```

### Query Context

The `QueryContext` type is an alias for `JwtPayload`, containing:

```typescript
{
  sub: string;                  // User ID
  email: string;                // User email
  name?: string;                // Full name
  preferred_username?: string;  // Username
  picture?: string;             // Profile picture URL
  roles?: string[];             // User roles
  iat?: number;                 // Issued at timestamp
  exp?: number;                 // Expiration timestamp
}
```

## Error Handling

### Missing Authorization Header

**Behavior**: Returns `undefined` for anonymous access  
**Use case**: Public queries that don't require authentication

```typescript
const ctx = await auth.authenticateRequest(request);
// ctx is undefined - allow anonymous access
```

### Malformed Authorization Header

**Throws**: `UnauthorizedException`  
**Message**: "Invalid authorization header format. Expected \"Bearer <token>\""

**Cases**:
- Missing "Bearer " prefix
- Empty token
- Only whitespace

### Invalid or Expired JWT

**Throws**: `UnauthorizedException`  
**Message**: "Invalid or expired authentication token"

**Cases**:
- Expired token (exp claim in the past)
- Invalid signature
- Malformed JWT structure

## Architecture Decisions

### QueryContext = JwtPayload

We use JWT payload directly as QueryContext to:
- Eliminate unnecessary field transformations
- Maintain single source of truth
- Preserve all JWT claims for filtering
- Simplify authentication flow

### No Field Mapping

Unlike traditional approaches that transform JWT claims, we return the verified payload directly:

```typescript
// ✅ Our approach - simple passthrough
return await this.jwtService.verifyAsync(token);

// ❌ Traditional approach - unnecessary transformation
return {
  userID: jwt.sub,
  email: jwt.email,
  // ... manual mapping
};
```

## Testing

Comprehensive unit tests cover:
- ✅ Valid JWT tokens
- ✅ Token with extra whitespace
- ✅ All JWT claims preserved
- ✅ Missing Authorization header
- ✅ Empty header string
- ✅ Malformed headers (no Bearer prefix)
- ✅ Empty token after Bearer
- ✅ Expired tokens
- ✅ Invalid signatures
- ✅ Malformed JWTs

Run tests:
```bash
pnpm --filter=@cbnsndwch/zrocket test src/features/zero-queries
```

## Integration

### Module Setup

```typescript
import { Module } from '@nestjs/common';
import { ZeroQueryAuth } from './zero-queries';

@Module({
  providers: [ZeroQueryAuth],
  exports: [ZeroQueryAuth]
})
export class ZeroQueriesModule {}
```

### With Existing Auth Module

The `ZeroQueryAuth` helper reuses the existing JWT configuration from `AuthModule`:

```typescript
import { AuthModule } from '../auth';
import { ZeroQueriesModule } from './zero-queries';

@Module({
  imports: [AuthModule, ZeroQueriesModule],
  // ...
})
export class AppModule {}
```

## Related Documentation

- [Zero Synced Queries](https://rocicorp.dev/docs/zero/synced-queries)
- [JWT Payload Specification](../../../../../libs/zrocket-contracts/src/auth/index.ts)
- [Query Context Type](../../../../../libs/zrocket-contracts/src/queries/context.ts)
- [Project PRD](../../../../../docs/projects/zrocket-synced-queries/PRD.md)

## Implementation Notes

### Why Not Use Guards?

We don't use NestJS Guards because:
1. Zero Cache calls our endpoint, not browser clients
2. We need explicit `undefined` for anonymous access, not 401 errors
3. Guards would complicate the optional authentication pattern
4. Direct service usage is simpler and more explicit

### Future Enhancements

- [ ] Support for cookie-based JWT extraction (like JwtAuthStrategy)
- [ ] Rate limiting per user
- [ ] Audit logging for query access
- [ ] Query performance metrics per user
- [ ] Permission-based query filtering
