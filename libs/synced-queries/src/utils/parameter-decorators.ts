/**
 * Custom parameter decorator support for synced queries.
 *
 * This module provides infrastructure to make NestJS parameter decorators
 * (created with `createParamDecorator`) work with `@SyncedQuery` methods.
 *
 * ## Problem
 *
 * NestJS's `createParamDecorator()` creates decorators that store metadata
 * which is normally read by NestJS's routing infrastructure. However, synced
 * queries are discovered and invoked through our custom system, so the
 * parameter decorators never get executed.
 *
 * ## Solution
 *
 * We manually read parameter decorator metadata from the method using
 * NestJS's ROUTE_ARGS_METADATA key, which stores ALL parameter decorators
 * (both built-in like @Body(), @Param() and custom ones like @CurrentUser()).
 */

import type { ExecutionContext } from '@nestjs/common';

// NestJS metadata key for parameter decorators
// This matches ROUTE_ARGS_METADATA from @nestjs/common/constants
const ROUTE_ARGS_METADATA = '__routeArguments__';

/**
 * Parameter decorator metadata entry.
 */
export interface ParamDecoratorMetadata {
    /**
     * The index of the parameter.
     */
    index: number;

    /**
     * The factory function to execute.
     * This is the function passed to `createParamDecorator()`.
     */
    factory: (data: any, ctx: ExecutionContext) => any;

    /**
     * Data passed to the decorator (if any).
     */
    data?: any;

    /**
     * The type/kind of parameter (for built-in decorators).
     * Custom decorators created with createParamDecorator don't have this.
     */
    type?: string | symbol;
}

/**
 * Read parameter decorator metadata from a method.
 *
 * This reads the ROUTE_ARGS_METADATA which contains ALL parameter decorators,
 * including both NestJS built-in decorators and custom decorators created
 * with `createParamDecorator()`.
 *
 * @param target - The prototype of the class
 * @param methodName - The method name
 * @returns Array of parameter decorator metadata, indexed by parameter position
 */
export function readParameterDecorators(
    target: any,
    methodName: string
): Map<number, ParamDecoratorMetadata> {
    const metadata = Reflect.getMetadata(
        ROUTE_ARGS_METADATA,
        target,
        methodName
    );

    const result = new Map<number, ParamDecoratorMetadata>();

    if (!metadata) {
        return result;
    }

    // The metadata is an object where keys are like "0:0", "1:1", etc.
    // Format: "{paramtype}:{paramindex}"
    for (const [key, value] of Object.entries(metadata)) {
        const parts = key.split(':');
        if (parts.length < 2 || !parts[1]) continue;

        const index = parseInt(parts[1], 10);
        if (isNaN(index)) continue;

        const entry = value as any;

        result.set(index, {
            index,
            factory: entry.factory,
            data: entry.data,
            type: entry.type
        });
    }

    return result;
}

/**
 * Execute parameter decorators and return resolved parameter values.
 *
 * @param decorators - Map of parameter decorators by index
 * @param executionContext - The NestJS execution context
 * @returns Array of resolved parameter values
 */
export function executeParameterDecorators(
    decorators: Map<number, ParamDecoratorMetadata>,
    executionContext: ExecutionContext
): Map<number, any> {
    const results = new Map<number, any>();

    for (const [index, decorator] of decorators.entries()) {
        const { factory, data } = decorator;

        if (factory) {
            const value = factory(data, executionContext);
            results.set(index, value);
        }
    }

    return results;
}
