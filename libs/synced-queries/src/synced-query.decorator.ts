/**
 * Decorators for defining Zero synced query handlers.
 *
 * @remarks
 * This decorator allows developers to define query handlers using a declarative
 * approach similar to NestJS microservice message patterns. Instead of manually
 * registering query implementations in a factory function, developers can annotate
 * class methods with `@SyncedQuery` decorator.
 *
 * ## Architecture
 *
 * The decorator system consists of:
 * 1. **Method Decorator**: Marks methods as query handlers with metadata
 * 2. **Registry Service**: Discovers and registers handlers at startup
 * 3. **Transform Service**: Executes handlers dynamically based on query name
 *
 * ## Usage
 *
 * Create a controller or provider class with decorated query methods:
 *
 * ```typescript
 * @Controller('api')
 * @UseGuards(JwtAuthGuard)
 * export class MyController {
 *   constructor(private roomAccess: RoomAccessService) {}
 *
 *   @SyncedQuery('myChats', z.tuple([]))
 *   async myChats(@CurrentUser() user: JwtPayload) {
 *     // Implementation with auth
 *   }
 *
 *   @SyncedQuery('publicData', z.tuple([z.string()]))
 *   async publicData(@QueryArg(0) id: string) {
 *     // Implementation (no auth required)
 *   }
 * }
 * ```
 *
 * @module synced-query.decorator
 */

import type { z } from 'zod';

import { SYNCED_QUERY_METADATA } from './synced-query.constants.js';

/**
 * Configuration for a synced query handler.
 */
export interface SyncedQueryMetadata {
    /**
     * The name of the query as registered with Zero.
     * Must match the query name used in client-side query definitions.
     */
    queryName: string;

    /**
     * Zod schema for validating query input arguments.
     * Should be a tuple schema matching the expected arguments.
     *
     * @example
     * ```typescript
     * z.tuple([z.string(), z.number()]) // For (id: string, limit: number)
     * z.tuple([]) // For no arguments
     * ```
     */
    inputSchema: z.ZodTypeAny;
}

/**
 * Decorator for Zero synced query handlers.
 *
 * Use this decorator to mark a method as a synced query handler.
 * Works on both controllers and providers.
 *
 * @param queryName - The name of the query as registered with Zero
 * @param inputSchema - Zod schema for validating input arguments
 *
 * @example
 * ```typescript
 * // Public query (no authentication)
 * @SyncedQuery('publicChannels', z.tuple([]))
 * async publicChannels() {
 *   return builder.channels.where('isPublic', '=', true);
 * }
 *
 * // Authenticated query (use your own guards and decorators)
 * @UseGuards(JwtAuthGuard)
 * @SyncedQuery('myChats', z.tuple([]))
 * async myChats(@CurrentUser() user: JwtPayload) {
 *   return builder.chats.where('userId', '=', user.sub);
 * }
 *
 * // Query with arguments
 * @SyncedQuery('channelById', z.tuple([z.string()]))
 * async channelById(@QueryArg(0) channelId: string) {
 *   return builder.channels.where('_id', '=', channelId);
 * }
 * ```
 *
 * @remarks
 * The method signature can use any NestJS parameter decorators you want.
 * Use @QueryArg(index) to explicitly map query arguments by position.
 */
export function SyncedQuery(
    queryName: string,
    inputSchema: z.ZodTypeAny
): MethodDecorator {
    return (
        target: any,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ) => {
        const metadata: SyncedQueryMetadata = {
            queryName,
            inputSchema
        };

        // Store metadata on the method
        Reflect.defineMetadata(
            SYNCED_QUERY_METADATA,
            metadata,
            descriptor.value
        );

        return descriptor;
    };
}

/**
 * Type definition for a query handler function.
 */
export type QueryHandler = (...args: any[]) => Promise<any>;
