import EventEmitter from 'node:events';

import { Logger, Type } from '@nestjs/common';
import type {
    ChangeStreamDocument,
    ChangeStreamDeleteDocument,
    ChangeStreamInsertDocument,
    ChangeStreamReplaceDocument,
    ChangeStreamUpdateDocument,
    Document,
    ChangeStream,
    ChangeStreamDropDocument
} from 'mongodb';
import type { Connection } from 'mongoose';
// import { from, Observable, ReplaySubject } from 'rxjs';

import type {
    ChangeStreamData,
    ChangeStreamMessage,
    Begin,
    Data,
    Commit,
    ChangeStreamControl
} from '@cbnsndwch/zero';
import { invariant } from '@cbnsndwch/zero-nest-mongoose';

import { TypedEmitter } from '../../../utils';

import type { StreamerShard } from '../entities';
import { relationFromChangeStreamEvent, extractResumeToken } from '../utils';

type ChangeStreamControllerError = {
    err: unknown;
    lastLogTime: number;
    resumeToken?: string;
    doc?: ChangeStreamDocument;
};

type Events = {
    change: (event: ChangeStreamMessage) => void;
    close: () => void;
};

const CHANGE_STREAM_TIMEOUT_MAX = 2_147_483_647

export class ChangeStreamSource extends (EventEmitter as Type<TypedEmitter<Events>>) {
    #logger = new Logger(ChangeStreamSource.name);

    #conn: Connection;
    #shard: StreamerShard;
    #pipeline: any[];

    #stream?: ChangeStream;

    /**
     * If the change stream should be restarted on closure, the resumeToken to use.
     *
     * This is used to resume the change stream after e.g. receiving an
     * `invalidate` event from the change stream cursor.
     */
    #restartAfter?: string;

    #error?: ChangeStreamControllerError;

    constructor(conn: Connection, shard: StreamerShard, publishedCollections: string[]) {
        super();

        this.#conn = conn;
        this.#shard = shard;
        this.#pipeline = [
            {
                $match: {
                    'ns.coll': { $in: publishedCollections }
                }
            }
        ];
    }

    //#region Public API

    startStream() {
        if (this.#stream && !this.#stream.closed) {
            // already streaming
            return;
        }

        // const sub = new ReplaySubject<ChangeStreamMessage>(MAX_RETAINED_SAMPLES, RETENTION_TIMEOUT);

        const onError = (err: Error) => {
            let _err: Error;
            if (err instanceof Error) {
                _err = err;
            } else {
                _err = new Error(String(err));
            }

            this.#logger.error(_err);
            this.#error = {
                err: _err,
                resumeToken: this.#shard.lastPendingWatermark,
                lastLogTime: Date.now()
            };

            // if (sub.closed) {
            //     return;
            // }

            // sub.error(_err);
            // sub.complete();
        };

        const onClose = () => {
            // if (sub.closed) {
            //     return;
            // }

            if (!this.#restartAfter) {
                this.emit('close');
                return;
            }

            setTimeout(() => {
                this.#restartAfter = undefined;
                this.startStream;
            }, 0);
        };

        this.#stream = this.#conn
            .watch<Document>(this.#pipeline, {
                resumeAfter: this.#restartAfter || this.#shard.lastAcknowledgedWatermark,
                fullDocument: 'updateLookup',
                fullDocumentBeforeChange: 'whenAvailable',
                timeoutMS: CHANGE_STREAM_TIMEOUT_MAX
            })
            .on('change', async event => {
                this.#shard.lastPendingWatermark = (event._id as any).toString();
                await this.#shard.save();

                // TODO: lock to ensure in-order processing
                for (const change of await this.#makeChanges(event)) {
                    this.emit('change', change);
                }
            })
            .on('error', onError)
            .on('close', onClose);
    }

    //#endregion Public API

    //#region Change Stream Event Handlers

    async #makeChanges(doc: ChangeStreamDocument): Promise<ChangeStreamMessage[]> {
        // do not process changes if errored
        if (this.#error) {
            this.#logger.error(this.#error);
            return [];
        }

        try {
            switch (doc.operationType) {
                //#region CRUD

                case 'insert':
                    return this.#makeInsertChanges(doc);

                case 'update':
                    return this.#makeUpdateChanges(doc);

                case 'delete':
                    return this.#makeDeleteChanges(doc);

                case 'replace':
                    return this.#makeReplaceChanges(doc);

                //#endregion CRUD

                //#region Basic DDL -> Implement

                case 'drop':
                    return this.#makeCollectionDropChanges(doc);

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

                    this.#restartAfter = extractResumeToken(doc._id);
                    this.#stream!.close();

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

            // Rollback the current transaction to avoid dangling transactions in
            // downstream processors (i.e. changeLog, replicator).
            return [
                // ['rollback', {tag: 'rollback'}],
                ['control', { tag: 'reset-required' }] satisfies ChangeStreamControl
            ];
        }
    }

    /**
     * Generates downstream changes for a mongo `drop` change stream event
     *
     * A `drop` event occurs when a collection is dropped from a database
     *
     * @param doc The change stream document
     * @see {@link https://www.mongodb.com/docs/manual/reference/change-events/drop/#mongodb-data-drop}
     */
    #makeCollectionDropChanges(doc: ChangeStreamDropDocument): ChangeStreamData[] {
        return [
            [
                'data',
                {
                    tag: 'drop-table',
                    id: {
                        schema: doc.ns.db,
                        name: doc.ns.coll
                    }
                }
            ] satisfies Data
        ];
    }

    /**
     * Generates downstream changes for mongo `insert` change stream event
     *
     * An `insert` event occurs when an operation adds documents to a collection.
     *
     * @param doc The change stream document
     * @see {@link https://www.mongodb.com/docs/manual/reference/change-events/insert/#mongodb-data-insert Insert Change Stream Event }
     *
     */
    #makeInsertChanges(doc: ChangeStreamInsertDocument): ChangeStreamData[] {
        return [
            [
                'data',
                {
                    tag: 'insert',
                    new: doc.fullDocument,
                    relation: relationFromChangeStreamEvent(doc)
                }
            ] satisfies Data
        ];
    }

    /**
     * Generates downstream changes for an `update` change stream event
     *
     * An `update` event occurs when an operation updates a document in a collection
     *
     * @param doc The change stream document
     * @see {@link https://www.mongodb.com/docs/manual/reference/change-events/update/#mongodb-data-update Update Change Stream Event}
     */
    #makeUpdateChanges(doc: ChangeStreamUpdateDocument): ChangeStreamData[] {
        // pre-image presence is required for this event type
        invariant(
            doc.fullDocumentBeforeChange !== undefined,
            'received a change stream update event without a pre-image'
        );

        return [
            [
                'data',
                {
                    tag: 'update',
                    key: doc.documentKey,
                    old: doc.fullDocumentBeforeChange,
                    new: doc.fullDocument!,
                    relation: relationFromChangeStreamEvent(doc)
                }
            ]
        ];
    }

    /**
     * Generates downstream changes for a `replace` change stream event
     *
     * A `replace` event occurs when an update operation removes a document from a
     * collection and replaces it with a new document, such as when the
     * `replaceOne` method is called.
     *
     * @param doc The change stream document
     * @see {@link https://www.mongodb.com/docs/manual/reference/change-events/replace/#mongodb-data-replace Replace Change Stream Event}
     */
    #makeReplaceChanges(doc: ChangeStreamReplaceDocument): ChangeStreamData[] {
        const relation = relationFromChangeStreamEvent(doc);

        const resumeToken = extractResumeToken(doc._id);
        invariant(
            resumeToken !== undefined,
            'received a change stream replace event without a resume token'
        );

        return [
            // in a transaction,
            ['begin', { tag: 'begin' }, { commitWatermark: resumeToken }] satisfies Begin,

            // first, delete the old document
            [
                'data',
                {
                    tag: 'delete',
                    key: doc.documentKey,
                    relation
                }
            ] satisfies Data,

            // then, insert the new document
            [
                'data',
                {
                    tag: 'insert',
                    new: doc.fullDocument!,
                    relation
                }
            ] satisfies Data,

            // finally, commit the transaction
            ['commit', { tag: 'commit' }, { watermark: resumeToken }] satisfies Commit
        ];
    }

    /**
     * Generates downstream changes for a `delete` change stream event
     *
     * A `delete` event occurs when operations remove documents from a collection,
     * such as when a user or application executes the delete command.
     *
     * @param doc The change stream document
     * @see {@link https://www.mongodb.com/docs/manual/reference/change-events/delete/#mongodb-data-delete Delete Change Stream Event}
     */
    #makeDeleteChanges(doc: ChangeStreamDeleteDocument): ChangeStreamData[] {
        invariant(Boolean(doc.documentKey), 'delete event without documentKey');

        return [
            [
                'data',
                {
                    tag: 'delete',
                    key: doc.documentKey,
                    relation: relationFromChangeStreamEvent(doc)
                }
            ] satisfies Data
        ];
    }

    //#endregion Change Stream Event Handlers
}
