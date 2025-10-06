import { Module } from '@nestjs/common';

import { ZeroQueryAuth } from './auth.helper.js';
import { ZeroQueriesController } from './zero-queries.controller.js';

/**
 * Module for Zero synced query infrastructure.
 *
 * Provides authentication, query handling, and access control for Zero's
 * synced query system. This module encapsulates all functionality needed
 * to process query requests from the Zero cache server.
 *
 * @remarks
 * This module leverages globally configured dependencies:
 * - **JwtModule**: Configured in {@link AuthModule} with @Global() decorator
 * - **MongooseModule**: Configured in global-modules.ts for database access
 * - **ConfigModule**: Configured in global-modules.ts for environment variables
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
 * The module exports {@link ZeroQueryAuth} for use in other modules that need
 * to authenticate query requests or extract user context.
 *
 * ## Development Status
 *
 * Current implementation provides basic infrastructure:
 * - ✅ Authentication helper (ZeroQueryAuth)
 * - ✅ Controller endpoint (/api/zero/get-queries)
 * - ⏳ Query handler implementation (planned for future issues)
 * - ⏳ Room access service (planned for future issues)
 *
 * @see {@link ZeroQueryAuth} - JWT authentication helper
 * @see {@link ZeroQueriesController} - Query endpoint controller
 * @see {@link https://rocicorp.dev/docs/zero/synced-queries Zero Synced Queries Documentation}
 */
@Module({
    controllers: [ZeroQueriesController],
    providers: [ZeroQueryAuth],
    exports: [ZeroQueryAuth]
})
export class ZeroQueriesModule {}
