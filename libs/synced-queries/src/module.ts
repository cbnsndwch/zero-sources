import { DynamicModule, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { SyncedQueryRegistry } from './services/query-registry.service.js';
import { SyncedQueryTransformService } from './services/query-transform.service.js';
import { createSyncedQueriesController } from './query.controller.js';

/**
 * Configuration options for the SyncedQueriesModule.
 */
export interface SyncedQueriesModuleOptions {
    /**
     * The path where the synced queries endpoint will be mounted.
     *
     * This path is relative to your API root and should match
     * the configuration in your Zero client.
     *
     * @example 'synced-queries'
     * @example 'zero/get-queries'
     * @default 'zero/get-queries'
     */
    path?: string;
}

/**
 * Dynamic module for Zero Synced Queries infrastructure.
 *
 * This module provides all the plumbing needed for Zero synced queries:
 * - Automatic discovery of `@SyncedQuery` methods in controllers and providers
 * - HTTP endpoint for query transformation requests from Zero cache
 * - Query execution and AST conversion service
 * - Error handling per Zero protocol
 *
 * ## Usage
 *
 * Import this module in your app module using `forRoot()` to configure:
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     SyncedQueriesModule.forRoot({
 *       path: 'api/zero/get-queries'
 *     }),
 *     ChatModule,  // Has @SyncedQuery methods in controllers
 *   ]
 * })
 * export class AppModule {}
 * ```
 *
 * ## What You Get
 *
 * After importing this module:
 * 1. **Automatic Discovery**: All `@SyncedQuery` decorated methods are found
 * 2. **HTTP Endpoint**: POST endpoint at your configured path
 * 3. **Transform Service**: Executes queries and converts to AST
 * 4. **No Boilerplate**: Just decorate your methods, everything else is handled
 *
 * ## Architecture
 *
 * The module uses NestJS's DiscoveryModule to scan for decorated methods:
 * - At startup, scans all controllers and providers
 * - Registers handlers in a Map for O(1) lookup
 * - Handles authentication, execution, and error responses
 *
 * @see {@link SyncedQuery} - Decorator for marking query handler methods
 * @see {@link QueryArg} - Decorator for extracting query arguments
 * @see {@link CurrentUser} - Decorator for injecting authenticated user
 */
@Module({})
export class SyncedQueriesModule {
    /**
     * Configure the synced queries module with options.
     *
     * @param options - Configuration options
     * @returns A dynamic module with all synced query infrastructure
     *
     * @example
     * ```typescript
     * // Basic usage with defaults
     * SyncedQueriesModule.forRoot()
     *
     * // Custom path
     * SyncedQueriesModule.forRoot({
     *   path: 'zero/get-queries'
     * })
     * ```
     */
    static forRoot(options: SyncedQueriesModuleOptions = {}): DynamicModule {
        const { path = 'zero/get-queries' } = options;

        // Create controller with dynamic path
        const ControllerClass = createSyncedQueriesController(path);

        return {
            module: SyncedQueriesModule,
            imports: [DiscoveryModule],
            controllers: [ControllerClass],
            providers: [SyncedQueryRegistry, SyncedQueryTransformService],
            exports: [SyncedQueryRegistry, SyncedQueryTransformService]
        };
    }
}
