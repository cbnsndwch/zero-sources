# @cbnsndwch/nest-zero-synced-queries

A lightweight NestJS library for defining Zero synced query handlers using decorators. Works seamlessly with regular NestJS controllers and providers, leveraging your existing authentication and guard infrastructure.

## Features

- **Decorator-based**: Use `@SyncedQuery` to define query handlers
- **Automatic discovery**: Handlers are automatically discovered in controllers and providers at startup
- **Framework-agnostic auth**: Use your own NestJS guards, interceptors, and parameter decorators
- **Controller-friendly**: Works on regular `@Controller` classes alongside `@Get`, `@Post`, etc.
- **Parameter mapping**: Use `@QueryArg()` decorator to explicitly map query arguments
- **Type-safe**: Full TypeScript support with Zod schema validation

## Installation

```bash
pnpm add @cbnsndwch/nest-zero-synced-queries
```

## Related Packages

This library is part of the [zero-sources](https://github.com/cbnsndwch/zero-sources) monorepo, which provides utilities and integrations for [@rocicorp/zero](https://github.com/rocicorp/zero).

### Zero Integration Packages

- **[@cbnsndwch/zero-contracts](../zero-contracts)** - Shared contracts, types, and utilities for Zero applications
- **[@cbnsndwch/zero-source-mongodb](../zero-source-mongodb)** - MongoDB change source implementation for Zero
- **[@cbnsndwch/zero-nest-mongoose](../zero-nest-mongoose)** - NestJS/Mongoose integration with Zero schema generation
- **[@cbnsndwch/zero-watermark-zqlite](../zero-watermark-zqlite)** - SQLite-based watermark storage for Zero
- **[@cbnsndwch/zero-watermark-nats-kv](../zero-watermark-nats-kv)** - NATS KV-based watermark storage for Zero

### Example Applications

- **[ZRocket](../../apps/zrocket)** - Full-featured chat application demonstrating Zero + NestJS patterns
- **[MongoDB Source Server](../../apps/source-mongodb-server)** - Standalone MongoDB change source server

## Quick Start

Get up and running in 3 simple steps:

### 1. Configure the Module

Import and configure `SyncedQueriesModule` in your app module:

```typescript
import { Module } from '@nestjs/common';
import { SyncedQueriesModule } from '@cbnsndwch/nest-zero-synced-queries';

@Module({
  imports: [
    SyncedQueriesModule.forRoot({
      path: 'api/zero/get-queries'  // Optional: defaults to 'zero/get-queries'
    }),
    // Your feature modules...
  ]
})
export class AppModule {}
```

### 2. Define Your Schema

Create your Zero schema with query builder:

```typescript
// schema.ts
import { createSchema } from '@rocicorp/zero';

export const schema = createSchema({
  tables: {
    todo: {
      columns: {
        id: 'string',
        title: 'string',
        completed: 'boolean',
        userId: 'string',
        createdAt: 'number'
      },
      primaryKey: 'id'
    }
  }
});

export const builder = schema.builder;
```

### 3. Add Synced Query Handlers

Decorate your methods with `@SyncedQuery`:

```typescript
import { Controller, UseGuards } from '@nestjs/common';
import { SyncedQuery, QueryArg } from '@cbnsndwch/nest-zero-synced-queries';
import { AST } from '@rocicorp/zero';
import { z } from 'zod';
import { builder } from './schema.js';
import { JwtAuthGuard } from './auth/jwt-auth.guard.js';
import { CurrentUser } from './auth/current-user.decorator.js';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  /**
   * Get all todos for the current user
   */
  @SyncedQuery('myTodos', z.tuple([]))
  async myTodos(@CurrentUser() user: { id: string }): Promise<AST> {
    return builder.todo
      .where('userId', '=', user.id)
      .orderBy('createdAt', 'desc').ast;
  }

  /**
   * Get a specific todo by ID (with permission check)
   */
  @SyncedQuery('todoById', z.tuple([z.string()]))
  async todoById(
    @CurrentUser() user: { id: string },
    @QueryArg(0) todoId: string
  ): Promise<AST> {
    return builder.todo
      .where('id', '=', todoId)
      .where('userId', '=', user.id).ast;
  }
}
```

That's it! The library automatically discovers your queries and exposes them via the configured HTTP endpoint.

## Core Concepts

### Authentication & Guards

Use your existing NestJS guards - the library passes the full HTTP request through:

```typescript
@Controller('api')
@UseGuards(JwtAuthGuard, RolesGuard)  // Your guards work as normal
export class ApiController {
  @SyncedQuery('data', z.tuple([]))
  async getData(@CurrentUser() user: User) {
    return builder.data.where('userId', '=', user.id).ast;
  }
}
```

### Query Arguments

Use `@QueryArg(index)` to access query parameters:

```typescript
@SyncedQuery('postsByCategory', z.tuple([z.string(), z.number().optional()]))
async postsByCategory(
  @QueryArg(0) category: string,
  @QueryArg(1) limit = 10
): Promise<AST> {
  return builder.posts
    .where('category', '=', category)
    .limit(limit).ast;
}
```

### Permission Filtering

Implement authorization by filtering results:

```typescript
@SyncedQuery('sensitiveData', z.tuple([z.string()]))
async sensitiveData(
  @CurrentUser() user: User,
  @QueryArg(0) resourceId: string
): Promise<AST> {
  // Check permission
  const hasAccess = await this.checkPermission(user.id, resourceId);
  
  if (!hasAccess) {
    // Return query that matches nothing
    return builder.data.where('id', '=', '__NEVER_MATCHES__').ast;
  }
  
  return builder.data.where('id', '=', resourceId).ast;
}
```

### Mixed Operations

Combine REST endpoints and synced queries in the same controller:

```typescript
@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  // REST endpoint for writes
  @Post()
  async createPost(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }

  // Synced query for reads
  @SyncedQuery('allPosts', z.tuple([]))
  async allPosts(): Promise<AST> {
    return builder.posts.orderBy('createdAt', 'desc').ast;
  }
}

## Examples

### Simple Queries

No parameters needed - just use the authenticated user:

```typescript
@Controller('api')
@UseGuards(JwtAuthGuard)
export class ApiController {
  @SyncedQuery('myProfile', z.tuple([]))
  async myProfile(@CurrentUser() user: User): Promise<AST> {
    return builder.users.where('id', '=', user.id).ast;
  }

  @SyncedQuery('publicPosts', z.tuple([]))
  async publicPosts(): Promise<AST> {
    return builder.posts
      .where('isPublic', '=', true)
      .orderBy('createdAt', 'desc').ast;
  }
}
```

### Queries With Parameters

```typescript
@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  @SyncedQuery('postById', z.tuple([z.string()]))
  async postById(@QueryArg(0) postId: string): Promise<AST> {
    return builder.posts.where('id', '=', postId).ast;
  }

  @SyncedQuery('postsByUser', z.tuple([z.string()]))
  async postsByUser(@QueryArg(0) userId: string): Promise<AST> {
    return builder.posts
      .where('userId', '=', userId)
      .where('isPublic', '=', true)
      .orderBy('createdAt', 'desc').ast;
  }
}
```

### Optional Parameters

```typescript
@SyncedQuery('searchPosts', z.tuple([z.string(), z.number().optional()]))
async searchPosts(
  @QueryArg(0) searchTerm: string,
  @QueryArg(1) limit = 20  // Default value for optional parameter
): Promise<AST> {
  return builder.posts
    .where('title', 'LIKE', `%${searchTerm}%`)
    .limit(limit).ast;
}
```

### With Service Dependencies

Use constructor injection as normal:

```typescript
@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(
    private readonly permissionsService: PermissionsService
  ) {}

  @SyncedQuery('protectedPost', z.tuple([z.string()]))
  async protectedPost(
    @CurrentUser() user: User,
    @QueryArg(0) postId: string
  ): Promise<AST> {
    const canAccess = await this.permissionsService.canAccessPost(
      user.id,
      postId
    );

    if (!canAccess) {
      return builder.posts.where('id', '=', '__NEVER_MATCHES__').ast;
    }

    return builder.posts.where('id', '=', postId).ast;
  }
}
```

### With Relations

Include related data using Zero's query builder:

```typescript
@SyncedQuery('postWithComments', z.tuple([z.string()]))
async postWithComments(@QueryArg(0) postId: string): Promise<AST> {
  return builder.posts
    .where('id', '=', postId)
    .related('comments', q => 
      q.orderBy('createdAt', 'desc').limit(50)
    )
    .related('author').ast;
}
```

## Real-World Example: ZRocket Chat App

Want to see how this library is used in a production application? Check out [ZRocket](../../apps/zrocket), a chat application in this monorepo that demonstrates:

- **Mixed operations**: REST endpoints for writes (send messages, create rooms) + synced queries for reads
- **Permission filtering**: Room access checks, membership validation, public vs. private content
- **Complex queries**: Search across accessible rooms, filter by room type, paginate results
- **Service integration**: Using `RoomAccessService` for authorization in queries
- **Multiple controllers**: `MessagesController` and `RoomsController` with different query patterns

Key files to explore:
- [`apps/zrocket/src/features/chat/controllers/messages.controller.ts`](../../apps/zrocket/src/features/chat/controllers/messages.controller.ts) - Message queries with permission checks
- [`apps/zrocket/src/features/chat/controllers/rooms.controller.ts`](../../apps/zrocket/src/features/chat/controllers/rooms.controller.ts) - Room queries for chats, groups, and channels
- [`apps/zrocket/src/features/index.ts`](../../apps/zrocket/src/features/index.ts) - Module configuration

## Best Practices

1. **Co-locate operations**: Put REST endpoints and synced queries in the same controller
2. **Use existing guards**: Leverage your authentication infrastructure with `@UseGuards()`
3. **Filter, don't throw**: Return queries that match nothing instead of throwing errors for unauthorized access
4. **Inject services**: Use constructor injection to access business logic in queries
5. **Return AST**: Always return `Promise<AST>` from query handlers (use `.ast` property)
6. **Type everything**: Strongly type your user objects, query parameters, and return types
7. **Document queries**: Add JSDoc comments describing what the query does and its parameters

## API Reference

### Decorators

- **`@SyncedQuery(name, schema)`**
  - `name`: Unique query identifier string
  - `schema`: Zod schema for argument validation (e.g., `z.tuple([z.string()])`)
  - Use on controller or provider methods
  - Method must return `Promise<AST>`

- **`@QueryArg(index)`**
  - `index`: Zero-based argument index
  - Injects the argument at that position from the query
  - Use alongside your own decorators (`@CurrentUser()`, etc.)

### Module Configuration

- **`SyncedQueriesModule.forRoot(options)`**
  - `options.path`: HTTP endpoint path (default: `'zero/get-queries'`)
  - Returns a `DynamicModule` for import

### Services (Advanced)

- **`SyncedQueryRegistry`** - Query handler registry (auto-injected)
  - `getHandler(name)` - Get handler by name
  - `getQueryNames()` - List all query names
  - `hasQuery(name)` - Check if query exists
  - `getHandlerCount()` - Total handler count

- **`SyncedQueryTransformService`** - Query execution service (auto-injected)
  - Used internally by the controller
  - Handles query execution and AST conversion

## Troubleshooting

### Query not found

- Ensure your controller/provider is registered in a module
- Check that `SyncedQueriesModule.forRoot()` is imported
- Verify the query name matches exactly

### Authentication not working

- Ensure your guard is applied: `@UseGuards(YourAuthGuard)`
- Check that `request.user` is populated by your auth strategy
- Guards receive the full HTTP request object

### TypeScript errors

- Install peer dependencies: `@nestjs/common`, `@nestjs/core`, `reflect-metadata`, `rxjs`, `zod`
- Ensure `emitDecoratorMetadata` is enabled in `tsconfig.json`

## Contributing

Found a bug or have a feature request? Please open an issue on [GitHub](https://github.com/cbnsndwch/zero-sources/issues).

Contributions are welcome! See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

MIT • Part of the [zero-sources](https://github.com/cbnsndwch/zero-sources) monorepo
