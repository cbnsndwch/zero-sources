import EventEmitter from 'node:events';

import { Logger, Type } from '@nestjs/common';
import type { ChangeStreamDocument, Document, ChangeStream } from 'mongodb';
import type { ClientSession, Connection } from 'mongoose';
import { concatWith, from, ignoreElements, map, Observable, of, Subscription } from 'rxjs';

import { invariant } from '@cbnsndwch/zero-nest-mongoose';
import type { v0 } from '@rocicorp/zero/change-protocol/v0';

import type { TypedEmitter } from '../../../utils/typed-emitter.js';

import type { ChangeMaker } from '../contracts/change-maker.contracts.js';
import type { WithWatermark } from '../contracts/protocol.contracts.js';
import { extractResumeToken } from '../utils/extract-resume-token.js';

type ChangeStreamControllerError = {
    err: unknown;
    lastLogTime: number;
    resumeToken?: string;
    doc?: ChangeStreamDocument;
};

type Events = {
    change: (event: v0.ChangeStreamMessage) => void;
    close: () => void;
};

const CHANGE_STREAM_TIMEOUT_MAX = 2_147_483_647;

export class ChangeSourceV0 extends (EventEmitter as Type<TypedEmitter<Events>>) {
    #logger = new Logger(ChangeSourceV0.name);

    #conn: Connection;
    #changeMaker: ChangeMaker;
    #pipeline: any[];

    #changeStream?: ChangeStream<Document>;

    #publishedCollections: string[];

    #error?: ChangeStreamControllerError;

    constructor(conn: Connection, changeMaker: ChangeMaker, publishedCollections: string[]) {
        super();

        this.#changeMaker = changeMaker;
        this.#publishedCollections = publishedCollections;
        this.#conn = conn;
        this.#pipeline = [
            {
                $match: {
                    'ns.coll': { $in: publishedCollections }
                }
            }
        ];
    }

    //#region Public API

    /**
     * Streams changes from a MongoDB change stream as an observable.
     *
     * @param {string} [resumeAfter] - Optional token to resume the change stream after a specific point.
     * @returns {Observable<v0.ChangeStreamMessage>} An observable that emits change stream messages.
     *
     * @remarks
     * - If there's an active change stream, it will be cleaned up before starting a new one.
     * - The change stream is observed and mapped to zero change events.
     * - The observable will complete when the change stream is closed.
     * - Errors from the change stream are propagated to the subscriber.
     */
    streamChanges$(resumeAfter?: string): Observable<v0.ChangeStreamMessage> {
        return this.streamChangesWithWatermark$(resumeAfter).pipe(map(x => x.data));
    }

    /**
     * Streams changes from a MongoDB change stream as an observable.
     *
     * @param {string} [resumeAfter] - Optional token to resume the change stream after a specific point.
     * @returns {Observable<v0.ChangeStreamMessage>} An observable that emits change stream messages.
     *
     * @remarks
     * - If there's an active change stream, it will be cleaned up before starting a new one.
     * - The change stream is observed and mapped to zero change events.
     * - The observable will complete when the change stream is closed.
     * - Errors from the change stream are propagated to the subscriber.
     */
    streamChangesWithWatermark$(
        resumeAfter?: string
    ): Observable<WithWatermark<v0.ChangeStreamMessage>> {
        // if there's an active change stream, clean it up
        const cleanup =
            this.#changeStream && !this.#changeStream.closed
                ? from(this.#changeStream.close())
                : of(undefined);

        // observe the change stream and map to zero change events
        const changeStream$ = new Observable<WithWatermark<v0.ChangeStreamMessage>>(observer => {
            this.#changeStream = this.#conn.watch<Document>(this.#pipeline, {
                resumeAfter,
                fullDocument: 'updateLookup',
                fullDocumentBeforeChange: 'whenAvailable',
                timeoutMS: CHANGE_STREAM_TIMEOUT_MAX
            }) as any as ChangeStream<Document>;

            this.#changeStream
                // stream changes to the subscriber
                .on('change', async doc => {
                    for (const change of this.#makeChanges(doc)) {
                        observer.next({ data: change, watermark: extractResumeToken(doc._id)! });
                    }
                })
                // complete the observable when the change stream is closed
                .on('close', observer.complete)
                // propagate errors from the change stream to the subscriber
                .on('error', observer.error);
        });

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
        const WATERMARK = '0_initial';

        // TODO: move schema generation to a separate method
        const createTableMessages: v0.ChangeStreamMessage[] = [
            [
                'data',
                {
                    tag: 'create-table',
                    spec: {
                        schema: 'public',
                        name: 'user',
                        primaryKey: ['_id'],
                        columns: {
                            _id: {
                                pos: 1,
                                dataType: 'character',
                                notNull: true
                            },
                            name: {
                                pos: 2,
                                dataType: 'varchar',
                                notNull: true
                            },
                            partner: {
                                pos: 3,
                                dataType: 'boolean',
                                notNull: true
                            }
                        }
                    }
                } satisfies v0.TableCreate
            ],
            [
                'data',
                {
                    tag: 'create-table',
                    spec: {
                        schema: 'public',
                        name: 'medium',
                        primaryKey: ['_id'],
                        columns: {
                            _id: {
                                pos: 1,
                                dataType: 'character',
                                notNull: true
                            },
                            name: {
                                pos: 2,
                                dataType: 'varchar',
                                notNull: true
                            }
                        }
                    }
                } satisfies v0.TableCreate
            ],
            [
                'data',
                {
                    tag: 'create-table',
                    spec: {
                        schema: 'public',
                        name: 'message',
                        primaryKey: ['_id'],
                        columns: {
                            _id: {
                                pos: 1,
                                dataType: 'character',
                                notNull: true
                            },
                            senderID: {
                                pos: 2,
                                dataType: 'character',
                                notNull: true
                            },
                            mediumID: {
                                pos: 3,
                                dataType: 'character',
                                notNull: true
                            },
                            body: {
                                pos: 4,
                                dataType: 'text',
                                notNull: true
                            },
                            timestamp: {
                                pos: 5,
                                dataType: 'integer',
                                notNull: true
                            }
                        }
                    }
                } satisfies v0.TableCreate
            ],
            ...this.#changeMaker.makeIdColumnIndexChanges('medium', 'user', 'message')
        ];

        // first, signal the beginning of the snapshot sync
        const tables = from(createTableMessages);

        // then, tell the client to create tables in the replica DB
        const begin = from(this.#changeMaker.makeBeginChanges(WATERMARK));

        // next, stream all the documents already in the database
        const records = from(this.#streamCurrentRecords$());

        // and last, signal that the snapshot is complete
        const commit = from(this.#changeMaker.makeCommitChanges(WATERMARK));

        // TODO: handle errors
        const stream = begin.pipe(concatWith(tables, records, commit));

        return stream;
    }

    /**
     * Creates a data stream that implements the following logic:
     *
     * 1. Start a replication change stream immediately and buffer all changes.
     * 2. Concurrently, start a snapshot load that emits each record in the snapshot.
     * 3. When the snapshot load completes:
     *    a. Unsubscribe from the initial replication stream so no more events are added to the buffer.
     *    b. Emit all buffered replication changes.
     *    c. Determine the last watermark (from the buffered changes, or from the snapshot if none).
     *    d. Start a new replication stream from that watermark so that subsequent changes are captured.
     * 4. Continue streaming changes from the new replication stream.
     *
     * When the client unsubscribes, all underlying subscriptions are cleaned up.
     */
    syncThenStream$(): Observable<v0.ChangeStreamMessage> {
        return new Observable<v0.ChangeStreamMessage>(observer => {
            // buffer for storing replication changes while the snapshot is loading.
            const bufferedChanges: v0.ChangeStreamMessage[] = [];

            // a Subscription container to hold and cleanup all inner subscriptions.
            const subscription = new Subscription();

            // Variable to keep track of the highest watermark seen in the snapshot.
            let lastBufferedWatermark: string | undefined;

            // 1. Start the replication stream from an initial watermark (e.g. 0).
            //    (In a real system you might have a “current” watermark available.)
            const replicationBufferSub = this.streamChangesWithWatermark$().subscribe({
                next: change => {
                    // buffer every change that arrives during snapshot load.
                    bufferedChanges.push(change.data);

                    // keep track of the latest watermark from the buffered changes.
                    lastBufferedWatermark = change.watermark;
                },
                error: err => observer.error(err),
                complete: () => {
                    invariant(false, 'did do not expect the change stream to complete');
                }
            });
            subscription.add(replicationBufferSub);

            // 2. Start the snapshot load.
            const snapshotSub = this.initialSync$().subscribe({
                next: record => {
                    // Emit each snapshot record immediately to the client.
                    observer.next(record);
                },
                error: err => observer.error(err),
                complete: () => {
                    // 3.a. When the snapshot is done, unsubscribe from the replication stream
                    // so that the buffer is now “frozen.”
                    replicationBufferSub.unsubscribe();
                    console.log('Snapshot load complete. Flushing buffered replication changes.');

                    // 3.b. Emit all buffered replication changes (each change’s record).
                    bufferedChanges.forEach(change => {
                        observer.next(change);
                    });

                    // 3.c. Start a new replication stream from the last buffered watermark.
                    const newReplicationSub = this.streamChanges$(lastBufferedWatermark).subscribe({
                        next: change => {
                            // Emit new changes as they come in.
                            observer.next(change);
                        },
                        error: err => observer.error(err)
                    });
                    subscription.add(newReplicationSub);
                }
            });
            subscription.add(snapshotSub);

            // 4. When the client unsubscribes, clean up all inner subscriptions.
            return () => {
                subscription.unsubscribe();
                console.log('Client unsubscribed, all resources cleaned up.');
            };
        });
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

            // session.startTransaction({ readConcern: { level: 'snapshot' } });

            // For each collection, read all documents using the same session.
            for (const collName of this.#publishedCollections) {
                const col = this.#conn.collection(collName);

                // stream all docs within the snapshot
                const colDocs = col.find({}, { session });

                for await (const doc of colDocs) {
                    const changes = this.#changeMaker.makeInsertChanges({
                        ns: { db: col.dbName, coll: col.name },
                        fullDocument: doc
                    });

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

    #makeChanges(doc: ChangeStreamDocument): v0.ChangeStreamMessage[] {
        // do not process changes if errored
        if (this.#error) {
            this.#logger.error(this.#error);
            return [];
        }

        try {
            switch (doc.operationType) {
                //#region CRUD

                case 'insert':
                    return this.#changeMaker.makeInsertChanges(doc);

                case 'update':
                    return this.#changeMaker.makeUpdateChanges(doc);

                case 'delete':
                    return this.#changeMaker.makeDeleteChanges(doc);

                case 'replace':
                    return this.#changeMaker.makeReplaceChanges(doc);

                //#endregion CRUD

                //#region Basic DDL -> Implement

                case 'drop':
                    return this.#changeMaker.makeCollectionDropChanges(doc);

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
            const resetMessage: v0.ChangeStreamMessage = ['control', { tag: 'reset-required' }];

            return [resetMessage];
        }
    }

    //#endregion Helpers - Change Stream Event Handlers
}
