import type { Dict } from 'src/dict.js';

import type { MatchStage } from './match.js';
import type { UnwindStage } from './unwind.js';
import type { SetStage } from './set.js';
import type { ProjectStage } from './project.js';

export * from './match.js';
export * from './unwind.js';
export * from './set.js';
export * from './project.js';

/**
 * Modern pipeline-based table mapping configuration.
 *
 * This approach supports composable transformation stages similar to MongoDB's
 * aggregation pipeline, enabling array unwinding, computed fields, and complex
 * transformations.
 *
 * Pipeline stages execute in array order, with projection applied last.
 *
 * @template TTable - The target Zero table type (provides type hints for consumers)
 *
 * @example
 * ```typescript
 * const mapping: TableMapping<IAccountMember> = {
 *   source: 'accounts',
 *   pipeline: [
 *     { $match: { bundle: 'ENTERPRISE' } },
 *     { $unwind: '$members' },
 *     { $match: { 'members.role': { $in: ['admin', 'owner'] } } }
 *   ],
 *   projection: {
 *     _id: { $concat: ['$_id', '_', '$members.id'] },
 *     accountId: '$_id',
 *     userId: '$members.id',
 *     name: '$members.name',
 *     role: '$members.role'
 *   }
 * };
 * ```
 */
export interface PipelineTableMapping<TTable = Dict> {
    /**
     * MongoDB collection name
     */
    source: string;

    /**
     * Aggregation pipeline stages executed in order before projection.
     *
     * Stages are processed sequentially:
     * 1. Each stage transforms the document
     * 2. Stages execute in array order
     * 3. Projection applies last (if specified)
     *
     * Common patterns:
     * - Filter before unwinding for performance: `[{ $match: ... }, { $unwind: ... }]`
     * - Filter unwound elements: `[{ $unwind: ... }, { $match: ... }]`
     * - Add computed fields: `[{ $addFields: ... }]`
     */
    pipeline: PipelineStage<TTable>[];

    //#region Exclusive Union Check

    filter?: never;
    projection?: never;

    //#endregion Exclusive Union Check
}

/**
 * Supported pipeline stages (extensible via union type).
 *
 * New stage types can be added to this union without breaking existing code,
 * following the Open-Closed Principle.
 */
export type PipelineStage<T = Dict> =
    | MatchStage<T>
    | UnwindStage
    | SetStage
    | ProjectStage<T>;
