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
} from './synced-queries.module.js';

// ============================================================================
// Decorators (use these in your controllers/providers)
// ============================================================================
export {
    SyncedQuery,
    type SyncedQueryMetadata,
    type QueryHandler
} from './synced-query.decorator.js';

export {
    QueryArg,
    getParameterMetadata,
    type SyncedQueryParamMetadata
} from './synced-query-params.decorator.js';

// ============================================================================
// Services (for advanced usage - most users don't need these)
// ============================================================================
export {
    SyncedQueryRegistry,
    type RegisteredQueryHandler,
    type SyncedQueryExecutionContext
} from './synced-query-registry.service.js';

export {
    SyncedQueryTransformService,
    type TransformRequestItem,
    type TransformRequestBody,
    type TransformQuerySuccess,
    type TransformQueryError,
    type TransformQueryResult
} from './synced-query-transform.service.js';

// ============================================================================
// Constants
// ============================================================================
export { SYNCED_QUERY_METADATA } from './synced-query.constants.js';

export {
    SYNCED_QUERY_PARAM_METADATA,
    SyncedQueryParamType
} from './synced-query-params.constants.js';
