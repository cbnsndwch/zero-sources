import { Injectable } from '@nestjs/common';
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
import { relationFromChangeStreamEvent } from '../utils/zero-relation-from-change-stream-event.js';
import { matchesFilter, applyProjection } from '../utils/discriminated-union.js';
import { DiscriminatedTableService, type DiscriminatedTableMapping } from './discriminated-table.service.js';

type TableSpec = v0.TableCreate['spec'];

@Injectable()
export class DiscriminatedChangeMakerV0 implements IChangeMaker<v0.ChangeStreamMessage> {
    constructor(private discriminatedTableService: DiscriminatedTableService) {}

    /**
     * Gets all Zero tables that should receive changes for a given MongoDB collection and document
     */
    private getMatchingTables(ns: ChangeStreamNameSpace, document: any): DiscriminatedTableMapping[] {
        const collectionName = ns.coll;
        const discriminatedMappings = this.discriminatedTableService.getDiscriminatedTables(collectionName);
        
        return discriminatedMappings.filter(mapping => 
            matchesFilter(document, mapping.config.filter || {})
        );
    }

    //#region CRUD

    /**
     * Generates downstream changes for mongo `insert` change stream event
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
            // Handle discriminated tables
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
            // Fallback to traditional mapping
            const fallbackSpec = this.discriminatedTableService.getFallbackTable(doc.ns.coll);
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
     */
    makeUpdateChanges(
        watermark: string,
        doc: ChangeStreamUpdateDocument,
        withTransaction = false
    ): v0.ChangeStreamMessage[] {
        const changes: v0.ChangeStreamMessage[] = [];
        
        // For updates, we need both the original and updated document to check filters
        const originalDoc = doc.fullDocumentBeforeChange;
        const updatedDoc = doc.fullDocument;

        if (!updatedDoc) {
            // If we don't have the full updated document, we can't process discriminated updates
            return changes;
        }

        delete updatedDoc.__v;
        if (originalDoc) {
            delete originalDoc.__v;
        }

        const matchingTablesAfter = this.getMatchingTables(doc.ns, updatedDoc);
        const matchingTablesBefore = originalDoc ? this.getMatchingTables(doc.ns, originalDoc) : [];

        // Handle discriminated tables
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

        // Fallback to traditional mapping if no discriminated tables matched
        if (changes.length === 0) {
            const fallbackSpec = this.discriminatedTableService.getFallbackTable(doc.ns.coll);
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

        // if the change is already in a transaction, don't wrap it in another
        if (!withTransaction) {
            return changes;
        }

        return this.#wrapInTransaction(changes, watermark);
    }

    /**
     * Generates downstream changes for a `replace` change stream event
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
            // Handle discriminated tables
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
            // Fallback to traditional mapping
            const fallbackSpec = this.discriminatedTableService.getFallbackTable(doc.ns.coll);
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
     */
    makeDeleteChanges(
        watermark: string,
        doc: ChangeStreamDeleteDocument,
        withTransaction = false
    ): v0.ChangeStreamMessage[] {
        const changes: v0.ChangeStreamMessage[] = [];

        // For deletes, we need to send delete to all potential tables since we don't know
        // which filters the deleted document matched
        const discriminatedMappings = this.discriminatedTableService.getDiscriminatedTables(doc.ns.coll);

        if (discriminatedMappings.length > 0) {
            // Handle discriminated tables - send delete to all potential tables
            for (const mapping of discriminatedMappings) {
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
            // Fallback to traditional mapping
            const fallbackSpec = this.discriminatedTableService.getFallbackTable(doc.ns.coll);
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

    makeDropCollectionChanges(
        watermark: string,
        doc: ChangeStreamDropDocument
    ): v0.ChangeStreamMessage[] {
        const changes: v0.ChangeStreamMessage[] = [];
        
        // Drop all discriminated tables for this collection
        const discriminatedMappings = this.discriminatedTableService.getDiscriminatedTables(doc.ns.coll);
        
        for (const mapping of discriminatedMappings) {
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
        const fallbackSpec = this.discriminatedTableService.getFallbackTable(doc.ns.coll);
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

        return changes;
    }

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

        const changes: v0.ChangeStreamMessage[] = [
            // create the table
            [
                'data',
                {
                    tag: 'create-table',
                    spec
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

    //#endregion DDL

    //#region Zero Pg Compat

    makeZeroRequiredUpstreamTablesChanges(appId: string, shardId: string): v0.ChangeStreamMessage[] {
        // This creates the required Zero tables for PostgreSQL compatibility
        return [
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
    }

    //#endregion Zero Pg Compat

    //#region Transactions

    makeBeginChanges(watermark?: string): v0.ChangeStreamMessage[] {
        return [
            [
                'begin',
                { tag: 'begin' },
                { commitWatermark: watermark || '' }
            ] satisfies v0.Begin
        ];
    }

    makeCommitChanges(watermark: string): v0.ChangeStreamMessage[] {
        return [
            [
                'commit',
                { tag: 'commit' },
                { watermark }
            ] satisfies v0.Commit
        ];
    }

    makeRollbackChanges(): v0.ChangeStreamMessage[] {
        return [['rollback', { tag: 'rollback' }]] satisfies v0.ChangeStreamMessage[];
    }

    //#endregion Transactions

    //#region Helpers

    #wrapInTransaction(
        changes: v0.ChangeStreamMessage[],
        watermark: string
    ): v0.ChangeStreamMessage[] {
        return [
            ...this.makeBeginChanges(watermark),
            ...changes,
            ...this.makeCommitChanges(watermark)
        ];
    }

    //#endregion Helpers
}