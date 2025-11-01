import type { Dict } from '../dict.js';

import type { Filter } from './pipeline/match.js';
import type { Projection } from './pipeline/project.js';

/**
 * Legacy filter-based table mapping configuration (backward compatible).
 *
 * This approach supports simple filtering and projection operations.
 * It remains fully supported for existing configurations.
 *
 * @example
 * ```typescript
 * const mapping: TableMapping<IAccount> = {
 *   source: 'accounts',
 *   filter: { bundle: 'ENTERPRISE' },
 *   projection: { _id: 1, name: 1, bundle: 1 }
 * };
 * ```
 */
export interface SimpleTableMapping<TTable = Dict> {
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
     *
     * Supports:
     * - Include/exclude: `{ field: 1 }` or `{ field: 0 }`
     * - Field reference: `{ field: '$otherField' }`
     * - Projection operators: `{ field: { $concat: ['$a', '$b'] } }`
     */
    projection?: Projection<TTable>;

    //#region Exclusive Union Check

    pipeline?: never;

    //#endregion Exclusive Union Check
}
