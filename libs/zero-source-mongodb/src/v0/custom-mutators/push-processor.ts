/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Injectable,
    Logger,
    BadRequestException,
    Inject
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

@Injectable()
export class PushProcessorV1 {
    #logger = new Logger(PushProcessorV1.name);
    #conn: Connection;
    #mutators: Mutators;

    constructor(
        @InjectConnection() conn: Connection,
        @Inject(TOKEN_ZERO_MUTATORS) mutators: Mutators
    ) {
        this.#conn = conn;
        this.#mutators = mutators;
    }

    async process(query: ServerMutationParams, body: ServerMutationBody) {
        // TODO: move validation to an interceptor

        // parse and validate the request body using the pushBodySchema. Throws if invalid.
        const req = serverMutationBodySchema.parse(body);

        // check if the push protocol version sent by the client is supported (currently only version 1).
        if (req.pushVersion !== 1) {
            const err = `Unsupported push version ${req.pushVersion} for clientGroupID ${req.clientGroupID}`;

            // log an error if the version is unsupported.
            this.#logger.error?.(err);

            // Return an error response indicating the unsupported version.
            throw new BadRequestException({
                err
            });
        }

        // Initialize an array to store the responses for each mutation.
        const mutations: MutationResponse[] = [];

        // Iterate over each mutation included in the request body.
        for (const mutation of req.mutations) {
            const res = await this.#processMutation(query, req, mutation);

            mutations.push(res);

            // Check if the mutation processing resulted in an error
            // (e.g., OOO, already processed, application error).
            if ('error' in res.result) {
                // If there was an error, stop processing further mutations in
                // this push request. zero-cache will handle retries or error reporting
                // based on the error type.
                break;
            }
        }

        // Return the final PushResponse containing the array of mutation responses.
        // If processing stopped early due to an error, this array will contain
        // responses up to and including the failed mutation.
        return {
            mutations
        };
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
        } catch (e) {
            if (e instanceof OutOfOrderMutation) {
                this.#logger.error?.(e);
                return {
                    id: {
                        clientID: mutation.clientID,
                        id: mutation.id
                    },
                    result: {
                        error: 'oooMutation',
                        details: e.message
                    }
                };
            }

            if (e instanceof MutationAlreadyProcessedError) {
                this.#logger.warn?.(e);
                return {
                    id: {
                        clientID: mutation.clientID,
                        id: mutation.id
                    },
                    result: {
                        error: 'alreadyProcessed',
                        details: e.message
                    }
                };
            }

            const result = await this.#processMutationImpl(
                params,
                req,
                mutation,
                true
            );

            if ('error' in result.result) {
                this.#logger.error?.(
                    `Error ${result.result.error} processing mutation ${mutation.id} for client ${mutation.clientID}: ${result.result.details}`
                );
                return result;
            }

            const details =
                e instanceof Error
                    ? e.message
                    : typeof e === 'string'
                      ? e
                      : 'An error occurred while processing the mutation';
            return {
                id: result.id,
                result: {
                    error: 'app',
                    details
                }
            };
        }
    }

    async #processMutationImpl(
        params: ServerMutationParams,
        req: ServerMutationBody,
        mutation: Mutation,
        isRetry: boolean
    ): Promise<MutationResponse> {
        if (mutation.type !== 'custom') {
            throw new Error(
                'crud mutators are deprecated in favor of custom mutators.'
            );
        }

        const tx = new MongoTransaction(this.#conn);

        try {
            await tx.beginTransaction();

            await tx.checkAndIncrementLastMutationId(
                req.clientGroupID,
                mutation.clientID,
                mutation.id
            );

            if (!isRetry) {
                const serverSchema = await getServerSchema(dbTx, this.#schema);
                await this.#dispatchMutation(
                    tx,
                    serverSchema,
                    this.#mutators,
                    mutation
                );
            }

            await tx.commit();

            return {
                id: {
                    clientID: mutation.clientID,
                    id: mutation.id
                },
                result: {}
            };
        } catch (err) {}
    }

    #dispatchMutation(
        tx: MongoTransaction,
        serverSchema: ServerSchema,
        mutators: Mutators,
        m: Mutation
    ): Promise<void> {
        // const zeroTx = new TransactionImpl(
        //   tx,
        //   m.clientID,
        //   m.id,
        //   this.#mutate(tx, serverSchema),
        //   this.#query(tx, serverSchema),
        // );

        const [namespace, name] = splitMutatorKey(m.name);
        if (name === undefined) {
            const mutator = mutators[namespace];
            invariant(
                typeof mutator === 'function',
                () => `could not find mutator ${m.name}`
            );

            return mutator(zeroTx, m.args[0]);
        }

        const mutatorGroup = mutators[namespace];
        invariant(
            typeof mutatorGroup === 'object',
            () => `could not find mutators for namespace ${namespace}`
        );

        const mutator = mutatorGroup[name];
        invariant(
            typeof mutator === 'function',
            () => `could not find mutator ${m.name}`
        );

        return mutator(zeroTx, m.args[0]);
    }
}
