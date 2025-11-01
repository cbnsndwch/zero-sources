import type { Dict } from '../../dict.js';

/**
 * Add computed fields stage - equivalent to MongoDB's $addFields operator.
 *
 * Adds new fields to documents or replaces existing fields with computed values.
 * Uses the same expression syntax as $project, but retains all existing fields.
 *
 * @example
 * ```typescript
 * {
 *   $set: {
 *     isOwner: { $eq: ['$role', 'owner'] },
 *     fullName: { $concat: ['$firstName', ' ', '$lastName'] }
 *   }
 * }
 * ```
 */
export interface SetStage {
    $addFields: Dict;
}
