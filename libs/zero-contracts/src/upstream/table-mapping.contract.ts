import type { TableBuilderWithColumns, TableSchema } from '@rocicorp/zero';
import type { SchemaValueToTSType } from 'node_modules/@rocicorp/zero/out/zero-schema/src/table-schema.js';

import type { Dict } from '../dict.js';

import type { Filter } from './filter.contracts.js';

/**
 * Represents a document path identifier that must start with a dollar sign ($)
 * followed by a field name.
 *
 * This type enforces that document paths follow MongoDB's field reference convention
 * where they are prefixed with '$'. The path after the $ can use dot notation for
 * nested fields.
 *
 * @example
 * ```typescript
 * const validPath: DocumentPath = "$_id";        // Top-level field
 * const nestedPath: DocumentPath = "$user.name"; // Nested field
 * const deepPath: DocumentPath = "$address.city.zipCode"; // Deeply nested
 * ```
 */
export type DocumentPath = `$${string}`;

/**
 * Represents a projection operator used in database queries or data transformations.
 *
 * A projection operator is an object where keys are operator names starting with a
 * dollar sign ($), and values are DocumentPaths (also starting with $) that reference
 * fields in the source document.
 *
 * Common operators include type conversion operators like $toString, $toInt, $toBool,
 * and custom operators like $hexToBase64Url.
 *
 * @example
 * ```typescript
 * const projection: ProjectionOperator = {
 *   '$toString': '$_id',           // Convert _id field to string
 *   '$hexToBase64Url': '$objectId' // Convert objectId field from hex to base64url
 * };
 * ```
 */
export type ProjectionOperator = {
    [operator: `$${string}`]: DocumentPath;
};

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
    projection?: Record<
        keyof TTable,
        1 | 0 | DocumentPath | ProjectionOperator
    >;
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
