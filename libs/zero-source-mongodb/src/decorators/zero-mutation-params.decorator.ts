/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExecutionContext, Logger, Type } from '@nestjs/common';

import type {
    Mutation,
    ServerMutationBody
} from '../contracts/mutation.contracts.js';

import {
    ZERO_MUTATION_PARAMS_METADATA,
    ZERO_TRANSACTION_PARAM_METADATA // Import or define the new constant
} from './zero-mutation.constants.js';

const logger = new Logger('ZeroMutationParams');

// Internal helper type for parameter metadata
export type ZeroParamData = {
    index: number;
    data?: any;
    factory: (
        mutation: Mutation | undefined,
        reqBody: ServerMutationBody | undefined
    ) => any;
};

/**
 * Retrieves the current Mutation object from the execution context.
 * Assumes PushProcessorV1 attaches it to the request object.
 */
export function getMutationFromContext(
    ctx: ExecutionContext
): Mutation | undefined {
    const request = ctx.switchToHttp().getRequest();
    // Define a convention for attaching the mutation`
    const mutation = request.__zeroCurrentMutation;
    if (!mutation) {
        logger.warn(
            `Could not find '__zeroCurrentMutation' on request object. @MutationArgs() and related decorators may not work.`
        );
    }
    return mutation;
}

/**
 * Retrieves the current Push request body from the execution context.
 * Assumes PushProcessorV1 attaches it to the request object.
 */
export function getRequestBodyFromContext(
    ctx: ExecutionContext
): ServerMutationBody | undefined {
    const request = ctx.switchToHttp().getRequest();
    // Define a convention for attaching the request body
    const reqBody = request.__zeroRequestBody;
    if (!reqBody) {
        logger.warn(
            `Could not find '__zeroRequestBody' on request object. Decorators needing clientGroupID may not work.`
        );
    }
    return reqBody;
}

/**
/**
 * Factory function for creating Zero mutation parameter decorators.
 */
function createZeroParamDecorator( // Reverted name
    factory: (
        mutation: Mutation | undefined,
        reqBody: ServerMutationBody | undefined
    ) => any
) {
    // Removed explicit : ParameterDecorator return type
    return (
        target: object,
        key: string | symbol | undefined,
        index: number
    ) => {
        // Removed explicit : void return type
        // Decorators on constructor parameters (where key is undefined) are not supported by this logic.
        if (typeof key === 'undefined') {
            // Use Type<any> for better type compatibility with target.constructor.name
            logger.error(
                `Zero mutation parameter decorators cannot be applied to constructor parameters (at index ${index} on ${(target as Type<any>).name}).`
            );
            return; // Do not attempt to set metadata if key is undefined
        }

        const params: ZeroParamData[] =
            Reflect.getMetadata(
                ZERO_MUTATION_PARAMS_METADATA,
                target, // Use target (prototype) for instance methods
                key
            ) || [];

        params.push({ index, factory, data: undefined });
        Reflect.defineMetadata(
            ZERO_MUTATION_PARAMS_METADATA,
            params,
            target, // Use target (prototype) for instance methods
            key
        );
    };
}

/**
 * Parameter decorator to extract the arguments of the current Zero mutation (`mutation.args[0]`).
 *
 * @example
 * ```typescript
 * @ZeroMutationHandler('create')
 * async createIssue(@MutationArgs() args: CreateIssueArgs) { ... }
 * ```
 */
export const MutationArgs = createZeroParamDecorator(
    mutation => mutation?.args?.[0]
); // Reverted back to custom factory

/**
 * Parameter decorator to extract the clientID of the current Zero mutation.
 *
 * @example
 * ```typescript
 * @ZeroMutationHandler('create')
 * async createIssue(@MutationClientID() clientID: string) { ... }
 * ```
 */
export const MutationClientId = createZeroParamDecorator(
    mutation => mutation?.clientID
); // Use reverted factory

/**
 * Parameter decorator to extract the mutation ID of the current Zero mutation.
 *
 * @example
 * ```typescript
 * @ZeroMutationHandler('create')
 * async createIssue(@MutationID() mutationID: number) { ... }
 * ```
 */
export const MutationId = createZeroParamDecorator(mutation => mutation?.id); // Use reverted factory

/**
 * Parameter decorator to extract the clientGroupID from the push request body.
 *
 * @example
 * ```typescript
 * @ZeroMutationHandler('create')
 * async createIssue(@ClientGroupID() clientGroupID: string) { ... }
 * ```
 */
export const ClientGroupId = createZeroParamDecorator(
    (mutation, reqBody) => reqBody?.clientGroupID
); // Use reverted factory

/**
 * Parameter decorator to extract the entire mutation object.
 *
 * Example: `@MutationObject() mutation: Mutation`
 */
export const MutationObject = createZeroParamDecorator(mutation => mutation); // Use reverted factory

/**
 * Parameter decorator to extract the full mutation object.
 *
 * @example
 * ```typescript
 * @ZeroMutationHandler('create')
 * async createIssue(@MutationParam() mutation: Mutation) { ... }
 * ```
 */
export const MutationParam = createZeroParamDecorator(mutation => mutation); // Use reverted factory

/**
 * Parameter decorator to extract the MongoTransaction instance that's passed to the handler.
 * This should be used as the last parameter in your handler method.
 *
 * @example
 * ```typescript
 * @ZeroMutationHandler('create')
 * async createIssue(@MutationArgs() args: any, @Transaction() tx: ClientSession) { ... } // Assuming ClientSession from 'mongodb'
 * ```
 */
export function Transaction(): ParameterDecorator {
    return (
        target: object,
        key: string | symbol | undefined,
        index: number
    ): void => {
        // Decorators on constructor parameters (where key is undefined) are not supported by this logic.
        if (typeof key === 'undefined') {
            // Use Type<any> for better type compatibility with target.constructor.name
            logger.error(
                `@Transaction() decorator cannot be applied to constructor parameters (at index ${index} on ${(target as Type<any>).name}).`
            );
            return; // Do not attempt to set metadata if key is undefined
        }

        // Check if another parameter is already marked for transaction injection
        const existingIndex = Reflect.getMetadata(
            ZERO_TRANSACTION_PARAM_METADATA,
            target,
            key
        );
        if (typeof existingIndex === 'number') {
            logger.error(
                `@Transaction() decorator can only be applied to one parameter per method (method: ${String(key)} on ${(target as Type<any>).name}). Found existing at index ${existingIndex}, new at index ${index}.`
            );
            // Optionally throw an error here instead of just logging
            return;
        }

        // Store the index of the parameter designated for transaction injection.
        // The actual injection logic (likely in a guard or interceptor)
        // will read this metadata and pass the transaction object.
        Reflect.defineMetadata(
            ZERO_TRANSACTION_PARAM_METADATA,
            index,
            target,
            key
        );
    };
}
