import { Logger } from '@nestjs/common';
import {
    Collection,
    ClientSession,
    Document,
    ObjectId,
    type Connection
} from 'mongoose';
import type { OptionalUnlessRequiredId, MatchKeysAndValues } from 'mongodb';

// Removed incorrect import for error types
// import {
//     MutationAlreadyProcessedError,
//     OutOfOrderMutation
// } from '@rocicorp/zero/advanced';

import { invariant } from '@cbnsndwch/zero-contracts';
import { MutationAlreadyProcessedError, OutOfOrderMutation } from './utils.js'; // Import local error types

const COLLECTION_ZERO_CLIENTS =
    process.env.ZERO_MONGO_CLIENTS_COLLECTION || '__zero_clients';

interface ChangeRecord {
    op: 'insert' | 'update' | 'delete';
    collection: string;
    docs?: any[];
    ids?: any[];
}

export class MongoTransaction {
    #logger = new Logger(MongoTransaction.name);

    #conn: Connection;
    #session!: ClientSession;
    #changes: ChangeRecord[] = [];

    constructor(conn: Connection) {
        this.#conn = conn;
    }

    /**
     * Opens a Mongo session, starts a multi-document transaction.
     */
    async beginTransaction(): Promise<void> {
        // Start session and transaction.
        this.#session = await this.#conn.startSession();
        this.#session.startTransaction({
            readConcern: { level: 'snapshot' },
            writeConcern: { w: 'majority' }
        });
    }

    /**
     * Insert documents into the specified collection.
     * Each write operation includes the session option so it
     * runs under this transaction.
     */
    async insert<T extends Document>(
        collection: string,
        docs: OptionalUnlessRequiredId<T>[]
    ): Promise<void> {
        invariant(
            Boolean(this.#session),
            'MongoTransaction::insert called without an active client session. Did you call beginTransaction()?'
        );

        const coll: Collection<T> = this.#conn.collection(collection);

        await coll.insertMany(docs, { session: this.#session });

        this.#changes.push({ op: 'insert', collection, docs });
    }

    /**
     * Update documents in the specified collection. This example
     * assumes docs have an _id field for matching. Adjust to match your logic.
     */
    async update<T extends Document>(
        collection: string,
        docs: Partial<T>[]
    ): Promise<void> {
        invariant(
            Boolean(this.#session),
            'MongoTransaction::update called without an active client session. Did you call beginTransaction()?'
        );

        const coll: Collection<T> = this.#conn.collection(collection);

        for (const doc of docs) {
            const { _id, ...rest } = doc;
            if (!_id) {
                throw new Error('Missing _id in doc passed to update()');
            }

            // partial update
            await coll.updateOne(
                { _id },
                { $set: rest as MatchKeysAndValues<T> },
                { session: this.#session }
            );
        }
        this.#changes.push({ op: 'update', collection, docs });
    }

    /**
     * Delete documents from the specified collection by _id.
     */
    async delete(
        collection: string,
        ids: Array<string | ObjectId>
    ): Promise<void> {
        invariant(
            Boolean(this.#session),
            'MongoTransaction::delete called without an active client session. Did you call beginTransaction()?'
        );

        const coll: Collection<any> = this.#conn.collection(collection);

        await coll.deleteMany(
            { _id: { $in: ids } },
            { session: this.#session }
        );

        this.#changes.push({ op: 'delete', collection, ids });
    }

    /**
     * Returns the active client session for this transaction.
     */
    getSession(): ClientSession {
        invariant(
            Boolean(this.#session),
            'MongoTransaction::getSession called without an active client session. Did you call beginTransaction()?'
        );
        return this.#session;
    }

    async checkAndIncrementLastMutationId(
        clientGroupId: string,
        clientId: string,
        receivedMutationId: number
    ) {
        invariant(
            Boolean(this.#session),
            'MongoTransaction::checkAndIncrementLastMutationId called without an active client session. Did you call beginTransaction()?'
        );

        this.#logger.debug?.(
            `Incrementing LMID. Received: ${receivedMutationId}`
        );

        const coll: Collection = this.#conn.collection(COLLECTION_ZERO_CLIENTS);

        const result = await coll.findOneAndUpdate(
            { clientGroupId, clientId }, // query
            {
                $inc: { lastMutationID: 1 }, // increment lastMutationID by 1
                $setOnInsert: { clientGroupId, clientId } // if inserting, set IDs
            },
            {
                upsert: true,
                returnDocument: 'after', // Return the document *after* the update
                projection: { lastMutationId: 1, _id: 0 } // Only return lastMutationID
            }
        );

        const lastMutationId = result?.value?.lastMutationId;

        if (receivedMutationId < lastMutationId) {
            throw new MutationAlreadyProcessedError(
                clientId,
                receivedMutationId,
                lastMutationId
            );
        } else if (receivedMutationId > lastMutationId) {
            throw new OutOfOrderMutation(
                clientId,
                receivedMutationId,
                lastMutationId
            );
        }
        this.#logger.debug?.(
            `Incremented LMID. Received: ${receivedMutationId}. New: ${lastMutationId}`
        );
    }

    /**
     * Commit the transaction. Zero will typically call this at the end
     * of the request cycle, or you might call it in an upper layer once
     * all mutators have completed.
     */
    async commit(): Promise<void> {
        invariant(
            Boolean(this.#session),
            'MongoTransaction::commit called without an active client session. Did you call beginTransaction()?'
        );

        await this.#session.commitTransaction();
        await this.#session.endSession();
    }

    /**
     * Abort the transaction, e.g. if an error occurs.
     */
    async rollback(): Promise<void> {
        if (!this.#session) {
            // nothing to do if we don't have an active session
            this.#logger.warn?.(
                'MongoTransaction::rollback called without an active session'
            );
            return;
        }

        await this.#session.abortTransaction();
        await this.#session.endSession();
    }

    /**
     * Return all the changes we performed so the IVM engine can see them.
     */
    getChanges(): ChangeRecord[] {
        return this.#changes;
    }
}
