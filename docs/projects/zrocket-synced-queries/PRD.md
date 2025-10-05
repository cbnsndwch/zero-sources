# Product Requirements Document: [ZSQ] Zrocket Synced Queries Implementation

## Document Information

- **Project**: [ZSQ] Zrocket Synced Queries
- **Project Code**: ZSQ
- **Version**: 1.0
- **Date**: October 5, 2025
- **Status**: Planning
- **Owner**: Engineering Team

## Executive Summary

This PRD outlines the implementation of Zero's Synced Queries feature to enable proper permission enforcement for the Zrocket messaging application. Currently, Zrocket cannot enforce member-only access to private rooms and DMs because Zero's standard permissions system doesn't support checking membership in JSON array columns. Synced Queries solve this by allowing server-side query filtering that clients cannot bypass.

## Problem Statement

### Current Issues

1. **Security Vulnerability**: Any logged-in user can see ALL direct messages and private groups, not just their own
2. **No Message Filtering**: All users can see messages in ALL rooms, regardless of membership
3. **Technical Limitation**: Zero's standard permissions don't support checking if a value exists in a JSON array column (`memberIds`)

### Business Impact

- **Security Risk**: Private conversations and group discussions are exposed to unauthorized users
- **Privacy Violation**: Users can access data they shouldn't see
- **Compliance**: May violate privacy regulations (GDPR, etc.)
- **Trust**: Cannot deploy to production without proper access controls

## Goals & Objectives

### Primary Goals

1. Implement secure, member-only access to private rooms and DMs
2. Ensure messages are only visible to users with access to the containing room
3. Maintain Zero's real-time, instant UI experience
4. No breaking changes to existing data structure

### Success Criteria

- ✅ Non-logged-in users can only see public channels
- ✅ Logged-in users can only see rooms they are members of
- ✅ Messages are filtered based on room access
- ✅ Performance remains acceptable (queries < 100ms)
- ✅ No client-side permission bypasses possible

### Non-Goals

- Changing the MongoDB schema structure
- Implementing row-level security in MongoDB
- Supporting offline writes (Zero limitation)
- Retroactive permission auditing

## Solution Overview

### Approach: Zero Synced Queries

**Synced Queries** allow us to define queries on both client and server, where the server implementation adds permission filters that clients cannot bypass. This is Zero's recommended approach for complex permission scenarios.

#### How It Works

1. **Client**: Defines optimistic queries for instant UI
2. **Server**: Receives query requests, adds permission filters, returns filtered results
3. **Zero Cache**: Manages synchronization and real-time updates
4. **Result**: Secure, performant, real-time data access

#### Key Advantage

The server can use **any filtering logic**, including checking JSON array membership, custom business logic, or complex joins that aren't expressible in standard Zero permissions.

## Architecture

### System Components

```
┌─────────────┐
│   Client    │ Defines queries optimistically
│  (React)    │ 
└──────┬──────┘
       │ Query request with args
       ▼
┌─────────────┐
│ Zero Cache  │ Forwards to get-queries endpoint
│             │
└──────┬──────┘
       │ HTTP POST /api/zero/get-queries
       ▼
┌─────────────┐
│   Server    │ 1. Authenticates user
│  (NestJS)   │ 2. Applies permission filters
│             │ 3. Returns filtered query
└──────┬──────┘
       │ Filtered query AST
       ▼
┌─────────────┐
│ Zero Cache  │ Executes query, syncs results
│             │
└──────┬──────┘
       │ Real-time updates
       ▼
┌─────────────┐
│   Client    │ Receives filtered data
│             │
└─────────────┘
```

### Data Flow

1. Client requests `myChats()` query
2. Zero Cache forwards to `POST /api/zero/get-queries`
3. Server authenticates JWT, extracts `userID`
4. Server adds filter: `.where('memberIds', 'contains', userID)`
5. Zero Cache executes filtered query against replica
6. Client receives only authorized data
7. Real-time updates maintain filtered view

## Technical Implementation

### Phase 1: Setup Infrastructure (Week 1)

#### 1.1 Environment Configuration

**File**: `apps/zrocket/.env`

```bash
# Add to existing env vars
ZERO_GET_QUERIES_URL="http://localhost:3000/api/zero/get-queries"
```

**File**: `apps/source-mongodb-server/.env`

```bash
# Point zero-cache to zrocket API
ZERO_GET_QUERIES_URL="http://localhost:3000/api/zero/get-queries"
```

#### 1.2 Create Query Context Type

**File**: `libs/zrocket-contracts/src/queries/context.ts` (NEW)

```typescript
/**
 * Query context available to all synced queries
 * Populated from JWT claims on the server
 */
export type QueryContext = {
    /** The authenticated user's ID from JWT sub claim */
    userID: string;
    
    /** Optional role for admin features */
    role?: 'admin' | 'user';
    
    /** Username for display purposes */
    username?: string;
};

/**
 * Type guard to check if context has required auth
 */
export function isAuthenticated(ctx: QueryContext | undefined): ctx is QueryContext {
    return ctx !== undefined && !!ctx.userID;
}
```

#### 1.3 Export Query Index

**File**: `libs/zrocket-contracts/src/queries/index.ts` (NEW)

```typescript
export * from './context.js';
export * from './channels.js';
export * from './rooms.js';
export * from './messages.js';
```

### Phase 2: Define Synced Queries (Week 1)

#### 2.1 Public Channels Query

**File**: `libs/zrocket-contracts/src/queries/channels.ts` (NEW)

```typescript
import { syncedQuery } from '@rocicorp/zero';
import { z } from 'zod';
import type { Schema } from '../schema/schema.js';

/**
 * Public channels visible to all users (including non-authenticated)
 */
export const publicChannels = syncedQuery<Schema>(
    'publicChannels',
    z.tuple([]), // no arguments
    (builder) => 
        builder.channels
            .orderBy('name', 'asc')
);

/**
 * Get a specific public channel by ID
 */
export const channelById = syncedQuery<Schema>(
    'channelById',
    z.tuple([z.string()]), // channelId
    (builder, channelId) =>
        builder.channels
            .where('_id', '=', channelId)
            .related('messages', cb => 
                cb.orderBy('createdAt', 'desc').limit(100)
            )
            .related('systemMessages', cb =>
                cb.orderBy('createdAt', 'desc').limit(50)
            )
);
```

#### 2.2 User's Private Rooms Queries

**File**: `libs/zrocket-contracts/src/queries/rooms.ts` (NEW)

```typescript
import { syncedQueryWithContext } from '@rocicorp/zero';
import { z } from 'zod';
import type { Schema } from '../schema/schema.js';
import type { QueryContext } from './context.js';

/**
 * Get all direct message chats for the authenticated user
 * Server will filter by memberIds
 */
export const myChats = syncedQueryWithContext<Schema, QueryContext>(
    'myChats',
    z.tuple([]), // no args - userID comes from context
    (builder, ctx) => {
        // Client side: optimistically show all
        // Server side: will filter by ctx.userID in memberIds
        return builder.chats
            .orderBy('lastMessageAt', 'desc');
    }
);

/**
 * Get all private groups for the authenticated user
 * Server will filter by memberIds
 */
export const myGroups = syncedQueryWithContext<Schema, QueryContext>(
    'myGroups',
    z.tuple([]),
    (builder, ctx) => {
        return builder.groups
            .orderBy('lastMessageAt', 'desc');
    }
);

/**
 * Get a specific chat by ID
 * Server will verify user is a member
 */
export const chatById = syncedQueryWithContext<Schema, QueryContext>(
    'chatById',
    z.tuple([z.string()]), // chatId
    (builder, ctx, chatId) => {
        return builder.chats
            .where('_id', '=', chatId)
            .related('messages', cb => 
                cb.orderBy('createdAt', 'desc').limit(100)
            )
            .related('systemMessages', cb =>
                cb.orderBy('createdAt', 'desc').limit(50)
            );
    }
);

/**
 * Get a specific group by ID
 * Server will verify user is a member
 */
export const groupById = syncedQueryWithContext<Schema, QueryContext>(
    'groupById',
    z.tuple([z.string()]), // groupId
    (builder, ctx, groupId) => {
        return builder.groups
            .where('_id', '=', groupId)
            .related('messages', cb => 
                cb.orderBy('createdAt', 'desc').limit(100)
            )
            .related('systemMessages', cb =>
                cb.orderBy('createdAt', 'desc').limit(50)
            );
    }
);

/**
 * Get all rooms (channels, chats, groups) for sidebar
 * Server will filter private rooms by membership
 */
export const myRooms = syncedQueryWithContext<Schema, QueryContext>(
    'myRooms',
    z.tuple([]),
    (builder, ctx) => {
        // This is a convenience query that combines all room types
        // Server will apply appropriate filters to each type
        return {
            channels: builder.channels.orderBy('name', 'asc'),
            chats: builder.chats.orderBy('lastMessageAt', 'desc'),
            groups: builder.groups.orderBy('lastMessageAt', 'desc')
        };
    }
);
```

#### 2.3 Messages Queries

**File**: `libs/zrocket-contracts/src/queries/messages.ts` (NEW)

```typescript
import { syncedQueryWithContext } from '@rocicorp/zero';
import { z } from 'zod';
import type { Schema } from '../schema/schema.js';
import type { QueryContext } from './context.js';

export const RoomTypeEnum = z.enum(['channel', 'chat', 'group']);
export type RoomType = z.infer<typeof RoomTypeEnum>;

/**
 * Get messages for a specific room
 * Server will verify user has access to the room before returning messages
 */
export const roomMessages = syncedQueryWithContext<Schema, QueryContext>(
    'roomMessages',
    z.tuple([z.string(), RoomTypeEnum, z.number().optional()]),
    (builder, ctx, roomId, roomType, limit = 100) => {
        // All messages for the specified room
        return builder.userMessages
            .where('roomId', '=', roomId)
            .orderBy('createdAt', 'desc')
            .limit(limit);
    }
);

/**
 * Get system messages for a specific room
 */
export const roomSystemMessages = syncedQueryWithContext<Schema, QueryContext>(
    'roomSystemMessages',
    z.tuple([z.string(), RoomTypeEnum, z.number().optional()]),
    (builder, ctx, roomId, roomType, limit = 50) => {
        return builder.systemMessages
            .where('roomId', '=', roomId)
            .orderBy('createdAt', 'desc')
            .limit(limit);
    }
);

/**
 * Search messages across all accessible rooms
 */
export const searchMessages = syncedQueryWithContext<Schema, QueryContext>(
    'searchMessages',
    z.tuple([z.string()]), // search query
    (builder, ctx, searchQuery) => {
        // Server will filter to only rooms user has access to
        return builder.userMessages
            .where('contents', 'LIKE', `%${searchQuery}%`)
            .orderBy('createdAt', 'desc')
            .limit(50);
    }
);
```

### Phase 3: Server Implementation (Week 2)

#### 3.1 Create Authentication Helper

**File**: `apps/zrocket/src/features/zero-queries/auth.helper.ts` (NEW)

```typescript
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from '@cbnsndwch/zrocket-contracts/auth';
import type { QueryContext } from '@cbnsndwch/zrocket-contracts/queries';

export class ZeroQueryAuth {
    constructor(private jwtService: JwtService) {}

    /**
     * Extract and validate JWT from request
     * Returns QueryContext for authenticated requests, undefined for anonymous
     */
    async authenticateRequest(request: Request): Promise<QueryContext | undefined> {
        const authHeader = request.headers.get('Authorization');
        
        if (!authHeader) {
            // No auth header - anonymous access
            return undefined;
        }

        if (!authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Invalid authorization header');
        }

        const token = authHeader.substring(7);
        
        try {
            const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
            
            return {
                userID: payload.sub,
                role: payload.role as 'admin' | 'user',
                username: payload.name
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
```

#### 3.2 Create Permission Filter Logic

**File**: `apps/zrocket/src/features/zero-queries/permission-filters.ts` (NEW)

```typescript
import type { QueryContext } from '@cbnsndwch/zrocket-contracts/queries';
import type { Query } from '@rocicorp/zero';

/**
 * Apply server-side permission filters to queries
 * This is where we enforce the membership checks that standard permissions can't do
 */
export class PermissionFilters {
    /**
     * Filter chats to only show rooms where user is a member
     */
    static filterMyChats<T>(query: Query<T>, ctx: QueryContext | undefined): Query<T> {
        if (!ctx) {
            // Anonymous users cannot see any chats
            return query.where('_id', '=', '__none__'); // Returns empty
        }

        // Add the critical filter: user must be in memberIds array
        // This is what standard permissions couldn't do!
        return query.where('memberIds', 'array-contains', ctx.userID);
    }

    /**
     * Filter groups to only show rooms where user is a member
     */
    static filterMyGroups<T>(query: Query<T>, ctx: QueryContext | undefined): Query<T> {
        if (!ctx) {
            return query.where('_id', '=', '__none__');
        }

        return query.where('memberIds', 'array-contains', ctx.userID);
    }

    /**
     * Filter single chat - verify user is a member
     */
    static filterChatById<T>(query: Query<T>, ctx: QueryContext | undefined): Query<T> {
        if (!ctx) {
            return query.where('_id', '=', '__none__');
        }

        return query.where('memberIds', 'array-contains', ctx.userID);
    }

    /**
     * Filter single group - verify user is a member
     */
    static filterGroupById<T>(query: Query<T>, ctx: QueryContext | undefined): Query<T> {
        if (!ctx) {
            return query.where('_id', '=', '__none__');
        }

        return query.where('memberIds', 'array-contains', ctx.userID);
    }

    /**
     * Filter messages - only show if user has access to the room
     * This requires checking room membership
     */
    static async filterRoomMessages<T>(
        query: Query<T>,
        ctx: QueryContext | undefined,
        roomId: string,
        roomType: 'channel' | 'chat' | 'group',
        roomService: RoomAccessService
    ): Promise<Query<T>> {
        // Public channels are always accessible
        if (roomType === 'channel') {
            return query;
        }

        // For private rooms, verify membership
        if (!ctx) {
            return query.where('_id', '=', '__none__');
        }

        const hasAccess = await roomService.userHasRoomAccess(
            ctx.userID,
            roomId,
            roomType
        );

        if (!hasAccess) {
            return query.where('_id', '=', '__none__');
        }

        return query;
    }

    /**
     * Filter search results to only accessible rooms
     */
    static async filterSearchMessages<T>(
        query: Query<T>,
        ctx: QueryContext | undefined,
        roomService: RoomAccessService
    ): Promise<Query<T>> {
        if (!ctx) {
            // Anonymous users can only search public channels
            // This requires a join or subquery - may need custom implementation
            return query; // TODO: implement proper filtering
        }

        // Get list of accessible room IDs for user
        const accessibleRoomIds = await roomService.getUserAccessibleRoomIds(ctx.userID);

        // Filter messages to only those rooms
        return query.where('roomId', 'IN', accessibleRoomIds);
    }
}
```

#### 3.3 Create Room Access Service

**File**: `apps/zrocket/src/features/zero-queries/room-access.service.ts` (NEW)

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { Room } from '../rooms/entities/room.entity';

@Injectable()
export class RoomAccessService {
    constructor(
        @InjectModel('Room') private roomModel: Model<Room>
    ) {}

    /**
     * Check if user has access to a specific room
     */
    async userHasRoomAccess(
        userId: string,
        roomId: string,
        roomType: 'channel' | 'chat' | 'group'
    ): Promise<boolean> {
        // Public channels are always accessible
        if (roomType === 'channel') {
            return true;
        }

        // For chats and groups, check memberIds
        const room = await this.roomModel.findOne({
            _id: roomId,
            t: roomType === 'chat' ? 'd' : 'p',
            memberIds: userId
        }).lean();

        return !!room;
    }

    /**
     * Get all room IDs accessible to a user
     */
    async getUserAccessibleRoomIds(userId: string): Promise<string[]> {
        const rooms = await this.roomModel.find({
            $or: [
                { t: 'c' }, // All public channels
                { memberIds: userId } // Private rooms where user is member
            ]
        }, { _id: 1 }).lean();

        return rooms.map(r => r._id.toString());
    }
}
```

#### 3.4 Create Get Queries Handler

**File**: `apps/zrocket/src/features/zero-queries/get-queries.handler.ts` (NEW)

```typescript
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { handleGetQueriesRequest, withValidation } from '@rocicorp/zero/server';
import { ReadonlyJSONValue } from '@rocicorp/zero';
import { schema } from '@cbnsndwch/zrocket-contracts/schema';
import * as queries from '@cbnsndwch/zrocket-contracts/queries';
import { ZeroQueryAuth } from './auth.helper';
import { PermissionFilters } from './permission-filters';
import { RoomAccessService } from './room-access.service';

@Injectable()
export class GetQueriesHandler {
    private auth: ZeroQueryAuth;
    private validated: Record<string, any>;

    constructor(
        private jwtService: JwtService,
        private roomService: RoomAccessService
    ) {
        this.auth = new ZeroQueryAuth(jwtService);
        
        // Wrap all queries with validation
        this.validated = Object.fromEntries(
            Object.values(queries)
                .filter(q => q && typeof q === 'object' && 'queryName' in q)
                .map(q => [q.queryName, withValidation(q)])
        );
    }

    /**
     * Handle incoming get-queries request from zero-cache
     */
    async handleRequest(request: Request): Promise<Response> {
        return await handleGetQueriesRequest(
            async (name, args) => await this.getQuery(name, args, request),
            schema,
            request
        );
    }

    /**
     * Get a specific query with permission filters applied
     */
    private async getQuery(
        name: string,
        args: readonly ReadonlyJSONValue[],
        request: Request
    ) {
        const queryFn = this.validated[name];
        if (!queryFn) {
            throw new Error(`Unknown query: ${name}`);
        }

        // Authenticate the request
        const ctx = await this.auth.authenticateRequest(request);

        // Execute the query function to get base query
        const baseQuery = queryFn(ctx, ...args);

        // Apply server-side permission filters
        const filteredQuery = await this.applyPermissionFilters(
            name,
            baseQuery,
            ctx,
            args
        );

        return { query: filteredQuery };
    }

    /**
     * Apply permission filters based on query name
     */
    private async applyPermissionFilters(
        queryName: string,
        query: any,
        ctx: any,
        args: readonly ReadonlyJSONValue[]
    ) {
        switch (queryName) {
            case 'myChats':
                return PermissionFilters.filterMyChats(query, ctx);
            
            case 'myGroups':
                return PermissionFilters.filterMyGroups(query, ctx);
            
            case 'chatById':
                return PermissionFilters.filterChatById(query, ctx);
            
            case 'groupById':
                return PermissionFilters.filterGroupById(query, ctx);
            
            case 'roomMessages':
            case 'roomSystemMessages':
                const [roomId, roomType] = args;
                return await PermissionFilters.filterRoomMessages(
                    query,
                    ctx,
                    roomId as string,
                    roomType as any,
                    this.roomService
                );
            
            case 'searchMessages':
                return await PermissionFilters.filterSearchMessages(
                    query,
                    ctx,
                    this.roomService
                );
            
            // No filtering needed for public queries
            case 'publicChannels':
            case 'channelById':
                return query;
            
            default:
                console.warn(`No permission filter defined for query: ${queryName}`);
                return query;
        }
    }
}
```

#### 3.5 Create NestJS Module and Controller

**File**: `apps/zrocket/src/features/zero-queries/zero-queries.module.ts` (NEW)

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ZeroQueriesController } from './zero-queries.controller';
import { GetQueriesHandler } from './get-queries.handler';
import { RoomAccessService } from './room-access.service';
import { RoomSchema } from '../rooms/entities/room.entity';

@Module({
    imports: [
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('auth.jwt.secret'),
                signOptions: {
                    expiresIn: configService.get<number>('auth.jwt.tokenLifetime')
                }
            }),
            inject: [ConfigService]
        }),
        MongooseModule.forFeature([
            { name: 'Room', schema: RoomSchema }
        ])
    ],
    controllers: [ZeroQueriesController],
    providers: [GetQueriesHandler, RoomAccessService],
    exports: [GetQueriesHandler]
})
export class ZeroQueriesModule {}
```

**File**: `apps/zrocket/src/features/zero-queries/zero-queries.controller.ts` (NEW)

```typescript
import { Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { GetQueriesHandler } from './get-queries.handler';

@Controller('api/zero')
export class ZeroQueriesController {
    constructor(private handler: GetQueriesHandler) {}

    @Post('get-queries')
    async getQueries(@Req() request: Request) {
        return await this.handler.handleRequest(request as any);
    }
}
```

#### 3.6 Register Module in App

**File**: `apps/zrocket/src/app.module.ts`

```typescript
// Add to imports array
import { ZeroQueriesModule } from './features/zero-queries/zero-queries.module';

@Module({
    imports: [
        // ... existing imports
        ZeroQueriesModule,
    ],
    // ...
})
export class AppModule {}
```

### Phase 4: Update Client Usage (Week 3)

#### 4.1 Update Hooks to Use Synced Queries

**File**: `apps/zrocket/app/hooks/use-channels.ts`

```typescript
import { useQuery } from '@rocicorp/zero/react';
import { publicChannels } from '@cbnsndwch/zrocket-contracts/queries';

export default function useChannels() {
    const [channels, result] = useQuery(publicChannels());
    
    return {
        channels: channels || [],
        isLoading: result.type === 'loading',
        error: result.type === 'error' ? result.error : null
    };
}
```

**File**: `apps/zrocket/app/hooks/use-channel.ts`

```typescript
import { useQuery } from '@rocicorp/zero/react';
import { channelById } from '@cbnsndwch/zrocket-contracts/queries';

export default function useChannel(channelId: string | undefined) {
    const [channel, result] = useQuery(
        channelId ? channelById(channelId) : null
    );
    
    return {
        channel: channel?.[0],
        isLoading: result.type === 'loading',
        error: result.type === 'error' ? result.error : null
    };
}
```

**File**: `apps/zrocket/app/hooks/use-chats.ts`

```typescript
import { useQuery } from '@rocicorp/zero/react';
import { myChats } from '@cbnsndwch/zrocket-contracts/queries';

export default function useChats() {
    const [chats, result] = useQuery(myChats());
    
    return {
        chats: chats || [],
        isLoading: result.type === 'loading',
        error: result.type === 'error' ? result.error : null
    };
}
```

**File**: `apps/zrocket/app/hooks/use-chat.ts`

```typescript
import { useQuery } from '@rocicorp/zero/react';
import { chatById } from '@cbnsndwch/zrocket-contracts/queries';

export default function useChat(chatId: string | undefined) {
    const [chat, result] = useQuery(
        chatId ? chatById(chatId) : null
    );
    
    return {
        chat: chat?.[0],
        isLoading: result.type === 'loading',
        error: result.type === 'error' ? result.error : null
    };
}
```

**File**: `apps/zrocket/app/hooks/use-groups.ts`

```typescript
import { useQuery } from '@rocicorp/zero/react';
import { myGroups } from '@cbnsndwch/zrocket-contracts/queries';

export default function useGroups() {
    const [groups, result] = useQuery(myGroups());
    
    return {
        groups: groups || [],
        isLoading: result.type === 'loading',
        error: result.type === 'error' ? result.error : null
    };
}
```

**File**: `apps/zrocket/app/hooks/use-group.ts`

```typescript
import { useQuery } from '@rocicorp/zero/react';
import { groupById } from '@cbnsndwch/zrocket-contracts/queries';

export default function useGroup(groupId: string | undefined) {
    const [group, result] = useQuery(
        groupId ? groupById(groupId) : null
    );
    
    return {
        group: group?.[0],
        isLoading: result.type === 'loading',
        error: result.type === 'error' ? result.error : null
    };
}
```

**File**: `apps/zrocket/app/hooks/use-room-messages.ts`

```typescript
import { useQuery } from '@rocicorp/zero/react';
import { roomMessages, type RoomType } from '@cbnsndwch/zrocket-contracts/queries';

export default function useRoomMessages(
    roomId: string | undefined,
    roomType: RoomType | undefined,
    limit = 100
) {
    const [messages, result] = useQuery(
        roomId && roomType ? roomMessages(roomId, roomType, limit) : null
    );
    
    return {
        messages: messages || [],
        isLoading: result.type === 'loading',
        error: result.type === 'error' ? result.error : null
    };
}
```

#### 4.2 Update Components to Use New Hooks

All components using the old hooks should continue to work as the hook interfaces remain the same. However, verify and update any components that directly use Zero queries:

**Files to check**:
- `apps/zrocket/app/routes/*.tsx`
- `apps/zrocket/app/components/**/*.tsx`

Replace direct query usage like:
```typescript
// Old
const [chats] = useQuery(zero.query.chats);

// New
const { chats } = useChats();
```

### Phase 5: Schema & Permissions Updates (Week 3)

#### 5.1 Update Permissions to Work with Synced Queries

**File**: `libs/zrocket-contracts/src/schema/permissions.ts`

Since queries are now enforced server-side, simplify permissions:

```typescript
export const permissions = definePermissions<JwtPayload, Schema>(schema, () => {
    const isLoggedIn = (
        claims: JwtPayload,
        { cmpLit }: ExpressionBuilder<Schema, any>
    ) => cmpLit(claims.sub, 'IS NOT', null);

    const isMessageSender = (
        claims: JwtPayload,
        { cmpLit }: ExpressionBuilder<Schema, 'userMessages'>
    ) => cmpLit('sender.id', '=', claims.sub ?? '');

    return {
        // Public channels - anyone can read
        channels: {
            row: {
                select: ANYONE_CAN,
                insert: [isLoggedIn],
                update: { preMutation: NOBODY_CAN },
                delete: NOBODY_CAN
            }
        },

        // Private rooms - access controlled via synced queries
        // These permissions are fallbacks only
        chats: {
            row: {
                select: NOBODY_CAN, // Must use myChats() query
                insert: [isLoggedIn],
                update: { preMutation: NOBODY_CAN },
                delete: NOBODY_CAN
            }
        },

        groups: {
            row: {
                select: NOBODY_CAN, // Must use myGroups() query
                insert: [isLoggedIn],
                update: { preMutation: NOBODY_CAN },
                delete: NOBODY_CAN
            }
        },

        // Messages - access controlled via synced queries
        userMessages: {
            row: {
                select: ANYONE_CAN, // Filtered by roomMessages() query
                insert: [isLoggedIn],
                update: { preMutation: [isMessageSender] },
                delete: [isMessageSender]
            }
        },

        systemMessages: {
            row: {
                select: ANYONE_CAN, // Filtered by query
                insert: NOBODY_CAN,
                update: { preMutation: NOBODY_CAN },
                delete: NOBODY_CAN
            }
        },

        users: {
            row: {
                select: ANYONE_CAN,
                insert: NOBODY_CAN,
                update: { preMutation: NOBODY_CAN },
                delete: NOBODY_CAN
            }
        }
    };
});
```

#### 5.2 Build and Export

```bash
# Build the contracts library with new queries
cd libs/zrocket-contracts
pnpm build

# Export configuration
pnpm export:config
```

### Phase 6: Testing & Validation (Week 4)

#### 6.1 Unit Tests

**File**: `apps/zrocket/src/features/zero-queries/__tests__/permission-filters.spec.ts` (NEW)

```typescript
import { PermissionFilters } from '../permission-filters';
import type { QueryContext } from '@cbnsndwch/zrocket-contracts/queries';

describe('PermissionFilters', () => {
    describe('filterMyChats', () => {
        it('should filter chats for authenticated users', () => {
            const ctx: QueryContext = { userID: 'user-123' };
            const mockQuery = createMockQuery();
            
            const filtered = PermissionFilters.filterMyChats(mockQuery, ctx);
            
            expect(filtered.where).toHaveBeenCalledWith(
                'memberIds',
                'array-contains',
                'user-123'
            );
        });

        it('should return empty for anonymous users', () => {
            const filtered = PermissionFilters.filterMyChats(createMockQuery(), undefined);
            
            expect(filtered.where).toHaveBeenCalledWith('_id', '=', '__none__');
        });
    });

    // ... more tests
});
```

#### 6.2 Integration Tests

**File**: `apps/zrocket/src/features/zero-queries/__tests__/get-queries.e2e.spec.ts` (NEW)

```typescript
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

describe('Get Queries E2E', () => {
    let app: INestApplication;
    let jwtToken: string;

    beforeAll(async () => {
        // Setup test app
    });

    it('should return only user chats for authenticated request', async () => {
        const response = await request(app.getHttpServer())
            .post('/api/zero/get-queries')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
                queries: [
                    { name: 'myChats', args: [] }
                ]
            });

        expect(response.status).toBe(200);
        expect(response.body.queries[0].result).toBeDefined();
        // Verify only accessible chats returned
    });

    it('should reject anonymous access to private queries', async () => {
        const response = await request(app.getHttpServer())
            .post('/api/zero/get-queries')
            .send({
                queries: [
                    { name: 'myChats', args: [] }
                ]
            });

        expect(response.status).toBe(200);
        expect(response.body.queries[0].result).toEqual([]);
    });
});
```

#### 6.3 Manual Testing Checklist

- [ ] **Anonymous User**:
  - [ ] Can see public channels
  - [ ] Cannot see any chats or groups
  - [ ] Cannot see messages in private rooms
  - [ ] Can see messages in public channels

- [ ] **Authenticated User A**:
  - [ ] Can see all public channels
  - [ ] Can see only their own chats
  - [ ] Can see only groups they're members of
  - [ ] Can see messages in accessible rooms only
  - [ ] Cannot see User B's private chats

- [ ] **Authenticated User B**:
  - [ ] Same isolation as User A
  - [ ] Cannot access User A's data

- [ ] **Performance**:
  - [ ] Queries respond in < 100ms
  - [ ] Real-time updates still work
  - [ ] No lag in UI

- [ ] **Error Handling**:
  - [ ] Expired JWT handled gracefully
  - [ ] Invalid query names return error
  - [ ] Malformed requests rejected

### Phase 7: Deployment & Rollout (Week 5)

#### 7.1 Gradual Rollout Strategy

**Stage 1: Deploy Infrastructure (Monday)**
- Deploy server changes with synced queries endpoint
- Deploy zero-cache with ZERO_GET_QUERIES_URL configured
- Keep existing queries working alongside
- Monitor for errors

**Stage 2: Enable for Beta Users (Wednesday)**
- Feature flag to enable synced queries for specific users
- Monitor performance and errors
- Gather feedback

**Stage 3: Full Rollout (Friday)**
- Enable synced queries for all users
- Disable direct access to private room tables
- Monitor for issues

**Stage 4: Cleanup (Next Week)**
- Remove old query code if stable
- Document lessons learned
- Plan future enhancements

#### 7.2 Monitoring & Observability

**Metrics to Track**:
- Query response times
- Error rates by query name
- Authentication failures
- Memory usage
- Database query performance

**Logging**:
```typescript
// Add to GetQueriesHandler
private logger = new Logger('ZeroQueries');

private async getQuery(...) {
    this.logger.log(`Query: ${name}, User: ${ctx?.userID || 'anon'}, Args: ${JSON.stringify(args)}`);
    
    const startTime = Date.now();
    const result = await this.executeQuery(...);
    const duration = Date.now() - startTime;
    
    this.logger.log(`Query ${name} completed in ${duration}ms`);
    
    return result;
}
```

#### 7.3 Rollback Plan

If issues arise:

1. **Immediate**: Set `ZERO_GET_QUERIES_URL=""` to disable synced queries
2. **Quick Fix**: Deploy hotfix to server
3. **Full Rollback**: Revert to previous permissions system

Keep previous Docker images tagged for quick rollback.

## Success Metrics

### Security Metrics
- ✅ 0 unauthorized data access incidents
- ✅ All private rooms properly isolated
- ✅ Penetration testing passes

### Performance Metrics
- ✅ P95 query latency < 100ms
- ✅ No degradation in UI responsiveness
- ✅ Real-time updates < 50ms delay

### Reliability Metrics
- ✅ 99.9% uptime for query endpoint
- ✅ < 0.1% error rate
- ✅ Zero data leaks

## Risks & Mitigations

### Risk 1: Performance Degradation
**Impact**: High  
**Probability**: Medium  
**Mitigation**: 
- Performance testing before rollout
- Query optimization
- Caching strategies
- Database indexes

### Risk 2: Complex Authorization Logic
**Impact**: Medium  
**Probability**: Medium  
**Mitigation**:
- Comprehensive unit tests
- Code reviews
- Security audit
- Gradual rollout

### Risk 3: Zero-Cache Compatibility
**Impact**: High  
**Probability**: Low  
**Mitigation**:
- Test with exact Zero version in use
- Monitor Zero GitHub for breaking changes
- Have rollback plan ready

### Risk 4: Database Query Performance
**Impact**: Medium  
**Probability**: Medium  
**Mitigation**:
- Ensure proper MongoDB indexes exist
- Monitor query execution times
- Use explain() to optimize slow queries
- Consider caching room membership

## Open Questions

1. **Q**: Should we cache room membership checks?  
   **A**: TBD - Monitor performance first, add caching if needed

2. **Q**: How to handle edge cases like user removed from room while viewing?  
   **A**: Zero will sync the change and remove data automatically

3. **Q**: Should admins have special access to all rooms?  
   **A**: Yes - implement role-based overrides in permission filters

4. **Q**: How to handle message search across rooms?  
   **A**: Phase 2 feature - requires efficient room access checks

## Future Enhancements

### Phase 2 (Post-Launch)
- Message search across accessible rooms
- Typing indicators with proper filtering
- Read receipts with privacy controls
- Notification preferences per room

### Phase 3 (Long-term)
- Advanced admin controls
- Audit logging for access
- Data retention policies
- Archive/export features

## Dependencies

### External Dependencies
- Zero 0.23+ (synced queries support)
- NestJS 10+
- MongoDB 6+
- Node 20+

### Internal Dependencies
- JWT authentication system working
- Room membership data accurate
- Change source server operational
- Zero cache running

## Timeline

| Week | Phase | Deliverables |
|------|-------|--------------|
| 1 | Setup + Queries | Infrastructure, query definitions |
| 2 | Server Implementation | API endpoint, filters, tests |
| 3 | Client Updates | Hooks, components, integration |
| 4 | Testing | Unit, integration, manual tests |
| 5 | Deployment | Gradual rollout, monitoring |

## Approval

- [ ] Engineering Lead
- [ ] Security Team
- [ ] Product Manager
- [ ] DevOps Team

## References

- [Zero Synced Queries Documentation](https://zero.rocicorp.dev/docs/synced-queries)
- [Zrocket Permissions Limitations](../zrocket/PERMISSIONS_LIMITATIONS.md)
- [Zero Schema Definition](../../libs/zrocket-contracts/src/schema/)
- [Implementation Guide](../zrocket/IMPLEMENTATION_GUIDE.md)

---

**Document Version**: 1.0  
**Last Updated**: October 5, 2025  
**Next Review**: Post-deployment retrospective
