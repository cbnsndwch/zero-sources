import { Logger } from '@nestjs/common';
import type { v0 } from '@rocicorp/zero/change-protocol/v0';
import type { ChangeStream, ChangeStreamDocument, Document } from 'mongodb';
import type { ClientSession, Connection } from 'mongoose';
import {
    concatWith,
    from,
    ignoreElements,
    map,
    Observable,
    of
} from 'rxjs';

import {
    invariant,
    versionToLexi,
    type IWatermarkService
} from '@cbnsndwch/zero-contracts';

import type {
    ChangeMaker,
    TableSpec,
    WithWatermark
} from '../contracts/index.js';
import { StreamerShard } from '../entities/streamer-shard.entity.js';
import { extractResumeToken } from '../utils/extract-resume-token.js';

type ChangeStreamControllerError = {
    err: unknown;
    lastLogTime: number;
    doc?: ChangeStreamDocument;
    resumeToken?: string | undefined;
};

/**
 * A special change source watermark value that represents the initial sync of
 * the upstream, rather than a MongoDB Change Streams resume token.
 */
export const WATERMARK_INITIAL_SYNC = versionToLexi(0);

/**
 * Change stream timeout in milliseconds.
 */
const CHANGE_STREAM_TIMEOUT_MAX = 2_147_483_647;

export class ChangeSourceV0 {
    #logger = new Logger(ChangeSourceV0.name);

    #appId: string;
    #shard: StreamerShard;
    #watermarkService: IWatermarkService;

    #conn: Connection;
    #pipeline: any[] = [];
    #changeStream?: ChangeStream<Document>;
    #changeMaker: ChangeMaker;
    #tableSpecs: TableSpec[];

    #error?: ChangeStreamControllerError;

    constructor(
        appId: string,
        shard: StreamerShard,
        conn: Connection,
        tableSpecs: TableSpec[],
        changeMaker: ChangeMaker,
        watermarkService: IWatermarkService
    ) {
        this.#appId = appId;
        this.#shard = shard;
        this.#conn = conn;
        this.#tableSpecs = tableSpecs;
        this.#changeMaker = changeMaker;
        this.#watermarkService = watermarkService;
    }

    //#region Public API

    /**
     * Streams changes from a MongoDB change stream as an observable.
     *
     * @param {AbortSignal} [abortSignal] - (Optional) A signal from an `AbortController` to stop the change stream
     * @param {string} [lastWatermark] - (Optional) The latest watermark value the client has committed
     * @remarks
     * - If there's an active change stream, it will be cleaned up before starting a new one.
     * - The change stream is observed and mapped to zero change events.
     * - The observable will complete when the change stream is closed.
     * - Errors from the change stream are propagated to the subscriber.
     * @returns {Observable<v0.ChangeStreamMessage>} An observable that emits change stream messages.
     */
    streamChanges$(
        publishedCollections: string[],
        abortSignal?: AbortSignal,
        lastWatermark?: string
    ): Observable<v0.ChangeStreamMessage> {
        this.#pipeline = [
            {
                $match: {
                    'ns.coll': { $in: publishedCollections }
                }
            }
        ];

        return this.streamChangesWithWatermark$(
            abortSignal,
            lastWatermark
        ).pipe(
            // tap(x => {
            //     this.#logger.debug(
            //         `Change stream event: watermark=${x.watermark} data=${JSON.stringify(x.data)}`
            //     );
            // }),
            map(x => x.data)
        );
    }

    /**
     * Streams changes from a MongoDB change stream as an observable.
     *
     * @param {string} [lastWatermark] - Optional token to resume the change stream after a specific point.
     * @returns {Observable<v0.ChangeStreamMessage>} An observable that emits change stream messages.
     *
     * @remarks
     * - If there's an active change stream, it will be cleaned up before starting a new one.
     * - The change stream is observed and mapped to zero change events.
     * - The observable will complete when the change stream is closed.
     * - Errors from the change stream are propagated to the subscriber.
     */
    streamChangesWithWatermark$(
        abortSignal?: AbortSignal,
        lastWatermark?: string
    ): Observable<WithWatermark<v0.ChangeStreamMessage>> {
        const startAfter =
            !lastWatermark || lastWatermark === WATERMARK_INITIAL_SYNC
                ? undefined
                : { _data: lastWatermark };

        // observe the change stream and map to zero change events
        const changeStream$ = new Observable<
            WithWatermark<v0.ChangeStreamMessage>
        >(observer => {
            // // Check if this is a replica set
            // const admin = this.#conn.db!.admin();
            // admin
            //     .serverStatus()
            //     .then(status => {
            //         this.#logger.debug(
            //             `MongoDB server info: ${JSON.stringify({
            //                 version: status.version,
            //                 repl: status.repl || 'No replica set info'
            //             })}`
            //         );
            //     })
            //     .catch(err => {
            //         this.#logger.error('Failed to get server status:', err);
            //     });

            this.#changeStream = this.#conn.watch<Document>(
                // only stream requested collections
                this.#pipeline,
                {
                    startAfter,
                    fullDocument: 'updateLookup',
                    fullDocumentBeforeChange: 'whenAvailable',
                    timeoutMS: CHANGE_STREAM_TIMEOUT_MAX
                }
            ) as any as ChangeStream<Document>;

            this.#changeStream
                // stream changes to the subscriber
                .on('change', async doc => {
                    const resumeToken = extractResumeToken(doc._id);
                    invariant(
                        !!resumeToken,
                        'received a change stream update event without a resume token'
                    );

                    const watermark =
                        await this.#watermarkService.getOrCreateWatermark(
                            this.#shard.id,
                            resumeToken
                        );

                    for (const data of this.#makeChanges(watermark, doc)) {
                        observer.next({ data, watermark });
                    }
                })
                // complete the observable when the change stream is closed
                .on('close', () => {
                    observer.complete();
                })
                // propagate errors from the change stream to the subscriber
                .on('error', err => {
                    this.#logger.error(err);
                    observer.error(err);
                });
        });

        const tryCloseChangeStream = async () =>
            await this.#changeStream?.close()?.catch(err => {
                this.#logger.error('Error closing change stream on abort', err);
            });

        // if we got an abort signal, attempt to close the change stream when it's aborted
        if (abortSignal) {
            abortSignal.addEventListener('abort', tryCloseChangeStream);
        }

        // if there's an active change stream, clean it up first
        let cleanup: Observable<void> = of(undefined);
        if (this.#changeStream && !this.#changeStream.closed) {
            cleanup = from(tryCloseChangeStream());
        }

        return cleanup.pipe(
            // wait for the cleanup to complete, if needed
            ignoreElements(),
            // then start streaming changes
            concatWith(changeStream$)
        );
    }

    /**
     * Creates an observable that streams the initial sync data.
     * It emits a BEGIN message, then a series of DATA messages for each document,
     * then a COMMIT message that includes the replicaVersion watermark.
     */
    initialSync$(): Observable<v0.ChangeStreamMessage> {
        // first, signal the beginning of the snapshot sync
        const begin = from(
            this.#changeMaker.makeBeginChanges(WATERMARK_INITIAL_SYNC)
        );

        // then, tell the client to create tables in the replica DB
        const tables = from([
            // HACK: the custom change source implementation still expect these
            // tables to exist in the upstream DB
            ...this.#changeMaker.makeZeroRequiredUpstreamTablesChanges(
                this.#appId,
                this.#shard._id
            ),

            // create tables in replica
            ...this.#tableSpecs.flatMap(spec =>
                this.#changeMaker.makeCreateTableChanges(spec)
            )
        ]);

        // next, stream all the documents already in the database
        const records = from(this.#streamCurrentRecords$());

        // and last, signal that the snapshot is complete
        const commit = from(
            this.#changeMaker.makeCommitChanges(WATERMARK_INITIAL_SYNC)
        );

        // TODO: handle errors
        const stream = begin.pipe(concatWith(tables, records, commit));

        return stream;
    }

    //#endregion Public API

    //#region Helpers - Initial Sync

    /**
     * Asynchronously streams the current records from the published collections.
     *
     * This generator function starts a client session with a snapshot read concern
     * and reads all documents from each published collection within the same session.
     * For each document, it generates insert change messages and yields them.
     *
     * @private
     * @generator
     * @yields {v0.ChangeStreamMessage} The change messages generated from the documents.
     * @throws Will throw an error if the transaction fails.
     */
    async *#streamCurrentRecords$(): AsyncIterable<v0.ChangeStreamMessage> {
        let session: ClientSession | undefined;

        try {
            // start a client session with snapshot read concern
            session = await this.#conn.startSession({ snapshot: true });

            // Get the actual MongoDB collection names to read from (not table names)
            // Cast to concrete implementation to access getAllWatchedCollections method
            const collectionNames = (this.#changeMaker as any).getAllWatchedCollections();
            for (const collName of collectionNames) {
                const col = this.#conn.collection(collName);

                // stream all docs within the snapshot
                const colDocs = col.find({}, { session });

                for await (const doc of colDocs) {
                    const changes = this.#changeMaker.makeInsertChanges(
                        WATERMARK_INITIAL_SYNC,
                        {
                            _id: WATERMARK_INITIAL_SYNC,
                            fullDocument: doc,
                            ns: {
                                db: col.dbName,
                                coll: col.name
                            }
                        }
                    );

                    for (const change of changes) {
                        yield change;
                    }
                }
            }
        } finally {
            // Always end the session to free resources.
            await session?.endSession();
        }
    }

    //#endregion Helpers - Initial Sync

    //#region Helpers - Change Stream Event Handlers

    #makeChanges(
        watermark: string,
        doc: ChangeStreamDocument
    ): v0.ChangeStreamMessage[] {
        // do not process changes if errored
        if (this.#error) {
            this.#logger.error(this.#error);
            return [];
        }

        try {
            switch (doc.operationType) {
                //#region CRUD

                case 'insert':
                    return this.#changeMaker.makeInsertChanges(
                        watermark,
                        doc,
                        true
                    );

                case 'update':
                    return this.#changeMaker.makeUpdateChanges(
                        watermark,
                        doc,
                        true
                    );

                case 'delete':
                    return this.#changeMaker.makeDeleteChanges(
                        watermark,
                        doc,
                        true
                    );

                case 'replace':
                    return this.#changeMaker.makeReplaceChanges(
                        watermark,
                        doc,
                        true
                    );

                //#endregion CRUD

                //#region Basic DDL -> Implement

                case 'drop':
                    return this.#changeMaker.makeDropCollectionChanges(
                        watermark,
                        doc
                    );

                case 'dropDatabase':
                    // Occurs when a database is dropped
                    //
                    // see: https://www.mongodb.com/docs/manual/reference/change-events/dropDatabase/#mongodb-data-dropDatabase
                    return [];

                case 'invalidate':
                    // Occurs when an operation renders the change stream invalid
                    //
                    // For example, a change stream opened on a collection that was later dropped or renamed would cause an invalidate event.
                    // TODO: list potential causes and document for which a replica reset is required
                    //
                    // see: https://www.mongodb.com/docs/manual/reference/change-events/invalidate/#mongodb-data-invalidate

                    this.#changeStream!.close();

                    return [];

                //#endregion Basic DDL -> Implement

                //#region Expanded DDL -> Consider Implementing

                case 'modify':
                    // Occurs when a collection is modified, such as when the collMod
                    // command adds or removes options from a collection or view
                    // Requires `showExpandedEvents=true` in the watch call
                    //
                    // from: 6.0
                    // see: https://www.mongodb.com/docs/manual/reference/change-events/modify/#mongodb-data-modify
                    return [];

                case 'create':
                    // Occurs on the creation of a collection.
                    // Requires `showExpandedEvents=true` in the watch call
                    //
                    // from: 6.0
                    // see: https://www.mongodb.com/docs/manual/reference/change-events/create/#mongodb-data-create
                    return [];

                case 'createIndexes':
                    // Occurs on the creation of indexes on the collection.
                    // Requires `showExpandedEvents=true` in the watch call
                    //
                    // from: 6.0
                    // see: https://www.mongodb.com/docs/manual/reference/change-events/createIndexes/#mongodb-data-createIndexes
                    return [];

                case 'dropIndexes':
                    // Occurs when an index is dropped from the collection
                    // Requires `showExpandedEvents=true` in the watch call
                    //
                    // from: 6.0
                    // see: https://www.mongodb.com/docs/manual/reference/change-events/dropIndexes/#mongodb-data-dropIndexes
                    return [];

                case 'refineCollectionShardKey':
                    // Occurs when a collection's shard key is modified
                    // Some details require `showExpandedEvents=true` in the watch call
                    //
                    // from: 6.1
                    // see: https://www.mongodb.com/docs/manual/reference/change-events/refineCollectionShardKey/#mongodb-data-refineCollectionShardKey
                    return [];

                case 'shardCollection':
                    // Occurs when a collection is sharded
                    // Requires `showExpandedEvents=true` in the watch call
                    //
                    // from: 6.0
                    // see: https://www.mongodb.com/docs/manual/reference/change-events/shardCollection/#mongodb-data-shardCollection
                    return [];

                case 'reshardCollection':
                    // Occurs when the shard key for a collection and the distribution of data changes
                    // Requires `showExpandedEvents=true` in the watch call
                    //
                    // from: 6.1
                    // see: https://www.mongodb.com/docs/manual/reference/change-events/reshardCollection/#mongodb-data-reshardCollection
                    return [];

                case 'rename':
                    // Occurs when a collection is renamed
                    //
                    // see: https://www.mongodb.com/docs/manual/reference/change-events/rename/#mongodb-data-rename
                    return [];

                //#endregion Expanded DDL -> Consider Implementing

                // exhaustive check
                default:
                    doc satisfies never;
                    throw new Error(
                        `Unexpected change stream event type: ${(doc as any).operationType}`
                    );
            }
        } catch (err) {
            this.#error = {
                doc,
                err,
                resumeToken: extractResumeToken(doc._id),
                lastLogTime: 0
            };
            this.#logger.error(this.#error);

            // abort the stream and signal to the client that a reset is required
            const resetMessage: v0.ChangeStreamMessage = [
                'control',
                { tag: 'reset-required' }
            ];

            return [resetMessage];
        }
    }

    //#endregion Helpers - Change Stream Event Handlers
}
