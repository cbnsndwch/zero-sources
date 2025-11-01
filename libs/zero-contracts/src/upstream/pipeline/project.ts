import type { Dict } from '../../dict.js';

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
 * dollar sign ($), and values can be:
 * - DocumentPath: References to fields (e.g., '$_id', '$user.name')
 * - Arrays: For operators like $concat that take multiple arguments
 * - Nested operators: For composed operations
 * - Primitive values: For literal values
 *
 * Common operators include:
 * - Type conversion: $toString, $toInt, $toBool
 * - String operations: $concat, $substr, $toLower, $toUpper
 * - Custom operators: $hexToBase64Url
 * - Logical operators: $eq, $ne, $and, $or
 *
 * @example
 * ```typescript
 * // Simple field reference
 * const simpleOp: ProjectionOperator = {
 *   '$toString': '$_id'
 * };
 *
 * // String concatenation
 * const concatOp: ProjectionOperator = {
 *   '$concat': ['$firstName', ' ', '$lastName']
 * };
 *
 * // Nested operators
 * const nestedOp: ProjectionOperator = {
 *   '$concat': [
 *     { $hexToBase64Url: '$_id' },
 *     '_',
 *     '$members.id'
 *   ]
 * };
 * ```
 */
export type ProjectionOperator = {
    [operator: `$${string}`]:
        | DocumentPath
        | ProjectionOperator
        | Array<DocumentPath | ProjectionOperator | string | number | boolean>
        | string
        | number
        | boolean;
};

export type Projection<TTable = Dict> = Record<
    keyof TTable,
    1 | 0 | DocumentPath | ProjectionOperator
>;

/**
 * Represents a MongoDB $project aggregation stage.
 *
 * The $project stage reshapes documents by:
 * - Including/excluding fields
 * - Adding computed fields
 * - Renaming fields
 * - Creating new fields from expressions
 *
 * Unlike SimpleTableMapping projection which applies only to the final output,
 * $project stages can be used at any point in the pipeline to transform
 * documents before subsequent stages.
 *
 * @template T - The document type (for type hints only, not enforced at runtime)
 *
 * @example
 * ```typescript
 * // Include specific fields
 * const stage: ProjectStage = {
 *   $project: {
 *     _id: 1,
 *     name: 1,
 *     email: 1
 *   }
 * };
 *
 * // Exclude fields
 * const excludeStage: ProjectStage = {
 *   $project: {
 *     password: 0,
 *     internalNotes: 0
 *   }
 * };
 *
 * // Rename and compute fields
 * const computedStage: ProjectStage = {
 *   $project: {
 *     _id: 1,
 *     userId: '$_id',
 *     fullName: { $concat: ['$firstName', ' ', '$lastName'] },
 *     isActive: { $eq: ['$status', 'active'] }
 *   }
 * };
 *
 * // Complex transformations
 * const complexStage: ProjectStage = {
 *   $project: {
 *     compositeId: { $concat: ['$accountId', '_', '$userId'] },
 *     accountRef: '$accountId',
 *     userRef: { $toObjectId: '$userId' },
 *     metadata: {
 *       createdAt: '$createdAt',
 *       updatedAt: '$updatedAt'
 *     }
 *   }
 * };
 * ```
 */
export interface ProjectStage<T = Dict> {
    /**
     * MongoDB projection specification.
     *
     * Can contain:
     * - Inclusion: `{ field: 1 }` - include this field
     * - Exclusion: `{ field: 0 }` - exclude this field
     * - Field reference: `{ newField: '$existingField' }` - rename/reference field
     * - Operators: `{ field: { $concat: [...] } }` - computed values
     *
     * Note: Cannot mix inclusion and exclusion (except for _id which can always be explicitly excluded)
     */
    $project: Projection<T>;
}
