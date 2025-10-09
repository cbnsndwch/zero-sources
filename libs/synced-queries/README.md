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

## Getting Started

This guide shows you how to integrate Zero synced queries into your NestJS application, following the pattern used in ZRocket—a chat application that combines REST endpoints for writes with Zero synced queries for reads.

### Step 1: Configure the Module

First, set up the `SyncedQueriesModule` in your application's root module. This provides automatic discovery of `@SyncedQuery` decorated methods and exposes them via an HTTP endpoint.

```typescript
import { Module } from '@nestjs/common';
import { SyncedQueriesModule } from '@cbnsndwch/nest-zero-synced-queries';
import { ChatModule } from './chat/chat.module.js';

@Module({
  imports: [
    // Configure synced queries with automatic discovery
    SyncedQueriesModule.forRoot({
      path: 'zero/get-queries'  // HTTP endpoint path
    }),
    
    // Your feature modules with @SyncedQuery decorators
    ChatModule,
    // ... other modules
  ]
})
export class AppModule {}
```

### Step 2: Create Controllers with Mixed Operations

The recommended pattern is to put both REST endpoints (writes) and synced queries (reads) in the same controller. This keeps related operations together and leverages NestJS guards for authentication.

```typescript
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards
} from '@nestjs/common';
import { AST } from '@rocicorp/zero';
import { z } from 'zod';
import { SyncedQuery, QueryArg } from '@cbnsndwch/nest-zero-synced-queries';
import { builder } from './schema.js';  // Your Zero schema builder
import { CurrentUser } from '../auth/decorators/index.js';
import { JwtAuthGuard } from '../auth/jwt/index.js';

/**
 * Controller for message operations (REST + Zero synced queries).
 *
 * This controller handles both:
 * - REST endpoints: Send messages (write operations)
 * - Zero synced queries: Read messages with permission filtering
 */
@Controller('messages')
@UseGuards(JwtAuthGuard)  // All operations require authentication
export class MessagesController {
  constructor(private readonly messageService: MessageService) {}

  // ============================================================================
  // REST Endpoints - Write Operations
  // ============================================================================

  /**
   * Send a new message to a room
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Body() body: {
      roomId: string;
      content: string;
      userId: string;
      username: string;
    }
  ) {
    const message = await this.messageService.sendMessage({
      roomId: body.roomId,
      content: body.content,
      userId: body.userId,
      username: body.username
    });

    return {
      success: true,
      messageId: message._id,
      message: 'Message sent successfully'
    };
  }

  // ============================================================================
  // Zero Synced Queries - Read Operations with Permission Filtering
  // ============================================================================

  /**
   * Get messages for a specific room.
   *
   * @param user - Authenticated user (auto-injected by JwtAuthGuard)
   * @param roomId - The ID of the room
   * @param roomType - The type of room (channel, chat, or group)
   * @param limit - Maximum number of messages to return
   */
  @SyncedQuery(
    'roomMessages',
    z.tuple([z.string(), z.string(), z.number().optional()])
  )
  async roomMessages(
    @CurrentUser() user: JwtPayload,
    @QueryArg(0) roomId: string,
    @QueryArg(1) roomType: RoomType,
    @QueryArg(2) limit = 100
  ): Promise<AST> {
    // Public channels are accessible to all authenticated users
    if (roomType === RoomType.PublicChannel) {
      return builder.userMessages
        .where('roomId', '=', roomId)
        .orderBy('createdAt', 'desc')
        .limit(limit).ast;
    }

    // Private rooms require membership check
    const hasAccess = await this.roomAccessService.userHasRoomAccess(
      user.sub,
      roomId,
      roomType
    );

    if (!hasAccess) {
      // Return empty result for unauthorized access
      return builder.userMessages
        .where('_id', '=', '__NEVER_MATCHES__').ast;
    }

    return builder.userMessages
      .where('roomId', '=', roomId)
      .orderBy('createdAt', 'desc')
      .limit(limit).ast;
  }

  /**
   * Search messages across accessible rooms.
   */
  @SyncedQuery('searchMessages', z.tuple([z.string(), z.number().optional()]))
  async searchMessages(
    @CurrentUser() user: JwtPayload,
    @QueryArg(0) searchTerm: string,
    @QueryArg(1) limit = 50
  ): Promise<AST> {
    const accessibleRoomIds = 
      await this.roomAccessService.getUserAccessibleRoomIds(user.sub);

    if (accessibleRoomIds.length === 0) {
      return builder.userMessages
        .where('_id', '=', '__NEVER_MATCHES__').ast;
    }

    return builder.userMessages
      .where('roomId', 'IN', accessibleRoomIds)
      .where('content', 'LIKE', `%${searchTerm}%`)
      .orderBy('createdAt', 'desc')
      .limit(limit).ast;
  }
}
```

### Step 3: Register Controllers in Your Module

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagesController } from './controllers/messages.controller.js';
import { RoomsController } from './controllers/rooms.controller.js';

/**
 * Chat module using Zero for reads (queries) and REST for writes.
 *
 * Controllers handle ALL external requests:
 * - REST endpoints (@Post, @Get, etc.) - Write operations
 * - Zero synced queries (@SyncedQuery) - Read operations with filtering
 */
@Module({
  imports: [
    MongooseModule.forFeature([/* your entities */])
  ],
  controllers: [
    MessagesController,  // REST + synced queries for messages
    RoomsController      // REST + synced queries for rooms
  ],
  providers: [
    // Your services (MessageService, RoomAccessService, etc.)
  ]
})
export class ChatModule {}
```

### Key Patterns

**1. Controller-Based Architecture**: Keep REST endpoints and synced queries in the same controller for better organization.

**2. Permission Filtering**: Synced queries should implement authorization logic to filter results based on user permissions.

**3. Use Your Own Guards**: The library works with your existing NestJS guards (`@UseGuards(JwtAuthGuard)`).

**4. Custom Decorators**: Use your own parameter decorators (`@CurrentUser()`) alongside `@QueryArg()`.

**5. Return AST**: Synced query methods must return `Promise<AST>` (the `.ast` property from Zero query builder).

**6. Empty Results for Unauthorized Access**: Return a query that never matches (e.g., `where('_id', '=', '__NEVER_MATCHES__')`) instead of throwing errors.

## More Examples

### Queries Without Parameters

Simple queries that only need the authenticated user:

```typescript
@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  /**
   * Get all chats where user is a member.
   */
  @SyncedQuery('myChats', z.tuple([]))
  async myChats(@CurrentUser() user: JwtPayload): Promise<AST> {
    const accessibleRoomIds = 
      await this.roomAccessService.getUserAccessibleRoomIds(user.sub);

    if (accessibleRoomIds.length === 0) {
      return builder.chats.where('_id', '=', '__NEVER_MATCHES__').ast;
    }

    return builder.chats
      .where('_id', 'IN', accessibleRoomIds)
      .orderBy('lastMessageAt', 'desc').ast;
  }

  /**
   * Get all public channels (accessible to all authenticated users).
   */
  @SyncedQuery('publicChannels', z.tuple([]))
  async publicChannels(): Promise<AST> {
    return builder.channels
      .where('isPublic', '=', true)
      .orderBy('name', 'asc').ast;
  }
}
```

### Queries With Parameters

Use `@QueryArg(index)` to inject specific arguments:

```typescript
@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  /**
   * Get a specific chat by ID with permission check.
   */
  @SyncedQuery('chatById', z.tuple([z.string()]))
  async chatById(
    @CurrentUser() user: JwtPayload,
    @QueryArg(0) chatId: string
  ): Promise<AST> {
    const hasAccess = await this.roomAccessService.userHasRoomAccess(
      user.sub,
      chatId,
      RoomType.Chat
    );

    if (!hasAccess) {
      return builder.chats.where('_id', '=', '__NEVER_MATCHES__').ast;
    }

    return builder.chats
      .where('_id', '=', chatId)
      .related('messages', q => 
        q.orderBy('createdAt', 'desc').limit(100)
      ).ast;
  }

  /**
   * Get a public channel by ID (no permission check needed).
   */
  @SyncedQuery('channelById', z.tuple([z.string()]))
  async channelById(
    @QueryArg(0) channelId: string
  ): Promise<AST> {
    return builder.channels
      .where('_id', '=', channelId)
      .where('isPublic', '=', true)
      .related('messages', q => 
        q.orderBy('createdAt', 'desc').limit(100)
      ).ast;
  }
}
```

### Optional Parameters

Use Zod's `.optional()` for optional parameters:

```typescript
@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  @SyncedQuery(
    'roomMessages',
    z.tuple([z.string(), z.string(), z.number().optional()])
  )
  async roomMessages(
    @CurrentUser() user: JwtPayload,
    @QueryArg(0) roomId: string,
    @QueryArg(1) roomType: RoomType,
    @QueryArg(2) limit = 100  // Default value for optional parameter
  ): Promise<AST> {
    // Implementation here
  }
}
```

### Handling Services in Synced Queries

Synced query methods are regular class methods, so you can inject and use services:

```typescript
@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    private readonly messageService: MessageService,
    private readonly roomAccessService: RoomAccessService
  ) {}

  @SyncedQuery('roomMessages', z.tuple([z.string(), z.string()]))
  async roomMessages(
    @CurrentUser() user: JwtPayload,
    @QueryArg(0) roomId: string,
    @QueryArg(1) roomType: RoomType
  ): Promise<AST> {
    // Use injected services for authorization logic
    const hasAccess = await this.roomAccessService.userHasRoomAccess(
      user.sub,
      roomId,
      roomType
    );

    if (!hasAccess) {
      return builder.userMessages
        .where('_id', '=', '__NEVER_MATCHES__').ast;
    }

    // Use query builder to construct the query
    return builder.userMessages
      .where('roomId', '=', roomId)
      .orderBy('createdAt', 'desc').ast;
  }
}
```

## API Reference

### Decorators

- **`@SyncedQuery(name, schema)`** - Define a query handler
  - `name`: Unique query identifier
  - `schema`: Zod schema for validating arguments (e.g., `z.tuple([z.string()])`)
  - Can be used on controller or provider methods
  - Method must return `Promise<AST>`

- **`@QueryArg(index)`** - Inject a specific query argument by index
  - `index`: Zero-based argument index from the query parameters
  - Use alongside your own decorators (`@CurrentUser()`, etc.)

### Module Configuration

- **`SyncedQueriesModule.forRoot(options)`** - Configure the module
  - `options.path`: HTTP endpoint path (e.g., `'zero/get-queries'`) (optional, defaults to `'zero/get-queries'`)

### Services

- **`SyncedQueryRegistry`** - Service for managing query handlers (auto-registered)
  - `getHandler(name)` - Get a registered handler by name
  - `getQueryNames()` - Get all registered query names
  - `hasQuery(name)` - Check if a query is registered
  - `getHandlerCount()` - Get the total number of handlers

## Best Practices

1. **Put queries in controllers**: Co-locate REST endpoints and synced queries for related operations
2. **Use your own guards**: Leverage existing authentication infrastructure with `@UseGuards()`
3. **Implement permission filtering**: Queries should filter data based on user permissions
4. **Return empty results for unauthorized access**: Use a query that never matches instead of throwing errors
5. **Inject services**: Use constructor injection to access business logic in synced queries
6. **Document your queries**: Add JSDoc comments describing parameters and return values
7. **Use TypeScript types**: Strongly type your user objects and query parameters

## License

MIT
