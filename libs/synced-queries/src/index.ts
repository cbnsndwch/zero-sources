/**
 * NestJS Zero Synced Queries Library
 *
 * A decorator-based system for defining Zero synced query handlers in NestJS applications.
 * Similar to NestJS microservice message patterns, but for Zero's server-side query filtering.
 *
 * ## Quick Start
 *
 * 1. Import the module in your app:
 * ```typescript
 * @Module({
 *   imports: [
 *     SyncedQueriesModule.forRoot({
 *       path: 'api/zero/get-queries',
 *       getUserFromRequest: (req) => req.user
 *     })
 *   ]
 * })
 * export class AppModule {}
 * ```
 *
 * 2. Decorate your query methods:
 * ```typescript
 * @Controller('chat')
 * export class ChatController {
 *   @SyncedQuery('myChats', z.tuple([]))
 *   async myChats(@CurrentUser() user: JwtPayload) {
 *     return builder.chats.where('userId', '=', user.sub);
 *   }
 * }
 * ```
 *
 * That's it! The library handles discovery, routing, and execution.
 *
 * @module @cbnsndwch/nest-zero-synced-queries
 */

// ============================================================================
// Module (import this in your app)
// ============================================================================
export {
    SyncedQueriesModule,
    type SyncedQueriesModuleOptions
} from './module.js';

// ============================================================================
// Decorators (use these in your controllers/providers)
// ============================================================================
export {
    getParameterMetadata,
    QueryArg,
    SyncedQuery
} from './decorators/index.js';

// ============================================================================
// Services (for advanced usage - most users don't need these)
// ============================================================================
export {
    SyncedQueryRegistry,
    SyncedQueryTransformService,
    type RegisteredQueryHandler
} from './services/index.js';

// ============================================================================
// Constants
// ============================================================================
export {
    SYNCED_QUERY_METADATA,
    SYNCED_QUERY_PARAM_METADATA,
    SyncedQueryParamType,
    type QueryHandler,
    type SyncedQueryMetadata,
    type SyncedQueryParamMetadata,
    type TransformQueryError,
    type TransformQueryResult,
    type TransformQuerySuccess,
    type TransformRequestBody,
    type TransformRequestItem
} from './contracts.js';
