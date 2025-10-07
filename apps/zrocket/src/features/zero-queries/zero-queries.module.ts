import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { Room, RoomSchema } from '../chat/entities/rooms/room-base.entity.js';

import { ZeroQueryAuth } from './auth.helper.js';
import { ZeroQueriesController } from './zero-queries.controller.js';
import { RoomAccessService } from './room-access.service.js';

/**
 * Module for Zero synced query infrastructure.
 *
 * Provides authentication, query handling, and access control for Zero's
 * synced query system. This module encapsulates all functionality needed
 * to process query requests from the Zero cache server.
 *
 * @remarks
 * This module imports JwtModule to access JwtService for authentication.
 * Other dependencies are globally configured:
 * - **JwtModule**: Imported here to provide JwtService to ZeroQueryAuth
 * - **MongooseModule**: Configured globally in global-modules.ts for database access
 * - **ConfigModule**: Configured globally in global-modules.ts for environment variables
 *
 * ## Architecture
 *
 * The module is organized around these core responsibilities:
 * 1. **Authentication**: Extract and validate JWT tokens from requests
 * 2. **Query Routing**: Route requests to appropriate query handlers
 * 3. **Access Control**: Apply user-based filtering to query results
 * 4. **Context Management**: Provide QueryContext for server-side query filtering
 *
 * ## Usage
 *
 * Import this module in your application to enable Zero synced queries:
 *
 * ```typescript
 * @Module({
 *   imports: [
 *     // ... other modules
 *     ZeroQueriesModule
 *   ]
 * })
 * export class AppModule {}
 * ```
 *
 * The module exports {@link ZeroQueryAuth} and {@link RoomAccessService} for
 * use in other modules that need to authenticate query requests or check room access.
 *
 * ## Development Status
 *
 * Current implementation provides basic infrastructure:
 * - ✅ Authentication helper (ZeroQueryAuth)
 * - ✅ Controller endpoint (/api/zero/get-queries)
 * - ✅ Room access service (RoomAccessService)
 * - ⏳ Query handler implementation (planned for future issues)
 * - ⏳ Permission filter logic (planned for future issues)
 *
 * @see {@link ZeroQueryAuth} - JWT authentication helper
 * @see {@link RoomAccessService} - Room access and membership service
 * @see {@link ZeroQueriesController} - Query endpoint controller
 * @see {@link https://rocicorp.dev/docs/zero/synced-queries Zero Synced Queries Documentation}
 * @see {@link https://github.com/cbnsndwch/zero-sources/issues/78 Issue #78 - Create Room Access Service}
 */
@Module({
    imports: [
        JwtModule,
        MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }])
    ],
    controllers: [ZeroQueriesController],
    providers: [ZeroQueryAuth, RoomAccessService],
    exports: [ZeroQueryAuth, RoomAccessService]
})
export class ZeroQueriesModule {}
