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

## Quick Start

### 1. Add to Regular Controller

```typescript
import { Controller, UseGuards } from '@nestjs/common';
import { SyncedQuery, QueryArg } from '@cbnsndwch/nest-zero-synced-queries';
import { z } from 'zod';

@Controller('api')
@UseGuards(YourAuthGuard) // Use your existing guards!
export class MyController {
  @SyncedQuery('myData', z.tuple([]))
  async myData(@YourCurrentUser() user: any) {
    return queryBuilder.data.where('userId', '=', user.sub);
  }
  
  // Regular HTTP endpoints work alongside synced queries
  @Get('status')
  getStatus() {
    return { ok: true };
  }
}
```

### Or Use a Dedicated Provider

```typescript
import { Injectable, UseGuards } from '@nestjs/common';
import { SyncedQuery, QueryArg } from '@cbnsndwch/nest-zero-synced-queries';
import { z } from 'zod';

@Injectable()
@UseGuards(YourAuthGuard) // Use your existing guards!
export class MyQueryProvider {
  @SyncedQuery('myData', z.tuple([]))
  async myData(@YourCurrentUser() user: any) {
    return queryBuilder.data.where('userId', '=', user.sub);
  }
}
```

### 2. Register the Module

```typescript
import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { SyncedQueryRegistry } from '@cbnsndwch/nest-zero-synced-queries';
import { MyController } from './my.controller';

@Module({
  imports: [DiscoveryModule],
  controllers: [MyController], // Controllers are automatically scanned
  providers: [SyncedQueryRegistry],
  exports: [SyncedQueryRegistry]
})
export class MyModule {}
```

### 3. Use in Your Service

```typescript
import { Injectable } from '@nestjs/common';
import { SyncedQueryRegistry } from '@cbnsndwch/nest-zero-synced-queries';

@Injectable()
export class MyService {
  constructor(private registry: SyncedQueryRegistry) {}

  async executeQuery(queryName: string, user: any, args: any[]) {
    const handler = this.registry.getHandler(queryName);
    if (!handler) {
      throw new Error(`Unknown query: ${queryName}`);
    }
    return await handler.execute(user, ...args);
  }
}
```

## API

### Decorators

- **`@SyncedQuery(name, schema)`** - Define a query handler (works on controllers and providers)
- **`@QueryArg(index)`** - Inject a specific query argument by index

Use your own NestJS decorators for authentication:
- **`@UseGuards(YourAuthGuard)`** - Protect queries with your guards
- **`@YourCurrentUser()`** - Inject authenticated user with your own decorator

### Services

- **`SyncedQueryRegistry`** - Service for discovering and managing query handlers
  - `getHandler(name)` - Get a registered handler by name
  - `getQueryNames()` - Get all registered query names
  - `hasQuery(name)` - Check if a query is registered
  - `getHandlerCount()` - Get the total number of handlers

## Examples

### On a Controller (Recommended)

Mix synced queries with regular HTTP endpoints:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { SyncedQuery, QueryArg } from '@cbnsndwch/nest-zero-synced-queries';
import { z } from 'zod';

@Controller('chat')
@UseGuards(JwtAuthGuard) // Your app's guard
export class ChatController {
  // Regular HTTP endpoint
  @Get('status')
  getStatus() {
    return { ok: true };
  }

  // Synced query handler
  @SyncedQuery('myChats', z.tuple([]))
  async myChats(@CurrentUser() user: any) {
    return builder.chats.where('memberIds', 'includes', user.sub);
  }

  // Synced query with arguments
  @SyncedQuery('chatById', z.tuple([z.string()]))
  async chatById(
    @CurrentUser() user: any,
    @QueryArg(0) chatId: string
  ) {
    return builder.chats.where('_id', '=', chatId);
  }
}
```

### On a Provider

For apps that prefer separate query providers:

```typescript
import { Injectable, UseGuards } from '@nestjs/common';
import { SyncedQuery } from '@cbnsndwch/nest-zero-synced-queries';
import { z } from 'zod';

@Injectable()
@UseGuards(JwtAuthGuard) // Your app's guard
export class ChatQueryProvider {
  @SyncedQuery('publicChannels', z.tuple([]))
  async publicChannels() {
    return builder.channels.where('isPublic', '=', true);
  }
}
```

### Using Your Own Guards and Decorators

The library doesn't dictate auth patterns - use what you already have:

```typescript
import { Controller, UseGuards, UseInterceptors } from '@nestjs/common';
import { SyncedQuery } from '@cbnsndwch/nest-zero-synced-queries';

@Controller('api')
@UseGuards(YourAuthGuard, YourRoleGuard) // Your guards
@UseInterceptors(YourLoggingInterceptor) // Your interceptors
export class MyController {
  @SyncedQuery('data', z.tuple([]))
  async getData(
    @YourCurrentUser() user: any, // Your decorator
    @YourTenant() tenant: string  // Your decorator
  ) {
    return builder.data.where('tenantId', '=', tenant);
  }
}
```

## License

MIT
