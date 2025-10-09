/**
 * Parameter decorator for synced query handlers.
 *
 * @remarks
 * This decorator allows explicitly mapping query arguments to method parameters.
 *
 * ## Usage
 *
 * ```typescript
 * @Controller('api')
 * export class MyController {
 *   @SyncedQuery('search', z.tuple([z.string(), z.number()]))
 *   async search(
 *     @QueryArg(0) query: string,
 *     @QueryArg(1) limit: number
 *   ) {
 *     // query = args[0], limit = args[1]
 *   }
 * }
 * ```
 *
 * @module synced-query-params.decorator
 */

import 'reflect-metadata';
import type { z } from 'zod';

import {
    SYNCED_QUERY_METADATA,
    SYNCED_QUERY_PARAM_METADATA,
    SyncedQueryMetadata,
    SyncedQueryParamMetadata,
    SyncedQueryParamType
} from '../contracts.js';

/**
 * Parameter decorator to inject a query argument by index.
 *
 * Use this decorator to explicitly map query arguments to method parameters.
 *
 * @param index - The index of the argument in the query args array
 *
 * @example
 * ```typescript
 * @SyncedQuery('search', z.tuple([z.string(), z.number()]))
 * async search(
 *   @CurrentUser() user: JwtPayload,
 *   @QueryArg(0) query: string,
 *   @QueryArg(1) limit: number
 * ) {
 *   // query = args[0], limit = args[1]
 * }
 * ```
 *
 * @remarks
 * - Useful when mixing authenticated and query parameters
 * - Makes parameter mapping explicit
 * - Can skip parameters if not needed
 */
export function QueryArg(index: number): ParameterDecorator {
    return (
        target: any,
        propertyKey: string | symbol | undefined,
        parameterIndex: number
    ) => {
        if (propertyKey === undefined) return;

        const existingParams: SyncedQueryParamMetadata[] =
            Reflect.getOwnMetadata(
                SYNCED_QUERY_PARAM_METADATA,
                target,
                propertyKey
            ) || [];

        existingParams.push({
            type: SyncedQueryParamType.QUERY_ARG,
            parameterIndex,
            data: index
        });

        Reflect.defineMetadata(
            SYNCED_QUERY_PARAM_METADATA,
            existingParams,
            target,
            propertyKey
        );
    };
}

/**
 * Get parameter metadata for a method.
 *
 * @param target - The target object (class prototype)
 * @param propertyKey - The method name
 * @returns Array of parameter metadata, sorted by parameter index
 */
export function getParameterMetadata(
    target: any,
    propertyKey: string | symbol
): SyncedQueryParamMetadata[] {
    const params: SyncedQueryParamMetadata[] =
        Reflect.getOwnMetadata(
            SYNCED_QUERY_PARAM_METADATA,
            target,
            propertyKey
        ) || [];

    // Sort by parameter index
    return params.sort((a, b) => a.parameterIndex - b.parameterIndex);
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
