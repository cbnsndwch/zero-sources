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

import {
    SYNCED_QUERY_PARAM_METADATA,
    SyncedQueryParamType
} from './synced-query-params.constants.js';

/**
 * Metadata for a parameter decorator.
 */
export interface SyncedQueryParamMetadata {
    /**
     * The type of parameter injection.
     */
    type: SyncedQueryParamType;

    /**
     * The index of the parameter in the method signature.
     */
    parameterIndex: number;

    /**
     * Additional data for the parameter (e.g., argument index for QueryArg).
     */
    data?: any;
}

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
