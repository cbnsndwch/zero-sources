import type { TableBuilderWithColumns, TableSchema } from '@rocicorp/zero';

import type { Dict } from '../dict.js';

import type { TableMapping } from './table-mapping.contract.js';

type Schema<TTables extends readonly TableBuilderWithColumns<TableSchema>[]> = {
    tables: {
        readonly [K in TTables[number]['schema']['name']]: Extract<
            TTables[number]['schema'],
            { name: K }
        >;
    };
};

type TableNames<
    TTables extends readonly TableBuilderWithColumns<TableSchema>[]
> = TTables[number]['schema']['name'];

/**
 * Group discriminated tables by their source collection
 * Useful for change source routing and optimization
 */
export function groupTablesBySource<
    const TTables extends readonly TableBuilderWithColumns<TableSchema>[]
>(
    schema: Schema<TTables>,
    tableMappings: Record<TableNames<TTables>, TableMapping<unknown>>
) {
    const tableNames = Object.keys(schema.tables) as TableNames<TTables>[];

    const sourceGroups = tableNames.reduce(
        (acc: Dict<TableNames<TTables>[]>, tableName) => {
            const config = tableMappings[tableName];
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
