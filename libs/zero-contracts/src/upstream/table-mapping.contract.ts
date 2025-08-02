import type { TableBuilderWithColumns, TableSchema } from '@rocicorp/zero';
import type { SchemaValueToTSType } from 'node_modules/@rocicorp/zero/out/zero-schema/src/table-schema.js';

import type { Dict } from '../dict.js';
import type { Filter } from './filter.contracts.js';

/**
 * Configuration for discriminated union table mapping
 */
export interface TableMapping<TTable = Dict> {
    /**
     * MongoDB collection name
     */
    source: string;

    /**
     * MongoDB filter to apply
     */
    filter?: Filter<TTable>;

    /**
     * MongoDB-like projection to apply. Both include/exclude (`1 | 0`) and
     * simple renaming (`$sourceField`) syntaxes are supported.
     */
    projection?: Record<keyof TTable, 1 | 0 | `$${string}`>;
}

/**
 * Extracts the shape of the rows from a table schema
 */
export type RowOf<T extends TableBuilderWithColumns<TableSchema>> = {
    [K in keyof T['schema']['columns']]: SchemaValueToTSType<
        T['schema']['columns'][K]
    >;
};

export type TypedSchema<
    TTables extends readonly TableBuilderWithColumns<TableSchema>[]
> = {
    tables: {
        readonly [K in TTables[number]['schema']['name']]: Extract<
            TTables[number]['schema'],
            { name: K }
        >;
    };
};

export type TableNames<
    TTables extends readonly TableBuilderWithColumns<TableSchema>[]
> = TTables[number]['schema']['name'];

export type TableMappings<
    TTables extends readonly TableBuilderWithColumns<TableSchema>[]
> = Record<TableNames<TTables>, TableMapping<unknown>>;
