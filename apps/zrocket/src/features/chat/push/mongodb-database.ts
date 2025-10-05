import { Logger } from '@nestjs/common';
import type { Connection } from 'mongoose';

import type {
    Database,
    TransactionProviderHooks,
    TransactionProviderInput
} from '@rocicorp/zero/server';

import { ClientMutation } from '../entities/client-mutation.entity.js';

import type { MongoTransaction } from './mongo-transaction.js';

/**
 * MongoDB Database adapter for Zero's PushProcessor.
 * Implements the Database interface using Mongoose connections and sessions.
 */
export class MongoDatabase implements Database<MongoTransaction> {
    private readonly logger = new Logger(MongoDatabase.name);

    constructor(private readonly connection: Connection) {}

    async transaction<R>(
        callback: (
            tx: MongoTransaction,
            hooks: TransactionProviderHooks
        ) => Promise<R>,
        input: TransactionProviderInput
    ): Promise<R> {
        const session = await this.connection.startSession();

        try {
            return await session.withTransaction(async () => {
                const tx: MongoTransaction = {
                    session,
                    connection: this.connection,
                    clientID: input.clientID,
                    mutationID: input.mutationID
                };

                const hooks: TransactionProviderHooks = {
                    updateClientMutationID: async () => {
                        // Get or create the client mutation tracking document
                        const clientMutations = this.connection.model(
                            ClientMutation.name
                        );
                        const doc =
                            await clientMutations.findOneAndUpdate<ClientMutation>(
                                {
                                    clientGroupID: input.clientGroupID,
                                    clientID: input.clientID
                                },
                                {
                                    $set: {
                                        lastMutationID: input.mutationID,
                                        upstreamSchema: input.upstreamSchema,
                                        updatedAt: new Date()
                                    },
                                    $setOnInsert: {
                                        createdAt: new Date()
                                    }
                                },
                                {
                                    upsert: true,
                                    session
                                }
                            );

                        const lastMutationID = doc?.lastMutationID ?? 1;

                        this.logger.verbose(
                            `updateClientMutationID result: returning lastMutationID=${lastMutationID}`
                        );

                        return {
                            lastMutationID
                        };
                    },

                    writeMutationResult: async result => {
                        // Store mutation result for idempotency
                        const MutationResult =
                            this.connection.model('MutationResult');
                        await MutationResult.create(
                            [
                                {
                                    clientGroupID: input.clientGroupID,
                                    clientID: input.clientID,
                                    mutationID: input.mutationID,
                                    upstreamSchema: input.upstreamSchema,
                                    result,
                                    createdAt: new Date()
                                }
                            ],
                            { session }
                        );
                    }
                };

                return await callback(tx, hooks);
            });
        } finally {
            await session.endSession();
        }
    }
}
