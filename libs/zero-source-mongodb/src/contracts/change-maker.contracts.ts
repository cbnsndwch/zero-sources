import type {
    ChangeStreamDeleteDocument,
    ChangeStreamInsertDocument,
    ChangeStreamReplaceDocument,
    ChangeStreamUpdateDocument,
    ChangeStreamDropDocument
} from 'mongodb';

import type { v0 } from '@rocicorp/zero/change-protocol/v0';

export type TableSpec = v0.TableCreate['spec'];

export type IChangeMaker<TChangeData> = {
    //#region CRUD

    /**
     * Generates downstream changes for mongo `insert` change stream event
     *
     * An `insert` event occurs when an operation adds documents to a collection.
     *
     * @param watermark The zero watermark for the change stream event
     * @param doc The change stream document
     * @param withTransaction (Optional) Whether to wrap the event is a transaction. Defaults to `false`.
     * @see {@link https://www.mongodb.com/docs/manual/reference/change-events/insert/#mongodb-data-insert Insert Change Stream Event }
     */
    makeInsertChanges(
        watermark: string,
        doc: Pick<ChangeStreamInsertDocument, '_id' | 'fullDocument' | 'ns'>,
        withTransaction?: boolean
    ): TChangeData[];

    /**
     * Generates downstream changes for an `update` change stream event
     *
     * An `update` event occurs when an operation updates a document in a collection
     *
     * @param watermark The zero watermark for the change stream event
     * @param doc The change stream document* @param withTransaction (Optional) Whether to wrap the event is a transaction. Defaults to `false`.
     * @param withTransaction (Optional) Whether to wrap the event is a transaction. Defaults to `false`.
     * @see {@link https://www.mongodb.com/docs/manual/reference/change-events/update/#mongodb-data-update Update Change Stream Event}
     */
    makeUpdateChanges(
        watermark: string,
        doc: ChangeStreamUpdateDocument,
        withTransaction?: boolean
    ): TChangeData[];

    /**
     * Generates downstream changes for a `replace` change stream event
     *
     * A `replace` event occurs when an update operation removes a document from a
     * collection and replaces it with a new document, such as when the
     * `replaceOne` method is called.
     *
     * @param watermark The zero watermark for the change stream event
     * @param doc The change stream document
     * @param withTransaction (Optional) Whether to wrap the event is a transaction. Defaults to `false`.
     * @see {@link https://www.mongodb.com/docs/manual/reference/change-events/replace/#mongodb-data-replace Replace Change Stream Event}
     */
    makeReplaceChanges(
        watermark: string,
        doc: ChangeStreamReplaceDocument,
        withTransaction?: boolean
    ): TChangeData[];

    /**
     * Generates downstream changes for a `delete` change stream event
     *
     * A `delete` event occurs when operations remove documents from a collection,
     * such as when a user or application executes the delete command.
     *
     * @param watermark The zero watermark for the change stream event
     * @param doc The change stream document
     * @param withTransaction (Optional) Whether to wrap the event is a transaction. Defaults to `false`.
     * @see {@link https://www.mongodb.com/docs/manual/reference/change-events/delete/#mongodb-data-delete Delete Change Stream Event}
     */
    makeDeleteChanges(
        watermark: string,
        doc: ChangeStreamDeleteDocument,
        withTransaction?: boolean
    ): TChangeData[];

    //#endregion CRUD

    //#region DDL

    /**
     * Generates downstream changes for a mongo `drop` change stream event
     *
     * A `drop` event occurs when a collection is dropped from a database
     *
     * @param watermark The zero watermark for the change stream event
     * @param doc The change stream document
     * @see {@link https://www.mongodb.com/docs/manual/reference/change-events/drop/#mongodb-data-drop}
     */
    makeDropCollectionChanges(
        watermark: string,
        doc: ChangeStreamDropDocument
    ): TChangeData[];

    /**
     * Generates a series of change stream messages to create a table and its primary key index.
     *
     * @param spec - The specification of the table to be created, including its primary key.
     * @returns An array of change stream messages to create the table and its primary key index.
     * @throws Will throw an error if the table does not have a primary key.
     */
    makeCreateTableChanges(table: TableSpec): TChangeData[];

    //#endregion DDL

    //#region Zero Pg Compat

    /**
     * Generates table events for the `{appId}_{shardId}.clients` table and the
     * `zero.schemaVersions` table to address Zero custom sources still having
     * some logic that is very coupled to upstreams being postgres DBs.
     *
     * HACK: this is a temporary solution that MAY go away if zero custom change
     * sources become truly upstream-agnostic.
     *
     * @param appId - The application ID to use for table name prefixes.
     * @param shardId - The identifier of the shard for which the table changes are to be made.
     * @returns An array of `v0.ChangeStreamMessage` objects representing the table changes.
     */
    makeZeroRequiredUpstreamTablesChanges(appId: string, shardId: string): TChangeData[];

    //#endregion Zero Pg Compat

    //#region Transactions

    /**
     * Generates a downstream changes list containing a single `begin` event
     * with the specified `watermark`.
     *
     * @param watermark The commit watermark to use for the event.
     */
    makeBeginChanges(watermark?: string): TChangeData[];

    /**
     * Generates a downstream changes list containing a single `commit` event
     * with the specified `watermark`.
     *
     * @param watermark The commit watermark to use for the event
     */
    makeCommitChanges(watermark: string): TChangeData[];

    /**
     * Generates a downstream changes list containing a single `rollback` event.
     */
    makeRollbackChanges(): TChangeData[];

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
