/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Injectable,
    Logger,
    BadRequestException,
    Inject,
    Scope,
    NotFoundException,
    InternalServerErrorException
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { type Connection } from 'mongoose';

import type { MutationResponse } from 'node_modules/@rocicorp/zero/out/zero-protocol/src/push.js';
import type { CustomMutatorDefs } from '@rocicorp/zero';
import type { PushProcessor } from '@rocicorp/zero/pg';

import { invariant } from '@cbnsndwch/zero-contracts';

import {
    TOKEN_ZERO_MUTATORS,
    serverMutationBodySchema,
    type ServerMutationParams,
    type Mutation,
    type ServerMutationBody
} from '../../contracts/mutation.contracts.js';

import { ZeroMutatorRegistry } from '../../discovery/zero-mutator-registry.service.js';
import { MongoTransaction } from './mongo-transaction.js';
import {
    MutationAlreadyProcessedError,
    OutOfOrderMutation,
    splitMutatorKey
} from './utils.js';

// TODO: infer mutator definitions type
type Mutators = CustomMutatorDefs<any>;

// TODO: infer server schema type
type ServerSchema = any;

@Injectable({ scope: Scope.REQUEST })
export class PushProcessorV1 {
    #logger = new Logger(PushProcessorV1.name);
    #conn: Connection;

    // Store request and body for parameter decorators
    @Inject('REQUEST') private request: any;
    private currentRequestBody: ServerMutationBody | undefined;

    constructor(
        @InjectConnection() conn: Connection,
        private readonly registry: ZeroMutatorRegistry
    ) {
        this.#conn = conn;
    }

    async process(query: ServerMutationParams, body: ServerMutationBody) {
        const req = serverMutationBodySchema.parse(body);
        this.currentRequestBody = req;

        // Attach body to request for parameter decorators
        this.request.__zeroRequestBody = req;

        if (req.pushVersion !== 1) {
            throw new BadRequestException(
                `Unsupported push version ${req.pushVersion}`
            );
        }

        const mutations: MutationResponse[] = [];
        for (const mutation of req.mutations) {
            // Attach current mutation to request for parameter decorators
            this.request.__zeroCurrentMutation = mutation;
            try {
                const res = await this.#processMutation(query, req, mutation);
                mutations.push(res);
                if ('error' in res.result) {
                    break; // Stop on first error that requires stopping
                }
            } finally {
                // Clean up mutation from request context after processing
                delete this.request.__zeroCurrentMutation;
            }
        }
        // Clean up request body from request context after all mutations
        delete this.request.__zeroRequestBody;
        return { mutations };
    }

    async #processMutation(
        params: ServerMutationParams,
        req: ServerMutationBody,
        mutation: Mutation
    ): Promise<MutationResponse> {
        try {
            const result = await this.#processMutationImpl(
                params,
                req,
                mutation,
                false
            );
            return result;
        } catch (e: any) {
            // Handle LMID errors
            if (e instanceof OutOfOrderMutation) {
                this.#logger.error(e);
                return {
                    id: { clientID: mutation.clientID, id: mutation.id },
                    result: { error: 'oooMutation', details: e.message }
                };
            }
            if (e instanceof MutationAlreadyProcessedError) {
                this.#logger.warn(e);
                return {
                    id: { clientID: mutation.clientID, id: mutation.id },
                    result: { error: 'alreadyProcessed', details: e.message }
                };
            }

            // Handle application errors (including retry logic for LMID update)
            this.#logger.error(
                `Application error processing mutation ${mutation.id} (Client: ${mutation.clientID}): ${e.message}`,
                e.stack
            );
            try {
                // Retry only to update LMID, skipping the handler dispatch
                await this.#processMutationImpl(params, req, mutation, true);
                // If LMID update succeeds during retry, return 'app' error
                return {
                    id: { clientID: mutation.clientID, id: mutation.id },
                    result: { error: 'app', details: e.message }
                };
            } catch (retryError: any) {
                // Handle errors during the retry (e.g., concurrent LMID update)
                this.#logger.error(
                    `Error during LMID update retry for mutation ${mutation.id}: ${retryError}`
                );
                if (retryError instanceof OutOfOrderMutation) {
                    return {
                        id: { clientID: mutation.clientID, id: mutation.id },
                        result: {
                            error: 'oooMutation',
                            details: retryError.message
                        }
                    };
                }
                if (retryError instanceof MutationAlreadyProcessedError) {
                    return {
                        id: { clientID: mutation.clientID, id: mutation.id },
                        result: {
                            error: 'alreadyProcessed',
                            details: retryError.message
                        }
                    };
                }
                // If retry itself fails unexpectedly, return a generic server error
                return {
                    id: { clientID: mutation.clientID, id: mutation.id },
                    result: {
                        error: 'app',
                        details: `Failed to process mutation and update state: ${retryError.message}`
                    }
                };
            }
        }
    }

    async #processMutationImpl(
        params: ServerMutationParams,
        req: ServerMutationBody,
        mutation: Mutation,
        isRetry: boolean // If true, only run LMID check, skip handler
    ): Promise<MutationResponse> {
        if (mutation.type !== 'custom') {
            throw new Error('Only custom mutations are supported.');
        }

        const tx = new MongoTransaction(this.#conn);

        try {
            await tx.beginTransaction();

            // Check LMID
            await tx.checkAndIncrementLastMutationId(
                req.clientGroupID,
                mutation.clientID,
                mutation.id
            );

            // Dispatch using Registry ONLY if not a retry
            if (!isRetry) {
                await this.#dispatchMutationWithRegistry(tx, mutation, req);
            }

            await tx.commit();

            return {
                id: { clientID: mutation.clientID, id: mutation.id },
                result: {}
            };
        } catch (err: any) {
            await tx.rollback();
            // Re-throw specific errors for #processMutation to handle correctly
            if (
                err instanceof OutOfOrderMutation ||
                err instanceof MutationAlreadyProcessedError
            ) {
                throw err;
            }
            // Wrap other errors (including handler errors)
            throw new InternalServerErrorException(
                `Mutation handler failed: ${err.message}`,
                { cause: err }
            );
        }
    }

    // New dispatch method using the registry
    async #dispatchMutationWithRegistry(
        tx: MongoTransaction,
        mutation: Mutation,
        reqBody: ServerMutationBody
    ): Promise<void> {
        const handlerDetails = this.registry.getHandler(mutation.name);

        if (!handlerDetails) {
            throw new NotFoundException(
                `No mutation handler found for: ${mutation.name}`
            );
        }

        const { instance, handlerMethodKey, paramFactories } = handlerDetails;
        const handler = instance[handlerMethodKey as keyof typeof instance];

        // Prepare arguments using the stored factories
        const args: any[] = [];
        for (const paramFactory of paramFactories) {
            // The factory expects the current mutation and request body
            args[paramFactory.index] = paramFactory.factory(mutation, reqBody);
        }

        // Check if the handler needs the transaction object
        const expectedParamCount = (handler as any).length; // Cast handler to any
        if (args.length < expectedParamCount) {
            // Assume the last missing parameter is the transaction
            args.push(tx);
        }

        try {
            // Execute the handler with prepared arguments
            await (handler as any).apply(instance, args); // Cast handler to any
        } catch (error: any) {
            this.#logger.error(
                `Error executing mutation handler ${mutation.name}: ${error.message}`, // Use error.message
                error.stack // Use error.stack
            );
            // Re-throw the original error to be caught by #processMutationImpl
            throw error;
        }
    }
}
