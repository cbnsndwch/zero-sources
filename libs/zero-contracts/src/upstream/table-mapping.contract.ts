import type { TableBuilderWithColumns, TableSchema } from '@rocicorp/zero';
import type { SchemaValueToTSType } from 'node_modules/@rocicorp/zero/out/zero-schema/src/table-schema.js';

import type { Dict } from '../dict.js';

import type { SimpleTableMapping } from './simple.js';
import type { PipelineTableMapping } from './pipeline/index.js';

/**
 * Table mapping configuration using mutually exclusive approaches.
 * Use EITHER legacy filter-based OR modern pipeline-based mapping, but not both.
 *
 * The discriminated union ensures compile-time safety by preventing accidental
 * mixing of the two approaches.
 */
export type TableMapping<TTable = Dict> =
    | SimpleTableMapping<TTable>
    | PipelineTableMapping<TTable>;

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
