import type {
    ChangeStreamDeleteDocument,
    ChangeStreamInsertDocument,
    ChangeStreamReplaceDocument,
    ChangeStreamUpdateDocument,
    ChangeStreamDropDocument
} from 'mongodb';

import type { v0 } from '@rocicorp/zero/change-protocol/v0';

export type IChangeMaker<TChangeData> = {
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
    makeInsertChanges(doc: Pick<ChangeStreamInsertDocument, 'fullDocument' | 'ns'>): TChangeData[];

    /**
     * Generates downstream changes for an `update` change stream event
     *
     * An `update` event occurs when an operation updates a document in a collection
     *
     * @param doc The change stream document
     * @see {@link https://www.mongodb.com/docs/manual/reference/change-events/update/#mongodb-data-update Update Change Stream Event}
     */
    makeUpdateChanges(doc: ChangeStreamUpdateDocument): TChangeData[];

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
    makeReplaceChanges(doc: ChangeStreamReplaceDocument): TChangeData[];

    /**
     * Generates downstream changes for a `delete` change stream event
     *
     * A `delete` event occurs when operations remove documents from a collection,
     * such as when a user or application executes the delete command.
     *
     * @param doc The change stream document
     * @see {@link https://www.mongodb.com/docs/manual/reference/change-events/delete/#mongodb-data-delete Delete Change Stream Event}
     */
    makeDeleteChanges(doc: ChangeStreamDeleteDocument): TChangeData[];

    //#endregion CRUD

    //#region DDL

    /**
     * Generates a change stream message to create an index on the `_id` column for a given collection.
     *
     * @param collectionNames - The names of the collections for which `_id` column indexes should be created.
     * @returns An array of change stream messages to create the index.
     */
    makeIdColumnIndexChanges(...collectionNames: string[]): v0.ChangeStreamMessage[];

    /**
     * Generates downstream changes for a mongo `drop` change stream event
     *
     * A `drop` event occurs when a collection is dropped from a database
     *
     * @param doc The change stream document
     * @see {@link https://www.mongodb.com/docs/manual/reference/change-events/drop/#mongodb-data-drop}
     */
    makeCollectionDropChanges(doc: ChangeStreamDropDocument): TChangeData[];

    //#endregion DDL

    //#region Transactions

    /**
     * Generates a downstream changes list containing a single `begin` event
     * with the specified `commitWatermark`, or a default value, if
     * one is not specified.
     *
     * @param commitWatermark (Optional) The commit watermark to use for the
     * `begin` event. If omitted, a default value is used.
     */
    makeBeginChanges(commitWatermark?: string): TChangeData[];

    /**
     * Generates a downstream changes list containing a single `commit` event
     * with the specified `commitWatermark`, or a default value, if
     * one is not specified.
     *
     * @param commitWatermark (Optional) The commit watermark to use for the
     * `begin` event. If omitted, a default value is used.
     */
    makeCommitChanges(commitWatermark?: string): TChangeData[];

    /**
     * Generates a downstream changes list containing a single `rollback` event
     * with the specified `commitWatermark`, or a default value, if
     * one is not specified.
     *
     * @param commitWatermark (Optional) The commit watermark to use for the
     * `begin` event. If omitted, a default value is used.
     */
    makeRollbackChanges(commitWatermark?: string): TChangeData[];

    //#endregion Transactions
};

/**
 * The "current" and "previous" change source protocol implementations the
 * gateway supports. From the Custom Backends design doc:
 *
 * > *For a seamless migration, the endpoint must support either version during
 * > the transition from the zero-cache that speaks v1 to the zero-cache that
 * > speaks v2.*
 *
 * @see {@link https://www.notion.so/replicache/Custom-Backends-1753bed8954580959aace8d68ef7a9fb#1753bed89545807189b8dae69bb18feb The Custom Backends design doc}
 */
export type ChangeMaker = IChangeMaker<v0.ChangeStreamMessage>;
