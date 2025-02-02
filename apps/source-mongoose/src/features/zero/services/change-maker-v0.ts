import type {
    ChangeStreamDeleteDocument,
    ChangeStreamInsertDocument,
    ChangeStreamReplaceDocument,
    ChangeStreamUpdateDocument,
    ChangeStreamDropDocument
} from 'mongodb';

import { invariant } from '@cbnsndwch/zero-nest-mongoose';
import type { v0 } from '@rocicorp/zero/change-protocol/v0';

import type { IChangeMaker } from '../contracts/index.js';

import { relationFromChangeStreamEvent } from '../utils/zero-relation-from-change-stream-event.js';
import { extractResumeToken } from '../utils/extract-resume-token.js';

export class ChangeMakerV0 implements IChangeMaker<v0.ChangeStreamMessage> {
    //#region CRUD

    /**
     * Generates downstream changes for mongo `insert` change stream event
     *
     * An `insert` event occurs when an operation adds documents to a collection.
     *
     * @param doc The change stream document
     * @see {@link https://www.mongodb.com/docs/manual/reference/change-events/insert/#mongodb-data-insert Insert Change Stream Event }
     *
     */
    makeInsertChanges(
        doc: Pick<ChangeStreamInsertDocument, 'fullDocument' | 'ns'>
    ): v0.ChangeStreamMessage[] {
        return [
            [
                'data',
                {
                    tag: 'insert',
                    new: doc.fullDocument,
                    relation: relationFromChangeStreamEvent(doc.ns)
                }
            ] satisfies v0.Data
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
    makeUpdateChanges(doc: ChangeStreamUpdateDocument): v0.ChangeStreamMessage[] {
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
                    relation: relationFromChangeStreamEvent(doc.ns)
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
    makeReplaceChanges(doc: ChangeStreamReplaceDocument): v0.ChangeStreamMessage[] {
        const relation = relationFromChangeStreamEvent(doc.ns);

        const resumeToken = extractResumeToken(doc._id);
        invariant(
            resumeToken !== undefined,
            'received a change stream replace event without a resume token'
        );

        return [
            // in a transaction,
            ['begin', { tag: 'begin' }, { commitWatermark: resumeToken }] satisfies v0.Begin,

            // first, delete the old document
            [
                'data',
                {
                    tag: 'delete',
                    key: doc.documentKey,
                    relation
                }
            ] satisfies v0.Data,

            // then, insert the new document
            [
                'data',
                {
                    tag: 'insert',
                    new: doc.fullDocument!,
                    relation
                }
            ] satisfies v0.Data,

            // finally, commit the transaction
            ['commit', { tag: 'commit' }, { watermark: resumeToken }] satisfies v0.Commit
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
    makeDeleteChanges(doc: ChangeStreamDeleteDocument): v0.ChangeStreamMessage[] {
        invariant(Boolean(doc.documentKey), 'delete event without documentKey');

        return [
            [
                'data',
                {
                    tag: 'delete',
                    key: doc.documentKey,
                    relation: relationFromChangeStreamEvent(doc.ns)
                }
            ] satisfies v0.Data
        ];
    }

    //#endregion CRUD

    //#region DDL

    /**
     * Generates a change stream message to create an index on the `_id` column for a given collection.
     *
     * @param collectionName - The name of the collection for which the index should be created.
     * @returns An array of change stream messages to create the index.
     */
    makeIdColumnIndexChanges(...collectionNames: string[]): v0.ChangeStreamMessage[] {
        return collectionNames.map(collectionName => [
            'data',
            {
                tag: 'create-index',
                spec: {
                    name: `idx_${collectionName}___id`,
                    schema: 'public',
                    tableName: collectionName,
                    unique: true,
                    columns: {
                        _id: 'ASC'
                    }
                }
            } satisfies v0.IndexCreate
        ]);
    }

    /**
     * Generates downstream changes for a mongo `drop` change stream event
     *
     * A `drop` event occurs when a collection is dropped from a database
     *
     * @param doc The change stream document
     * @see {@link https://www.mongodb.com/docs/manual/reference/change-events/drop/#mongodb-data-drop}
     */
    makeCollectionDropChanges(doc: ChangeStreamDropDocument): v0.ChangeStreamMessage[] {
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
            ] satisfies v0.Data
        ];
    }

    //#endregion DDL

    //#region Transactions

    /**
     * Generates downstream changes for a `delete` change stream event
     *
     * A `delete` event occurs when operations remove documents from a collection,
     * such as when a user or application executes the delete command.
     *
     * @param doc The change stream document
     * @see {@link https://www.mongodb.com/docs/manual/reference/change-events/delete/#mongodb-data-delete Delete Change Stream Event}
     */
    makeBeginChanges(commitWatermark = '0'): v0.ChangeStreamMessage[] {
        return [
            [
                'begin',
                { tag: 'begin' },
                { commitWatermark }
                //
            ] satisfies v0.Begin
        ];
    }

    /**
     * Generates a downstream changes list containing a single `commit` event
     * with the specified `commitWatermark`, or a default value, if
     * one is not specified.
     *
     * @param watermark (Optional) The commit watermark to use for the
     * `begin` event. If omitted, a default value is used.
     */
    makeCommitChanges(watermark = '0'): v0.ChangeStreamMessage[] {
        return [
            [
                'commit',
                { tag: 'commit' },
                { watermark }
                //
            ] satisfies v0.Commit
        ];
    }

    /**
     * Generates a downstream changes list containing a single `rollback` event
     * with the specified `commitWatermark`, or a default value, if
     * one is not specified.
     */
    makeRollbackChanges(): v0.ChangeStreamMessage[] {
        return [['rollback', { tag: 'rollback' }]];
    }

    //#endregion Transactions
}
