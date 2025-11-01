import type { TableBuilderWithColumns, TableSchema } from '@rocicorp/zero';

import type { Dict } from '../dict.js';

import type {
    DocumentPath,
    Filter,
    MatchStage,
    PipelineStage,
    PipelineTableMapping,
    Projection,
    ProjectionOperator,
    ProjectStage,
    SetStage,
    UnwindOptions,
    UnwindStage
} from './pipeline/index.js';
import type { SimpleTableMapping } from './simple.js';
import type {
    TableMapping,
    TableMappings,
    TableNames,
    TypedSchema
} from './table-mapping.contract.js';

/**
 * Group discriminated tables by their source collection
 * Useful for change source routing and optimization
 */
export function groupTablesBySource<
    const TTables extends readonly TableBuilderWithColumns<TableSchema>[]
>(schema: TypedSchema<TTables>, mapping: TableMappings<TTables>) {
    const tableNames = Object.keys(schema.tables) as TableNames<TTables>[];

    const sourceGroups = tableNames.reduce(
        (acc: Dict<TableNames<TTables>[]>, tableName) => {
            const config = mapping[tableName];
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

/**
 * Type guard to check if a table mapping uses the pipeline-based approach.
 *
 * @param mapping - The table mapping to check
 * @returns True if the mapping uses pipeline, false if it uses simple filter
 *
 * @example
 * ```typescript
 * const mapping: TableMapping = { source: 'accounts', pipeline: [...] };
 *
 * if (isPipelineMapping(mapping)) {
 *   // mapping is PipelineTableMapping
 *   console.log(mapping.pipeline);
 * }
 * ```
 */
export function isPipelineMapping<T>(
    mapping: TableMapping<T>
): mapping is PipelineTableMapping<T> {
    return 'pipeline' in mapping;
}

/**
 * Type guard to check if a table mapping uses the simple filter-based approach.
 *
 * @param mapping - The table mapping to check
 * @returns True if the mapping uses simple filter, false if it uses pipeline
 *
 * @example
 * ```typescript
 * const mapping: TableMapping = { source: 'accounts', filter: {...} };
 *
 * if (isSimpleMapping(mapping)) {
 *   // mapping is SimpleTableMapping
 *   console.log(mapping.filter);
 * }
 * ```
 */
export function isSimpleMapping<T>(
    mapping: TableMapping<T>
): mapping is SimpleTableMapping<T> {
    return !('pipeline' in mapping);
}

/**
 * Creates a $match pipeline stage for filtering documents.
 *
 * This is equivalent to MongoDB's $match aggregation operator.
 *
 * @param filter - MongoDB filter criteria
 * @returns A $match stage
 *
 * @example
 * ```typescript
 * const stage = match({ bundle: 'ENTERPRISE', isActive: true });
 * // { $match: { bundle: 'ENTERPRISE', isActive: true } }
 *
 * const nestedStage = match({ 'members.role': { $in: ['admin', 'owner'] } });
 * // { $match: { 'members.role': { $in: ['admin', 'owner'] } } }
 * ```
 */
export function match<T>(filter: Filter<T>): MatchStage<T> {
    return { $match: filter };
}

/**
 * Creates an $unwind pipeline stage for deconstructing array fields.
 *
 * This is equivalent to MongoDB's $unwind aggregation operator.
 * Outputs one document for each element in the specified array field.
 *
 * @param path - Path to the array field (e.g., '$members')
 * @returns An $unwind stage with simple path
 *
 * @example
 * ```typescript
 * const stage = unwind('$members');
 * // { $unwind: '$members' }
 * ```
 */
export function unwind(path: string): UnwindStage;

/**
 * Creates an $unwind pipeline stage with advanced options.
 *
 * @param options - Unwinding options including path, preserve behavior, and index inclusion
 * @returns An $unwind stage with full options
 *
 * @example
 * ```typescript
 * const stage = unwind({
 *   path: '$members',
 *   preserveNullAndEmptyArrays: false,
 *   includeArrayIndex: 'memberIndex'
 * });
 * // { $unwind: { path: '$members', preserveNullAndEmptyArrays: false, includeArrayIndex: 'memberIndex' } }
 * ```
 */
export function unwind(options: UnwindOptions): UnwindStage;

/**
 * Implementation of unwind function overloads
 */
export function unwind(pathOrOptions: string | UnwindOptions): UnwindStage {
    return {
        $unwind:
            typeof pathOrOptions === 'string' ? pathOrOptions : pathOrOptions
    };
}

/**
 * Creates an $addFields pipeline stage for adding computed fields.
 *
 * This is equivalent to MongoDB's $addFields aggregation operator.
 * Adds new fields or replaces existing fields with computed values.
 *
 * @param fields - Object mapping field names to computed expressions
 * @returns An $addFields stage
 *
 * @example
 * ```typescript
 * const stage = addFields({
 *   isOwner: { $eq: ['$role', 'owner'] },
 *   fullName: { $concat: ['$firstName', ' ', '$lastName'] },
 *   computedAt: new Date().toISOString()
 * });
 * // { $addFields: { isOwner: ..., fullName: ..., computedAt: ... } }
 * ```
 */
export function addFields(fields: Record<string, any>): SetStage {
    return { $addFields: fields };
}

/**
 * Creates a $project pipeline stage for reshaping documents.
 *
 * This is equivalent to MongoDB's $project aggregation operator.
 * Unlike the top-level `projection` field which applies only to the final output,
 * $project stages can be used at any point in the pipeline.
 *
 * @param projection - Projection specification with field selections and computed values
 * @returns A $project stage
 *
 * @example
 * ```typescript
 * // Include specific fields
 * const includeStage = project({
 *   _id: 1,
 *   name: 1,
 *   email: 1
 * });
 * // { $project: { _id: 1, name: 1, email: 1 } }
 *
 * // Rename and compute fields
 * const computedStage = project({
 *   userId: '$_id',
 *   fullName: { $concat: ['$firstName', ' ', '$lastName'] },
 *   isActive: { $eq: ['$status', 'active'] }
 * });
 * // { $project: { userId: '$_id', fullName: ..., isActive: ... } }
 *
 * // Complex transformations
 * const complexStage = project({
 *   compositeId: { $concat: ['$accountId', '_', '$userId'] },
 *   accountRef: '$accountId',
 *   metadata: {
 *     createdAt: '$createdAt',
 *     updatedAt: '$updatedAt'
 *   }
 * });
 * ```
 */
export function project<T = Dict>(projection: Projection<T>): ProjectStage<T> {
    return { $project: projection };
}

/**
 * Converts a simple filter-based mapping to a pipeline-based mapping.
 *
 * This is useful for migrating existing configurations or when you need
 * pipeline features but want to preserve simple configuration structure.
 *
 * @param mapping - simple mapping to convert
 * @returns Equivalent pipeline-based mapping
 *
 * @example
 * ```typescript
 * const simple: SimpleTableMapping = {
 *   source: 'accounts',
 *   filter: { bundle: 'ENTERPRISE' },
 *   projection: { _id: 1, name: 1 }
 * };
 *
 * const pipeline = toPipelineMapping(simple);
 * // {
 * //   source: 'accounts',
 * //   pipeline: [{ $match: { bundle: 'ENTERPRISE' } }],
 * //   projection: { _id: 1, name: 1 }
 * // }
 * ```
 */
export function toPipelineMapping<T>(
    mapping: SimpleTableMapping<T>
): PipelineTableMapping<T> {
    const pipeline: PipelineStage<T>[] = [];

    // Convert filter to $match stage if present
    if (mapping.filter) {
        pipeline.push({ $match: mapping.filter });
    }

    // Only add projection if it exists
    if (mapping.projection) {
        pipeline.push({ $project: mapping.projection });
    }

    const result: PipelineTableMapping<T> = {
        source: mapping.source,
        pipeline
    };

    return result;
}

/**
 * Builder pattern for constructing pipeline-based table mappings fluently.
 *
 * Provides a chainable API for building complex pipeline configurations.
 *
 * @example
 * ```typescript
 * const mapping = pipelineBuilder<IAccountMember>('accounts')
 *   .match({ bundle: 'ENTERPRISE' })
 *   .unwind('$members')
 *   .match({ 'members.role': { $in: ['admin', 'owner'] } })
 *   .addFields({
 *     isOwner: { $eq: ['$members.role', 'owner'] }
 *   })
 *   .projection({
 *     _id: { $concat: ['$_id', '_', '$members.id'] },
 *     accountId: '$_id',
 *     userId: '$members.id',
 *     name: '$members.name',
 *     role: '$members.role',
 *     isOwner: 1
 *   })
 *   .build();
 * ```
 */
export class PipelineMappingBuilder<T> {
    private readonly _source: string;
    private readonly _pipeline: PipelineStage[] = [];
    private _projection?: PipelineTableMapping<T>['projection'];

    constructor(source: string) {
        this._source = source;
    }

    /**
     * Adds a $match stage to filter documents
     */
    match(filter: Filter<any>): this {
        this._pipeline.push({ $match: filter });
        return this;
    }

    /**
     * Adds an $unwind stage to deconstruct an array field
     */
    unwind(path: string): this;
    unwind(options: UnwindOptions): this;
    unwind(pathOrOptions: string | UnwindOptions): this {
        this._pipeline.push({
            $unwind:
                typeof pathOrOptions === 'string'
                    ? pathOrOptions
                    : pathOrOptions
        });
        return this;
    }

    /**
     * Adds an $addFields stage to compute new fields
     */
    addFields(fields: Record<string, any>): this {
        this._pipeline.push({ $addFields: fields });
        return this;
    }

    /**
     * Adds a $project stage to reshape documents at any point in the pipeline
     */
    project(
        projection: Record<string, 1 | 0 | DocumentPath | ProjectionOperator>
    ): this {
        this._pipeline.push({ $project: projection });
        return this;
    }

    /**
     * Sets the projection for the final output
     */
    projection(proj: PipelineTableMapping<T>['projection']): this {
        this._projection = proj;
        return this;
    }

    /**
     * Builds and returns the final pipeline mapping configuration
     */
    build(): PipelineTableMapping<T> {
        const result: PipelineTableMapping<T> = {
            source: this._source,
            pipeline: [...(this._pipeline as unknown as PipelineStage<T>[])]
        };

        // Only add projection if it was set
        if (this._projection) {
            result.projection = this._projection;
        }

        return result;
    }
}

/**
 * Creates a new pipeline mapping builder.
 *
 * @param source - MongoDB collection name
 * @returns A new PipelineMappingBuilder instance
 *
 * @example
 * ```typescript
 * const mapping = pipelineBuilder<IUser>('users')
 *   .match({ isActive: true })
 *   .addFields({ fullName: { $concat: ['$firstName', ' ', '$lastName'] } })
 *   .projection({ _id: 1, fullName: 1, email: 1 })
 *   .build();
 * ```
 */
export function pipelineBuilder<T>(source: string): PipelineMappingBuilder<T> {
    return new PipelineMappingBuilder<T>(source);
}
