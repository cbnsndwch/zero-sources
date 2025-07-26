import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import type { v0 } from '@rocicorp/zero/change-protocol/v0';
import type {
    ChangeStreamDeleteDocument,
    ChangeStreamInsertDocument,
    ChangeStreamReplaceDocument,
    ChangeStreamUpdateDocument,
    ChangeStreamDropDocument,
    ChangeStreamNameSpace
} from 'mongodb';

import { invariant } from '@cbnsndwch/zero-contracts';

import type { IChangeMaker } from '../contracts/index.js';
import {
    TOKEN_MODULE_OPTIONS,
    type ZeroMongoModuleOptions
} from '../contracts/zero-mongo-module-options.contract.js';
import { relationFromChangeStreamEvent } from '../utils/zero-relation-from-change-stream-event.js';
import { matchesFilter, applyProjection } from '../utils/table-mapping.js';
import { TableMappingService, type MappedTableMapping } from './table-mapping.service.js';

type TableSpec = v0.TableCreate['spec'];

@Injectable()
export class ChangeMakerV0 implements IChangeMaker<v0.ChangeStreamMessage> {
    constructor(
        @Inject(TOKEN_MODULE_OPTIONS)
        private readonly options: ZeroMongoModuleOptions,
        private readonly tableMappingService: TableMappingService
    ) {
        // Initialize the table mapping service with table specs from options
        if (this.options.tables) {
            this.tableMappingService.initialize(this.options.tables);
        }
    }

    /**
     * Generates a SHA-256 hash of the input string
     */
    private generateHash(input: string): string {
        return createHash('sha256').update(input).digest('hex');
    }

    /**
     * Gets all Zero tables that should receive changes for a given MongoDB collection and document
     */
    private getMatchingTables(ns: ChangeStreamNameSpace, document: any): MappedTableMapping[] {
        const collectionName = ns.coll;
        const mappedTables = this.tableMappingService.getMappedTables(collectionName);
        
        return mappedTables.filter(mapping => 
            matchesFilter(document, mapping.config.filter || {})
        );
    }

    /**
     * Gets all collections that should be watched (both mapped and traditional)
     */
    getAllWatchedCollections(): string[] {
        return this.tableMappingService.getAllWatchedCollections();
    }

    //#region CRUD

    /**
     * Generates downstream changes for mongo `insert` change stream event
     *
     * An `insert` event occurs when an operation adds documents to a collection.
     *
     * @param doc The change stream document
     * @param withTransaction (Optional) Whether to wrap the event is a transaction. Defaults to `false`.
     * @see {@link https://www.mongodb.com/docs/manual/reference/change-events/insert/#mongodb-data-insert Insert Change Stream Event }
     */
    makeInsertChanges(
        watermark: string,
        doc: Pick<ChangeStreamInsertDocument, '_id' | 'fullDocument' | 'ns'>,
        withTransaction = false
    ): v0.ChangeStreamMessage[] {
        // do not expose the version field to downstream
        delete doc.fullDocument.__v;

        const changes: v0.ChangeStreamMessage[] = [];
        const matchingTables = this.getMatchingTables(doc.ns, doc.fullDocument);

        if (matchingTables.length > 0) {
            // Handle mapped/filtered tables
            for (const mapping of matchingTables) {
                const projectedDoc = applyProjection(doc.fullDocument, mapping.config.projection || {});
                
                changes.push([
                    'data',
                    {
                        tag: 'insert',
                        new: projectedDoc,
                        relation: {
                            keyColumns: mapping.spec.primaryKey || ['_id'],
                            schema: mapping.spec.schema,
                            name: mapping.tableName
                        }
                    }
                ] satisfies v0.Data);
            }
        } else {
            // Fallback to traditional 1:1 mapping
            const fallbackSpec = this.tableMappingService.getFallbackTable(doc.ns.coll);
            if (fallbackSpec) {
                changes.push([
                    'data',
                    {
                        tag: 'insert',
                        new: doc.fullDocument,
                        relation: relationFromChangeStreamEvent(doc.ns)
                    }
                ] satisfies v0.Data);
            }
        }

        // if the change is already in a transaction, don't wrap it in another
        if (!withTransaction) {
            return changes;
        }

        return this.#wrapInTransaction(changes, watermark);
    }

    /**
     * Generates downstream changes for an `update` change stream event
     *
     * An `update` event occurs when an operation updates a document in a collection
     *
     * @param doc The change stream document
     * @param withTransaction (Optional) Whether to wrap the event is a transaction. Defaults to `false`.
     * @see {@link https://www.mongodb.com/docs/manual/reference/change-events/update/#mongodb-data-update Update Change Stream Event}
     */
    makeUpdateChanges(
        watermark: string,
        doc: ChangeStreamUpdateDocument,
        withTransaction = false
    ): v0.ChangeStreamMessage[] {
        // not much of a change if we don't have the post-image ☹️
        invariant(
            !!doc.fullDocument,
            'received a change stream update event without a `fullDocument` value'
        );

        const changes: v0.ChangeStreamMessage[] = [];
        
        // For updates, we need both the original and updated document to check filters
        const originalDoc = doc.fullDocumentBeforeChange;
        const updatedDoc = doc.fullDocument;

        // do not expose the version field to downstream
        delete updatedDoc.__v;
        if (originalDoc) {
            delete originalDoc.__v;
        }

        const matchingTablesAfter = this.getMatchingTables(doc.ns, updatedDoc);
        const matchingTablesBefore = originalDoc ? this.getMatchingTables(doc.ns, originalDoc) : [];

        if (matchingTablesAfter.length > 0 || matchingTablesBefore.length > 0) {
            // Handle mapped/filtered tables
            const allTableNames = new Set([
                ...matchingTablesAfter.map(m => m.tableName),
                ...matchingTablesBefore.map(m => m.tableName)
            ]);

            for (const tableName of allTableNames) {
                const tableAfter = matchingTablesAfter.find(m => m.tableName === tableName);
                const tableBefore = matchingTablesBefore.find(m => m.tableName === tableName);

                if (tableAfter && tableBefore) {
                    // Document matches filter both before and after - normal update
                    const projectedDoc = applyProjection(updatedDoc, tableAfter.config.projection || {});
                    
                    changes.push([
                        'data',
                        {
                            tag: 'update',
                            key: doc.documentKey,
                            new: projectedDoc,
                            relation: {
                                keyColumns: tableAfter.spec.primaryKey || ['_id'],
                                schema: tableAfter.spec.schema,
                                name: tableName
                            }
                        }
                    ] satisfies v0.Data);
                } else if (tableAfter && !tableBefore) {
                    // Document now matches filter - insert into this table
                    const projectedDoc = applyProjection(updatedDoc, tableAfter.config.projection || {});
                    
                    changes.push([
                        'data',
                        {
                            tag: 'insert',
                            new: projectedDoc,
                            relation: {
                                keyColumns: tableAfter.spec.primaryKey || ['_id'],
                                schema: tableAfter.spec.schema,
                                name: tableName
                            }
                        }
                    ] satisfies v0.Data);
                } else if (!tableAfter && tableBefore) {
                    // Document no longer matches filter - delete from this table
                    changes.push([
                        'data',
                        {
                            tag: 'delete',
                            key: doc.documentKey,
                            relation: {
                                keyColumns: tableBefore.spec.primaryKey || ['_id'],
                                schema: tableBefore.spec.schema,
                                name: tableName
                            }
                        }
                    ] satisfies v0.Data);
                }
            }
        } else {
            // Fallback to traditional 1:1 mapping
            const fallbackSpec = this.tableMappingService.getFallbackTable(doc.ns.coll);
            if (fallbackSpec) {
                changes.push([
                    'data',
                    {
                        tag: 'update',
                        key: doc.documentKey,
                        new: updatedDoc,
                        relation: relationFromChangeStreamEvent(doc.ns)
                    }
                ] satisfies v0.Data);
            }
        }

        if (!withTransaction) {
            return changes;
        }

        return this.#wrapInTransaction(changes, watermark);
    }

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
        withTransaction = false
    ): v0.ChangeStreamMessage[] {
        const changes: v0.ChangeStreamMessage[] = [];
        
        // do not expose the version field to downstream
        delete doc.fullDocument.__v;

        const matchingTables = this.getMatchingTables(doc.ns, doc.fullDocument);

        if (matchingTables.length > 0) {
            // Handle mapped/filtered tables
            for (const mapping of matchingTables) {
                const projectedDoc = applyProjection(doc.fullDocument, mapping.config.projection || {});
                
                // For replace, we delete the old and insert the new
                changes.push(
                    [
                        'data',
                        {
                            tag: 'delete',
                            key: doc.documentKey,
                            relation: {
                                keyColumns: mapping.spec.primaryKey || ['_id'],
                                schema: mapping.spec.schema,
                                name: mapping.tableName
                            }
                        }
                    ] satisfies v0.Data,
                    [
                        'data',
                        {
                            tag: 'insert',
                            new: projectedDoc,
                            relation: {
                                keyColumns: mapping.spec.primaryKey || ['_id'],
                                schema: mapping.spec.schema,
                                name: mapping.tableName
                            }
                        }
                    ] satisfies v0.Data
                );
            }
        } else {
            // Fallback to traditional 1:1 mapping
            const fallbackSpec = this.tableMappingService.getFallbackTable(doc.ns.coll);
            if (fallbackSpec) {
                const relation = relationFromChangeStreamEvent(doc.ns);
                changes.push(
                    [
                        'data',
                        {
                            tag: 'delete',
                            key: doc.documentKey,
                            relation
                        }
                    ] satisfies v0.Data,
                    [
                        'data',
                        {
                            tag: 'insert',
                            new: doc.fullDocument!,
                            relation
                        }
                    ] satisfies v0.Data
                );
            }
        }

        // if the change is already in a transaction, don't wrap it in another
        if (!withTransaction) {
            return changes;
        }

        return this.#wrapInTransaction(changes, watermark);
    }

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
        withTransaction = false
    ): v0.ChangeStreamMessage[] {
        invariant(
            Boolean(doc.documentKey),
            'received a change stream delete event without documentKey'
        );

        const changes: v0.ChangeStreamMessage[] = [];

        // For deletes, we need to send delete to all potential tables since we don't know
        // which filters the deleted document matched
        const mappedTables = this.tableMappingService.getMappedTables(doc.ns.coll);

        if (mappedTables.length > 0) {
            // Handle mapped/filtered tables - send delete to all potential tables
            for (const mapping of mappedTables) {
                changes.push([
                    'data',
                    {
                        tag: 'delete',
                        key: doc.documentKey,
                        relation: {
                            keyColumns: mapping.spec.primaryKey || ['_id'],
                            schema: mapping.spec.schema,
                            name: mapping.tableName
                        }
                    }
                ] satisfies v0.Data);
            }
        } else {
            // Fallback to traditional 1:1 mapping
            const fallbackSpec = this.tableMappingService.getFallbackTable(doc.ns.coll);
            if (fallbackSpec) {
                changes.push([
                    'data',
                    {
                        tag: 'delete',
                        key: doc.documentKey,
                        relation: relationFromChangeStreamEvent(doc.ns)
                    }
                ] satisfies v0.Data);
            }
        }

        // if the change is already in a transaction, don't wrap it in another
        if (!withTransaction) {
            return changes;
        }

        return this.#wrapInTransaction(changes, watermark);
    }

    //#endregion CRUD

    //#region DDL

    /**
     * Generates a series of change stream messages to create a table and its primary key index.
     *
     * @param spec - The specification of the table to be created, including its primary key.
     * @returns An array of change stream messages to create the table and its primary key index.
     * @throws Will throw an error if the table does not have a primary key.
     */
    makeCreateTableChanges(spec: TableSpec): v0.ChangeStreamMessage[] {
        invariant(
            !!spec.primaryKey,
            `Expected table ${spec.name} to have a primary key`
        );

        const pkColumns = spec.primaryKey.reduce(
            (acc, col) => {
                acc[col] = 'ASC';
                return acc;
            },
            {} as v0.IndexCreate['spec']['columns']
        );

        // Create a clean spec without the .from() field for Zero cache
        const cleanSpec = { ...spec };
        delete (cleanSpec as any).from;

        const changes: v0.ChangeStreamMessage[] = [
            // create the table
            [
                'data',
                {
                    tag: 'create-table',
                    spec: cleanSpec
                } satisfies v0.TableCreate
            ],
            // and a unique index on the table's primary key columns
            [
                'data',
                {
                    tag: 'create-index',
                    spec: {
                        name: `pk_${spec.schema}__${spec.name}___id`,
                        schema: spec.schema,
                        tableName: spec.name,
                        columns: pkColumns,
                        unique: true
                    }
                } satisfies v0.IndexCreate
            ]
        ];

        return changes;
    }

    /**
     * Generates downstream changes for a mongo `drop` change stream event
     *
     * A `drop` event occurs when a collection is dropped from a database
     *
     * @param doc The change stream document
     * @see {@link https://www.mongodb.com/docs/manual/reference/change-events/drop/#mongodb-data-drop}
     */
    makeDropCollectionChanges(
        watermark: string,
        doc: ChangeStreamDropDocument
    ): v0.ChangeStreamMessage[] {
        const changes: v0.ChangeStreamMessage[] = [];
        
        // Drop all mapped tables for this collection
        const mappedTables = this.tableMappingService.getMappedTables(doc.ns.coll);
        
        for (const mapping of mappedTables) {
            changes.push([
                'data',
                {
                    tag: 'drop-table',
                    id: {
                        schema: mapping.spec.schema,
                        name: mapping.tableName
                    }
                }
            ] satisfies v0.Data);
        }

        // Also handle fallback tables
        const fallbackSpec = this.tableMappingService.getFallbackTable(doc.ns.coll);
        if (fallbackSpec) {
            changes.push([
                'data',
                {
                    tag: 'drop-table',
                    id: {
                        schema: fallbackSpec.schema,
                        name: fallbackSpec.name
                    }
                }
            ] satisfies v0.Data);
        }

        return this.#wrapInTransaction(changes, watermark);
    }

    //#endregion DDL

    //#region Zero Pg Compat

    /**
     * Generates table events for the `zero_{SHARD_ID}.clients` table and the
     * `zero.schemaVersions` table to address Zero custom sources still having
     * some logic that is very coupled to upstreams being postgres DBs.
     *
     * **HACK:** this is a temporary solution that `MAY` go away if zero custom change
     * sources become truly upstream-agnostic. The current schema is as follows:
     *
     * ```sql
     * CREATE TABLE
     *   "zero_0"."clients" (
     *     "clientGroupID" text COLLATE "pg_catalog"."default" NOT NULL,
     *     "clientID" text COLLATE "pg_catalog"."default" NOT NULL,
     *     "lastMutationID" int8 NOT NULL,
     *     "userID" text COLLATE "pg_catalog"."default",
     *     CONSTRAINT "clients_pkey" PRIMARY KEY ("clientGroupID", "clientID")
     *   );
     *
     * ALTER TABLE "zero_0"."clients" OWNER TO "user";
     *
     * CREATE TABLE
     *   "zero"."schemaVersions" (
     *     "minSupportedVersion" int4,
     *     "maxSupportedVersion" int4,
     *     "lock" bool NOT NULL DEFAULT true,
     *     CONSTRAINT "schemaVersions_pkey" PRIMARY KEY ("lock"),
     *     CONSTRAINT "zero_schema_versions_single_row_constraint" CHECK (lock)
     *   );
     *
     * ALTER TABLE "zero"."schemaVersions" OWNER TO "user";
     * ```
     *
     * @param appId - The application ID to use for table name prefixes.
     * @param shardId - The identifier of the shard for which the table changes are to be made.
     * @returns An array of `v0.ChangeStreamMessage` objects representing the table changes.
     */
    makeZeroRequiredUpstreamTablesChanges(
        appId: string,
        shardId: string
    ): v0.ChangeStreamMessage[] {
        const changes: v0.ChangeStreamMessage[] = [
            ...this.makeCreateTableChanges({
                schema: `public`,
                name: `${appId}_${shardId}.clients`,
                columns: {
                    clientGroupID: {
                        pos: 1,
                        dataType: 'text',
                        notNull: true
                    },
                    clientID: {
                        pos: 2,
                        dataType: 'text',
                        notNull: true
                    },
                    lastMutationID: {
                        pos: 3,
                        dataType: 'int8',
                        notNull: true
                    },
                    userID: {
                        pos: 4,
                        dataType: 'text'
                    }
                },
                primaryKey: ['clientGroupID', 'clientID']
            }),
            ...this.makeCreateTableChanges({
                schema: `public`,
                name: `${appId}.schemaVersions`,
                columns: {
                    minSupportedVersion: {
                        pos: 1,
                        dataType: 'int4'
                    },
                    maxSupportedVersion: {
                        pos: 2,
                        dataType: 'int4'
                    },
                    lock: {
                        pos: 3,
                        dataType: 'boolean',
                        notNull: true
                    }
                },
                primaryKey: ['lock']
            }),
            ...this.makeCreateTableChanges({
                schema: `public`,
                name: `${appId}.permissions`,
                columns: {
                    permissions: {
                        pos: 1,
                        dataType: 'jsonb'
                    },
                    hash: {
                        pos: 2,
                        dataType: 'text'
                    },
                    lock: {
                        pos: 3,
                        dataType: 'boolean',
                        notNull: true
                    }
                },
                primaryKey: ['lock']
            })
        ];

        // Insert permissions data if available
        if (this.options.permissions) {
            // Generate hash from JSON string for versioning
            const permissionsHash = this.generateHash(JSON.stringify(this.options.permissions));

            changes.push([
                'data',
                {
                    tag: 'insert',
                    new: {
                        // Store the actual permissions object directly (NOT as JSON string)
                        permissions: this.options.permissions,
                        hash: permissionsHash,
                        lock: true
                    },
                    relation: {
                        keyColumns: ['lock'],
                        schema: 'public',
                        name: `${appId}.permissions`
                    }
                }
            ] satisfies v0.Data);
        }

        return changes;
    }

    //#endregion Zero Pg Compat

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
    makeBeginChanges(watermark: string): v0.ChangeStreamMessage[] {
        return [
            [
                'begin',
                { tag: 'begin' },
                { commitWatermark: watermark }
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
    makeCommitChanges(watermark: string): v0.ChangeStreamMessage[] {
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

    /**
     * Wraps the provided changes in a transaction by adding begin and commit changes.
     *
     * @param changes - An array of change stream messages to be wrapped in a transaction.
     * @param watermark - A string used to create the begin and commit changes.
     * @returns An array of change stream messages including the begin and commit changes.
     */
    #wrapInTransaction(
        changes: Iterable<v0.ChangeStreamMessage>,
        watermark: string
    ): v0.ChangeStreamMessage[] {
        return [
            ...this.makeBeginChanges(watermark),
            ...changes,
            ...this.makeCommitChanges(watermark)
            //
        ];
    }

    //#endregion Transactions
}
