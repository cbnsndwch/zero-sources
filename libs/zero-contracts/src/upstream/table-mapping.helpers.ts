import type { TableBuilderWithColumns, TableSchema } from '@rocicorp/zero';

import type { Dict } from '../dict.js';

import type {
    TableMappings,
    TableNames,
    TypedSchema
} from './table-mapping.contract.js';

/**
 * Group discriminated tables by their source collection
 * Useful for change source routing and optimization
 */
export function groupTablesBySource<
    const TTables extends readonly TableBuilderWithColumns<TableSchema>[]
>(schema: TypedSchema<TTables>, mapping: TableMappings<TTables>) {
    const tableNames = Object.keys(schema.tables) as TableNames<TTables>[];

    const sourceGroups = tableNames.reduce(
        (acc: Dict<TableNames<TTables>[]>, tableName) => {
            const config = mapping[tableName];
            if (!config) {
                return acc;
            }

            if (!acc[config.source]) {
                acc[config.source] = [];
            }
            acc[config.source]!.push(tableName);

            return acc;
        },
        {}
    );

    return sourceGroups;
}
