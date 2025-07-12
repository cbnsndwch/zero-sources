import { Logger } from '@nestjs/common';
import type { 
    ChangeStreamDocument, 
    Document, 
    ChangeStream,
    ChangeStreamInsertDocument,
    ChangeStreamUpdateDocument,
    ChangeStreamDeleteDocument,
    ChangeStreamReplaceDocument
} from 'mongodb';
import type { ClientSession, Connection } from 'mongoose';
import { concatWith, from, ignoreElements, map, Observable, of, Subscription } from 'rxjs';

import { invariant } from '@cbnsndwch/zero-nest-mongoose';
import type { v0 } from '@rocicorp/zero/change-protocol/v0';

import { IWatermarkService } from '../../watermark/contracts.js';
import type { DbConfig } from '../../../config/contracts.js';

import type { ChangeMaker } from '../contracts/change-maker.contracts.js';
import type { WithWatermark } from '../contracts/protocol.contracts.js';
import { extractResumeToken } from '../utils/extract-resume-token.js';
import { StreamerShard } from '../entities/streamer-shard.entity.js';
import { versionToLexi } from '../utils/lexi-version.js';
import { TableMappingService, type TableMappingConfig } from './table-mapping.service.js';

type ChangeStreamControllerError = {
    err: unknown;
    lastLogTime: number;
    resumeToken?: string;
    doc?: ChangeStreamDocument;
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

    #shard: StreamerShard;
    #watermarkService: IWatermarkService;

    #conn: Connection;
    #changeMaker: ChangeMaker;
    #pipeline: any[];

    #changeStream?: ChangeStream<Document>;

    #publishedCollections: string[];
    #tableMappingService: TableMappingService;
    #tableMappingConfig: TableMappingConfig;

    #error?: ChangeStreamControllerError;

    constructor(
        shard: StreamerShard,
        conn: Connection,
        changeMaker: ChangeMaker,
        watermarkService: IWatermarkService,
        tableMappingService: TableMappingService,
        dbConfig: DbConfig
    ) {
        this.#shard = shard;
        this.#watermarkService = watermarkService;
        this.#changeMaker = changeMaker;
        this.#tableMappingService = tableMappingService;
        this.#conn = conn;

        // Support both new table mapping and legacy publish array
        if (dbConfig.tables && Object.keys(dbConfig.tables).length > 0) {
            this.#tableMappingConfig = { tables: dbConfig.tables };
            this.#publishedCollections = this.#tableMappingService.getSourceCollections(this.#tableMappingConfig);
            this.#pipeline = this.#tableMappingService.createChangeStreamPipeline(this.#tableMappingConfig);
        } else if (dbConfig.publish && dbConfig.publish.length > 0) {
            // Backward compatibility: convert legacy config to new format
            this.#publishedCollections = dbConfig.publish;
            this.#tableMappingConfig = {
                tables: Object.fromEntries(
                    dbConfig.publish.map(collection => [
                        collection, // Use collection name as table name
                        { source: collection } // No filter or projection
                    ])
                )
            };
            this.#pipeline = [
                {
                    $match: {
                        'ns.coll': { $in: this.#publishedCollections }
                    }
                }
            ];
        } else {
            throw new Error('Either db.tables or db.publish must be configured');
        }
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
        abortSignal?: AbortSignal,
        lastWatermark?: string
    ): Observable<v0.ChangeStreamMessage> {
        return this.streamChangesWithWatermark$(abortSignal, lastWatermark).pipe(map(x => x.data));
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
        const changeStream$ = new Observable<WithWatermark<v0.ChangeStreamMessage>>(observer => {
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

                    const watermark = await this.#watermarkService.getOrCreateWatermark(
                        this.#shard.id,
                        resumeToken
                    );

                    for (const data of this.#makeChanges(watermark, doc)) {
                        observer.next({ data, watermark });
                    }
                })
                // complete the observable when the change stream is closed
                .on('close', observer.complete)
                // propagate errors from the change stream to the subscriber
                .on('error', observer.error);
        });

        // if we got an abort signal, close the change stream when it's aborted
        if (abortSignal) {
            abortSignal.addEventListener('abort', async () => {
                try {
                    await this.#changeStream?.close();
                } catch (err) {
                    this.#logger.error('Error closing change stream on abort', err);
                }
            });
        }

        // if there's an active change stream, clean it up first
        let cleanup: Observable<void> = of(undefined);
        if (this.#changeStream && !this.#changeStream.closed) {
            cleanup = from(this.#changeStream.close());
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
        const createTableMessages: v0.ChangeStreamMessage[] = [
            // HACK: the custom change source implementation still expects these
            // tables to exist in the upstream DB
            ...this.#changeMaker.makeZeroRequiredUpstreamTablesChanges(this.#shard._id),

            // Create tables dynamically based on configuration
            ...this.#createDynamicTableSchemas()
        ];

        // first, signal the beginning of the snapshot sync
        const tables = from(createTableMessages);

        // then, tell the client to create tables in the replica DB
        const begin = from(this.#changeMaker.makeBeginChanges(WATERMARK_INITIAL_SYNC));

        // next, stream all the documents already in the database
        const records = from(this.#streamCurrentRecords$());

        // and last, signal that the snapshot is complete
        const commit = from(this.#changeMaker.makeCommitChanges(WATERMARK_INITIAL_SYNC));

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
    syncThenStream$(abortSignal?: AbortSignal): Observable<v0.ChangeStreamMessage> {
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
                    const newReplicationSub = this.streamChanges$(
                        abortSignal,
                        lastBufferedWatermark
                    ).subscribe({
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
                    // Route each document to appropriate Zero tables based on mappings
                    const tableMatches = this.#tableMappingService.getTableMatches(
                        collName,
                        doc,
                        this.#tableMappingConfig
                    );

                    for (const match of tableMatches) {
                        const changes = this.#changeMaker.makeInsertChanges(WATERMARK_INITIAL_SYNC, {
                            _id: WATERMARK_INITIAL_SYNC,
                            fullDocument: match.document,
                            ns: {
                                db: col.dbName,
                                coll: match.tableName // Use Zero table name instead of collection name
                            }
                        });

                        for (const change of changes) {
                            yield change;
                        }
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

    #makeChanges(watermark: string, doc: ChangeStreamDocument): v0.ChangeStreamMessage[] {
        // do not process changes if errored
        if (this.#error) {
            this.#logger.error(this.#error);
            return [];
        }

        try {
            const allChanges: v0.ChangeStreamMessage[] = [];

            switch (doc.operationType) {
                //#region CRUD

                case 'insert':
                    allChanges.push(...this.#makeInsertChanges(watermark, doc, true));
                    break;

                case 'update':
                    allChanges.push(...this.#makeUpdateChanges(watermark, doc, true));
                    break;

                case 'delete':
                    allChanges.push(...this.#makeDeleteChanges(watermark, doc, true));
                    break;

                case 'replace':
                    allChanges.push(...this.#makeReplaceChanges(watermark, doc, true));
                    break;

                //#endregion CRUD

                //#region Basic DDL -> Implement

                case 'drop':
                    return this.#changeMaker.makeDropCollectionChanges(watermark, doc);

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

            return allChanges;
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

    //#region Helpers - Table Mapping Change Generation

    /**
     * Creates insert changes for multiple Zero tables based on table mappings
     */
    #makeInsertChanges(watermark: string, doc: ChangeStreamInsertDocument, withTransaction = false): v0.ChangeStreamMessage[] {
        if (!doc.fullDocument) {
            this.#logger.warn('Insert change event missing fullDocument', { doc });
            return [];
        }

        const collectionName = doc.ns.coll;
        const tableMatches = this.#tableMappingService.getTableMatches(
            collectionName,
            doc.fullDocument,
            this.#tableMappingConfig
        );

        const allChanges: v0.ChangeStreamMessage[] = [];

        for (const match of tableMatches) {
            const changes = this.#changeMaker.makeInsertChanges(
                watermark,
                {
                    _id: doc._id,
                    fullDocument: match.document,
                    ns: {
                        db: doc.ns.db,
                        coll: match.tableName // Use Zero table name instead of collection name
                    }
                },
                withTransaction
            );
            allChanges.push(...changes);
        }

        return allChanges;
    }

    /**
     * Creates update changes for multiple Zero tables based on table mappings
     */
    #makeUpdateChanges(watermark: string, doc: ChangeStreamUpdateDocument, withTransaction = false): v0.ChangeStreamMessage[] {
        if (!doc.fullDocument) {
            this.#logger.warn('Update change event missing fullDocument', { doc });
            return [];
        }

        const collectionName = doc.ns.coll;
        const tableMatches = this.#tableMappingService.getTableMatches(
            collectionName,
            doc.fullDocument,
            this.#tableMappingConfig
        );

        const allChanges: v0.ChangeStreamMessage[] = [];

        for (const match of tableMatches) {
            // Create a change event with the projected document for this table
            const tableChangeDoc: ChangeStreamUpdateDocument = {
                ...doc,
                fullDocument: match.document,
                ns: {
                    db: doc.ns.db,
                    coll: match.tableName // Use Zero table name instead of collection name
                }
            };

            const changes = this.#changeMaker.makeUpdateChanges(
                watermark,
                tableChangeDoc,
                withTransaction
            );
            allChanges.push(...changes);
        }

        return allChanges;
    }

    /**
     * Creates delete changes for multiple Zero tables based on table mappings
     */
    #makeDeleteChanges(watermark: string, doc: ChangeStreamDeleteDocument, withTransaction = false): v0.ChangeStreamMessage[] {
        const collectionName = doc.ns.coll;
        
        // For deletes, we need to generate delete events for all tables that could have contained this document
        // Since we don't have the full document, we need to send delete to all tables from this collection
        const affectedTables = Object.entries(this.#tableMappingConfig.tables)
            .filter(([, mapping]) => mapping.source === collectionName)
            .map(([tableName]) => tableName);

        const allChanges: v0.ChangeStreamMessage[] = [];

        for (const tableName of affectedTables) {
            // Create a change event for this table
            const tableChangeDoc: ChangeStreamDeleteDocument = {
                ...doc,
                ns: {
                    db: doc.ns.db,
                    coll: tableName // Use Zero table name instead of collection name
                }
            };

            const changes = this.#changeMaker.makeDeleteChanges(
                watermark,
                tableChangeDoc,
                withTransaction
            );
            allChanges.push(...changes);
        }

        return allChanges;
    }

    /**
     * Creates replace changes for multiple Zero tables based on table mappings
     */
    #makeReplaceChanges(watermark: string, doc: ChangeStreamReplaceDocument, withTransaction = false): v0.ChangeStreamMessage[] {
        if (!doc.fullDocument) {
            this.#logger.warn('Replace change event missing fullDocument', { doc });
            return [];
        }

        const collectionName = doc.ns.coll;
        const tableMatches = this.#tableMappingService.getTableMatches(
            collectionName,
            doc.fullDocument,
            this.#tableMappingConfig
        );

        const allChanges: v0.ChangeStreamMessage[] = [];

        for (const match of tableMatches) {
            // Create a change event with the projected document for this table
            const tableChangeDoc: ChangeStreamReplaceDocument = {
                ...doc,
                fullDocument: match.document,
                ns: {
                    db: doc.ns.db,
                    coll: match.tableName // Use Zero table name instead of collection name
                }
            };

            const changes = this.#changeMaker.makeReplaceChanges(
                watermark,
                tableChangeDoc,
                withTransaction
            );
            allChanges.push(...changes);
        }

        return allChanges;
    }

    //#endregion Helpers - Table Mapping Change Generation

    //#region Helpers - Dynamic Schema Generation

    /**
     * Creates table schema definitions for all configured Zero tables.
     * Since MongoDB is schemaless, we create a flexible schema that can accommodate
     * most document structures.
     */
    #createDynamicTableSchemas(): v0.ChangeStreamMessage[] {
        const createTableMessages: v0.ChangeStreamMessage[] = [];

        for (const tableName of Object.keys(this.#tableMappingConfig.tables)) {
            // Create a basic table schema that can accommodate most MongoDB documents
            // For production use, you might want to analyze sample documents to infer better schemas
            const tableSchema = {
                schema: 'public',
                name: tableName,
                primaryKey: ['_id'],
                columns: {
                    _id: {
                        pos: 1,
                        dataType: 'varchar', // MongoDB ObjectIds are strings
                        notNull: true
                    }
                    // Note: Additional columns will be dynamically handled by Zero's schema evolution
                    // MongoDB documents can have varying structures, so we let Zero handle
                    // the dynamic addition of columns as it encounters new fields
                }
            };

            createTableMessages.push(...this.#changeMaker.makeCreateTableChanges(tableSchema));
        }

        return createTableMessages;
    }

    //#endregion Helpers - Dynamic Schema Generation
}
