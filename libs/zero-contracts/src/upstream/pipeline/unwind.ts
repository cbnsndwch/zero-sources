import type { Dict } from '../../dict.js';

/**
 * Array unwinding stage - equivalent to MongoDB's $unwind operator.
 *
 * Deconstructs an array field from input documents to output a document for
 * each element. Each output document is the input document with the array
 * field replaced by the element.
 *
 * @example
 * ```typescript
 * // Simple unwinding
 * { $unwind: '$members' }
 *
 * // With options
 * { $unwind: {
 *   path: '$members',
 *   preserveNullAndEmptyArrays: false,
 *   includeArrayIndex: 'memberIndex'
 * }}
 * ```
 */
export interface UnwindStage<T = Dict> {
    $unwind: keyof T | UnwindOptions;
}

/**
 * Options for array unwinding operation.
 */
export interface UnwindOptions<T = Dict> {
    /**
     * Path to the array field to unwind (e.g., '$members', '$items').
     * Must start with '$' to indicate a field reference.
     */
    path: keyof T;

    /**
     * Optional: Preserve documents with null, missing, or empty arrays.
     *
     * - `true`: Output document even if array is null/missing/empty
     * - `false`: Skip documents without the array (default)
     *
     * @default false
     */
    preserveNullAndEmptyArrays?: boolean;

    /**
     * Optional: Include array index in output.
     *
     * Adds a field with the array element's position (zero-based index).
     * The field name is specified by this option.
     *
     * @example
     * ```typescript
     * { includeArrayIndex: 'memberIndex' }
     * // Adds field 'memberIndex' with values 0, 1, 2, ...
     * ```
     */
    includeArrayIndex?: string;
}
