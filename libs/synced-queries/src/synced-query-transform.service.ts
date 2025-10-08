import {
    Injectable,
    InternalServerErrorException,
    Logger
} from '@nestjs/common';

import { SyncedQueryRegistry } from './synced-query-registry.service.js';

/**
 * Request item structure from Zero cache server.
 */
export interface TransformRequestItem {
    id: string;
    name: string;
    args: any[];
}

/**
 * Successful query transformation response.
 */
export interface TransformQuerySuccess {
    id: string;
    name: string;
    ast: any;
}

/**
 * Error response for failed query transformation.
 */
export interface TransformQueryError {
    error: 'app';
    id: string;
    name: string;
    details: any;
}

/**
 * Union type for query transformation results.
 */
export type TransformQueryResult = TransformQuerySuccess | TransformQueryError;

/**
 * Request body type from Zero cache (array of query requests).
 */
export type TransformRequestBody = TransformRequestItem[];

/**
 * Service for transforming Zero query requests into AST responses.
 *
 * This service coordinates:
 * 1. Looking up query handlers in the registry
 * 2. Executing handlers with user context and arguments
 * 3. Converting query builders to AST format
 * 4. Handling errors per Zero protocol
 *
 * @remarks
 * This is internal plumbing - users don't interact with this directly.
 * The `SyncedQueriesController` uses this service to process requests.
 *
 * ## Architecture
 *
 * The service processes queries in parallel for performance:
 * - Each query is executed independently
 * - Errors are isolated to individual query responses
 * - Handler lookup is O(1) via Map
 * - Target overhead: < 100ms for multiple queries
 *
 * ## Error Handling
 *
 * Errors are caught and returned as error responses per Zero protocol:
 * - Unknown query names return 'app' errors
 * - Query execution failures return 'app' errors with details
 * - Missing toAST() methods return 'app' errors
 *
 * @example
 * ```typescript
 * // Request from Zero cache:
 * POST /api/zero/get-queries
 * [
 *   { "id": "q1", "name": "myChats", "args": [] },
 *   { "id": "q2", "name": "chatById", "args": ["chat-123"] }
 * ]
 *
 * // Response:
 * [
 *   { "id": "q1", "name": "myChats", "ast": { ... } },
 *   { "id": "q2", "name": "chatById", "ast": { ... } }
 * ]
 * ```
 */
@Injectable()
export class SyncedQueryTransformService {
    private readonly logger = new Logger(SyncedQueryTransformService.name);

    constructor(private readonly registry: SyncedQueryRegistry) {}

    /**
     * Transform multiple query requests in parallel.
     *
     * @param user - Authenticated user context (or undefined for anonymous)
     * @param input - Array of query requests from Zero cache
     * @returns Array of query responses (success or error)
     *
     * @remarks
     * This method processes multiple queries in parallel for performance.
     * Each query is executed independently and errors are isolated to
     * individual query responses rather than failing the entire request.
     */
    async transformQueries(
        user: any,
        input: TransformRequestBody
    ): Promise<TransformQueryResult[]> {
        const startTime = Date.now();

        try {
            if (input.length === 0) {
                this.logger.verbose('No queries requested');
                return [];
            }

            this.logger.verbose(
                `Processing ${input.length} query request(s): ${input.map(q => q.name).join(', ')}`
            );

            const responses = await Promise.all(
                input.map(item => this.transformQuery(user, item))
            );

            const elapsed = Date.now() - startTime;
            this.logger.verbose(
                `Processed ${input.length} queries in ${elapsed}ms`
            );

            return responses;
        } catch (cause) {
            const msg =
                cause instanceof Error
                    ? `Error processing synced query transform request: ${cause.message}`
                    : 'Error processing synced query transform request';
            this.logger.error(msg);
            throw new InternalServerErrorException(msg, { cause });
        }
    }

    /**
     * Transform a single query request.
     *
     * @param user - Authenticated user context (or undefined for anonymous)
     * @param input - Single query request
     * @returns Query response with AST or error
     *
     * @remarks
     * This method isolates query execution errors so that one failing query
     * doesn't prevent other queries from succeeding.
     */
    private async transformQuery(
        user: any,
        input: TransformRequestItem
    ): Promise<TransformQueryResult> {
        const { id, name, args } = input;

        try {
            // 1. Look up handler
            const handler = this.registry.getHandler(name);

            if (!handler) {
                this.logger.warn(`Unknown query: ${name}`);
                return {
                    error: 'app',
                    id,
                    name,
                    details: {
                        message: `Unknown query: ${name}`,
                        availableQueries: this.registry.getQueryNames()
                    }
                };
            }

            // 2. Execute handler
            const queryBuilder = await handler.execute(user, ...args);

            // 3. Convert to AST
            const ast = (queryBuilder as any).toAST?.();

            if (!ast) {
                this.logger.error(
                    `Query ${name} did not return a valid query builder with toAST()`
                );
                return {
                    error: 'app',
                    id,
                    name,
                    details: {
                        message:
                            'Query implementation error: missing toAST() method',
                        queryName: name
                    }
                };
            }

            this.logger.debug(`Successfully executed query: ${name}`);

            return { id, name, ast };
        } catch (cause) {
            const msg = cause instanceof Error ? cause.message : String(cause);
            this.logger.error(
                `Error executing query ${name}: ${msg}`,
                (cause as Error).stack
            );

            return {
                error: 'app',
                id,
                name,
                details: { msg, cause }
            };
        }
    }
}
