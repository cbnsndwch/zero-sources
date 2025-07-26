import type { TableBuilderWithColumns, TableSchema } from '@rocicorp/zero';

import type { Dict } from '../dict.js';

import {
    kTableMapping,
    type TableBuilderWithMapping,
    type TableMapping
} from './table-mapping.contract.js';

type Schema<TTables extends readonly TableBuilderWithColumns<TableSchema>[]> = {
    tables: {
        readonly [K in TTables[number]['schema']['name']]: Extract<
            TTables[number]['schema'],
            { name: K }
        >;
    };
};

/**
 * Extract all discriminated union configurations from a schema
 * Used by change sources to understand table routing
 */
export function getTableMappings<
    const TTables extends readonly TableBuilderWithColumns<TableSchema>[]
>(schema: Schema<TTables>) {
    type TableName = TTables[number]['schema']['name'];
    const configs: Partial<Record<TableName, TableMapping<unknown>>> = {};

    for (const [name, tableBuilder] of Object.entries(schema.tables)) {
        const config = getTableMapping(
            tableBuilder as TableBuilderWithMapping<TableSchema>
        );
        if (config) {
            configs[name as TableName] = config;
        }
    }

    return configs;
}

/**
 * Group discriminated tables by their source collection
 * Useful for change source routing and optimization
 */
export function groupTablesBySource<
    const TTables extends readonly TableBuilderWithColumns<TableSchema>[]
>(schema: Schema<TTables>) {
    type TableName = TTables[number]['schema']['name'];

    const sourceGroups: Dict<TableName[]> = {};

    for (const [tableName, tableBuilder] of Object.entries(schema.tables)) {
        const config = getTableMapping(
            tableBuilder as TableBuilderWithMapping<TableSchema>
        );
        if (!config) {
            continue;
        }

        if (!sourceGroups[config.source]) {
            sourceGroups[config.source] = [];
        }
        sourceGroups[config.source]!.push(tableName);
    }

    return sourceGroups;
}

/**
 * Attaches discriminated union configuration to a table schema. This metadata
 * is used by change sources but doesn't affect the Zero client
 *
 * @template T - The table schema type extending TableSchema
 * @param builder - The table builder instance that has columns defined
 * @param config - The table mapping configuration to apply
 * @returns A table builder with the mapping configuration attached
 */
export function withTableMapping<T extends TableSchema>(
    builder: TableBuilderWithColumns<T>,
    config: TableMapping
): TableBuilderWithMapping<T> {
    const discriminatedTable = builder as TableBuilderWithMapping<T>;
    discriminatedTable[kTableMapping] = config;
    return discriminatedTable;
}

/**
 * Extracts discriminated union configuration from a table schema
 */
export function getTableMapping<T extends TableSchema = TableSchema>(
    table: TableBuilderWithMapping<T>
): TableMapping | null {
    const discriminatedTable = table as TableBuilderWithMapping<T>;
    return discriminatedTable[kTableMapping] || null;
}

/**
 * Checks if a table has discriminated union configuration
 */
export function hasTableMapping<T extends TableSchema>(
    table: TableBuilderWithMapping<T>
): table is TableBuilderWithMapping<T> {
    return kTableMapping in table;
}
