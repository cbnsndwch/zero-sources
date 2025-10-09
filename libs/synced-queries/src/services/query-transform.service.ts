import {
    Injectable,
    InternalServerErrorException,
    Logger
} from '@nestjs/common';

import type {
    TransformQueryResult,
    TransformRequestBody,
    TransformRequestItem
} from '../contracts.js';
import { SyncedQueryRegistry } from './query-registry.service.js';

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
     * @param request - The full Express/HTTP request object
     * @param input - Array of query requests from Zero cache
     * @returns Array of query responses (success or error)
     *
     * @remarks
     * This method processes multiple queries in parallel for performance.
     * Each query is executed independently and errors are isolated to
     * individual query responses rather than failing the entire request.
     *
     * The full request object is passed through to guards so they can access
     * headers, cookies, and other request properties.
     */
    async transformQueries(
        request: any,
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
                input.map(item => this.transformQuery(request, item))
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
     * @param request - The full Express/HTTP request object
     * @param input - Single query request
     * @returns Query response with AST or error
     *
     * @remarks
     * This method isolates query execution errors so that one failing query
     * doesn't prevent other queries from succeeding.
     *
     * The full request object is passed to the handler executor, which uses it
     * to create a proper ExecutionContext for guards and other NestJS features.
     */
    private async transformQuery(
        request: any,
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

            // 2. Execute handler and get AST
            const ast = await handler.execute(request, ...args);

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
