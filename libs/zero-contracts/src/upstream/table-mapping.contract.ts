import type { TableBuilderWithColumns, TableSchema } from '@rocicorp/zero';

import type { Dict } from '../dict.js';
import type { Filter } from './filter.contracts.js';

/**
 * Symbol used to attach discriminated union metadata to table schemas
 * without interfering with Zero's internal table structure
 */
export const kTableMapping = Symbol.for('kTableMapping');

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
    projection?: Dict<1 | 0 | `$${string}`>;
}

/**
 * Extended table schema that can carry discriminated union metadata
 */
export interface TableBuilderWithMapping<T extends TableSchema>
    extends TableBuilderWithColumns<T> {
    [kTableMapping]?: TableMapping;
}
