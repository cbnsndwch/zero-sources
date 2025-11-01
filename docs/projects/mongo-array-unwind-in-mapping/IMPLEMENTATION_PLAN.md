# Implementation Plan: Pipeline-Based Table Mappings with Array Unwinding

## Overview

This document outlines the implementation plan for adding pipeline-based table mapping support with array unwinding capabilities to the `@cbnsndwch/zero-source-mongodb` package.

## Phase 1: Type System & Contracts ✅

**Status**: COMPLETED

### Files Modified

- `libs/zero-contracts/src/upstream/table-mapping.contract.ts`

### Changes Made

1. **Discriminated Union Type**:
   - Created `TableMapping<TTable>` as union of `LegacyTableMapping` and `PipelineTableMapping`
   - Ensures compile-time safety - prevents mixing legacy and pipeline approaches

2. **Legacy Support**:
   - `LegacyTableMapping<TTable>` interface maintains backward compatibility
   - Existing configurations with `filter` property continue to work unchanged

3. **Pipeline Support**:
   - `PipelineTableMapping<TTable>` interface for new pipeline-based approach
   - `PipelineStage` union type for extensibility
   - Three initial stage types:
     - `MatchStage`: Filtering (`$match`)
     - `UnwindStage`: Array unwinding (`$unwind`)
     - `AddFieldsStage`: Computed fields (`$addFields`)

4. **Documentation**:
   - Comprehensive JSDoc comments with examples
   - Clear guidance on when to use each approach
   - Usage patterns for common scenarios

## Phase 2: Helper Utilities

**Status**: PLANNED

### Create Helper Functions

Create `libs/zero-contracts/src/upstream/table-mapping.helpers.ts` with builder functions:

```typescript
/**
 * Type guard to check if mapping uses pipeline approach
 */
export function isPipelineMapping<T>(
    mapping: TableMapping<T>
): mapping is PipelineTableMapping<T> {
    return 'pipeline' in mapping;
}

/**
 * Type guard to check if mapping uses legacy approach
 */
export function isLegacyMapping<T>(
    mapping: TableMapping<T>
): mapping is LegacyTableMapping<T> {
    return !('pipeline' in mapping);
}

/**
 * Creates a $match stage
 */
export function match(filter: Filter<any>): MatchStage {
    return { $match: filter };
}

/**
 * Creates an $unwind stage with simple path
 */
export function unwind(path: string): UnwindStage;

/**
 * Creates an $unwind stage with options
 */
export function unwind(options: UnwindOptions): UnwindStage;

/**
 * Implementation
 */
export function unwind(
    pathOrOptions: string | UnwindOptions
): UnwindStage {
    return {
        $unwind: typeof pathOrOptions === 'string'
            ? pathOrOptions
            : pathOrOptions
    };
}

/**
 * Creates an $addFields stage
 */
export function addFields(fields: Record<string, any>): AddFieldsStage {
    return { $addFields: fields };
}

/**
 * Converts legacy mapping to pipeline mapping
 */
export function toPipelineMapping<T>(
    mapping: LegacyTableMapping<T>
): PipelineTableMapping<T> {
    const pipeline: PipelineStage[] = [];
    
    if (mapping.filter) {
        pipeline.push({ $match: mapping.filter });
    }
    
    return {
        source: mapping.source,
        pipeline,
        projection: mapping.projection
    };
}
```

### Export from Index

Update `libs/zero-contracts/src/upstream/index.ts`:

```typescript
export * from './filter.contracts.js';
export * from './table-mapping.contract.js';
export * from './table-mapping.helpers.js';
```

## Phase 3: Change Source Implementation

**Status**: PLANNED

### 3.1 Update Table Mapping Service

**File**: `libs/zero-source-mongodb/src/v0/table-mapping.service.ts`

**Changes**:

1. Add pipeline support detection:

```typescript
initialize(
    tableSpecs: TableSpec[],
    tableMappings: Record<string, TableMapping<any>> = {}
): void {
    this.mappedTables.clear();
    this.fallbackTables.clear();

    for (const spec of tableSpecs) {
        const tableMapping = tableMappings[spec.name];

        // Handle fallback (no mapping)
        if (!tableMapping) {
            this.fallbackTables.set(spec.name, spec);
            continue;
        }

        // Create mapped table configuration
        const mapping: MappedTableMapping = {
            tableName: spec.name,
            config: tableMapping,
            spec,
            hasPipeline: isPipelineMapping(tableMapping) // NEW
        };

        if (!this.mappedTables.has(tableMapping.source)) {
            this.mappedTables.set(tableMapping.source, []);
        }
        this.mappedTables.get(tableMapping.source)!.push(mapping);
    }

    this.isInitialized = true;
}
```

2. Update `MappedTableMapping` interface:

```typescript
export interface MappedTableMapping {
    tableName: string;
    config: TableMapping;
    spec: TableSpec;
    hasPipeline?: boolean; // NEW - indicates pipeline-based mapping
}
```

### 3.2 Create Pipeline Executor Service

**File**: `libs/zero-source-mongodb/src/v0/pipeline-executor.service.ts` (NEW)

```typescript
import { Injectable, Logger } from '@nestjs/common';
import type {
    PipelineStage,
    MatchStage,
    UnwindStage,
    AddFieldsStage,
    Filter
} from '@cbnsndwch/zero-contracts';

/**
 * Service that executes pipeline stages on MongoDB documents
 */
@Injectable()
export class PipelineExecutorService {
    private readonly logger = new Logger(PipelineExecutorService.name);

    /**
     * Executes pipeline stages on a document
     * Returns array of documents (unwinding can produce multiple)
     */
    executePipeline(
        document: any,
        pipeline: PipelineStage[]
    ): any[] {
        let documents = [document];

        for (const stage of pipeline) {
            documents = this.executeStage(documents, stage);
            
            // Early exit if no documents remain
            if (documents.length === 0) {
                break;
            }
        }

        return documents;
    }

    private executeStage(
        documents: any[],
        stage: PipelineStage
    ): any[] {
        if ('$match' in stage) {
            return this.executeMatch(documents, stage);
        }
        if ('$unwind' in stage) {
            return this.executeUnwind(documents, stage);
        }
        if ('$addFields' in stage) {
            return this.executeAddFields(documents, stage);
        }

        this.logger.warn(`Unknown pipeline stage: ${Object.keys(stage)[0]}`);
        return documents;
    }

    private executeMatch(documents: any[], stage: MatchStage): any[] {
        // Filter documents based on MongoDB filter
        return documents.filter(doc => this.matchesFilter(doc, stage.$match));
    }

    private executeUnwind(documents: any[], stage: UnwindStage): any[] {
        const options = typeof stage.$unwind === 'string'
            ? { path: stage.$unwind }
            : stage.$unwind;

        const results: any[] = [];

        for (const doc of documents) {
            const arrayPath = options.path.startsWith('$')
                ? options.path.slice(1)
                : options.path;

            const arrayValue = this.resolvePath(doc, arrayPath);

            // Handle missing/null/empty arrays
            if (!arrayValue || !Array.isArray(arrayValue) || arrayValue.length === 0) {
                if (options.preserveNullAndEmptyArrays) {
                    results.push({ ...doc });
                }
                continue;
            }

            // Unwind array
            for (let i = 0; i < arrayValue.length; i++) {
                const unwound = { ...doc };
                this.setPath(unwound, arrayPath, arrayValue[i]);

                // Add array index if requested
                if (options.includeArrayIndex) {
                    unwound[options.includeArrayIndex] = i;
                }

                results.push(unwound);
            }
        }

        return results;
    }

    private executeAddFields(documents: any[], stage: AddFieldsStage): any[] {
        // Add computed fields to each document
        return documents.map(doc => ({
            ...doc,
            ...this.computeFields(doc, stage.$addFields)
        }));
    }

    private matchesFilter(document: any, filter: Filter<any>): boolean {
        // Implement MongoDB filter matching logic
        // This is a simplified version - full implementation needed
        for (const [field, condition] of Object.entries(filter)) {
            const value = this.resolvePath(document, field);

            if (typeof condition === 'object' && condition !== null) {
                // Handle operators like $eq, $in, $ne, etc.
                for (const [op, opValue] of Object.entries(condition)) {
                    switch (op) {
                        case '$eq':
                            if (value !== opValue) return false;
                            break;
                        case '$ne':
                            if (value === opValue) return false;
                            break;
                        case '$in':
                            if (!Array.isArray(opValue) || !opValue.includes(value)) {
                                return false;
                            }
                            break;
                        case '$nin':
                            if (Array.isArray(opValue) && opValue.includes(value)) {
                                return false;
                            }
                            break;
                        // Add more operators as needed
                        default:
                            this.logger.warn(`Unsupported filter operator: ${op}`);
                    }
                }
            } else {
                // Direct equality
                if (value !== condition) return false;
            }
        }

        return true;
    }

    private resolvePath(obj: any, path: string): any {
        const parts = path.split('.');
        let current = obj;

        for (const part of parts) {
            if (current == null) return undefined;
            current = current[part];
        }

        return current;
    }

    private setPath(obj: any, path: string, value: any): void {
        const parts = path.split('.');
        let current = obj;

        for (let i = 0; i < parts.length - 1; i++) {
            if (!(parts[i] in current)) {
                current[parts[i]] = {};
            }
            current = current[parts[i]];
        }

        current[parts[parts.length - 1]] = value;
    }

    private computeFields(doc: any, fields: Record<string, any>): Record<string, any> {
        // Implement field computation logic
        // This is simplified - full MongoDB expression support needed
        const result: Record<string, any> = {};

        for (const [field, expression] of Object.entries(fields)) {
            result[field] = this.evaluateExpression(doc, expression);
        }

        return result;
    }

    private evaluateExpression(doc: any, expression: any): any {
        // Implement MongoDB expression evaluation
        // Handle operators like $concat, $eq, etc.
        if (typeof expression === 'object' && expression !== null) {
            // Handle operators
            const operators = Object.keys(expression);
            if (operators.length > 0 && operators[0].startsWith('$')) {
                const op = operators[0];
                const args = expression[op];

                switch (op) {
                    case '$eq':
                        return this.evaluateExpression(doc, args[0]) === 
                               this.evaluateExpression(doc, args[1]);
                    case '$concat':
                        return args.map((arg: any) => 
                            this.evaluateExpression(doc, arg)
                        ).join('');
                    // Add more operators as needed
                }
            }
        }

        // Handle field references
        if (typeof expression === 'string' && expression.startsWith('$')) {
            return this.resolvePath(doc, expression.slice(1));
        }

        // Return literal value
        return expression;
    }
}
```

### 3.3 Integrate Pipeline Execution into Change Stream Handler

**File**: `libs/zero-source-mongodb/src/v0/change-stream-handler.service.ts`

**Changes**:

1. Inject `PipelineExecutorService`
2. Detect pipeline mappings
3. Execute pipeline for each change event
4. Handle array unwinding generating multiple change events

```typescript
@Injectable()
export class ChangeStreamHandlerService {
    constructor(
        private readonly tableMappingService: TableMappingService,
        private readonly pipelineExecutor: PipelineExecutorService, // NEW
        private readonly projectionService: ProjectionService,
        private readonly logger: Logger
    ) {}

    async handleChange(
        change: ChangeStreamDocument,
        sink: ChangeStreamSink
    ): Promise<void> {
        const mappings = this.tableMappingService.getMappedTables(
            change.ns.coll
        );

        for (const mapping of mappings) {
            if (isPipelineMapping(mapping.config)) {
                // NEW: Handle pipeline-based mapping
                await this.handlePipelineChange(change, mapping, sink);
            } else {
                // Existing: Handle legacy mapping
                await this.handleLegacyChange(change, mapping, sink);
            }
        }
    }

    private async handlePipelineChange(
        change: ChangeStreamDocument,
        mapping: MappedTableMapping,
        sink: ChangeStreamSink
    ): Promise<void> {
        const pipelineConfig = mapping.config as PipelineTableMapping;

        // Execute pipeline on full document
        const documents = this.pipelineExecutor.executePipeline(
            change.fullDocument,
            pipelineConfig.pipeline
        );

        // Each resulting document becomes a separate change event
        for (const doc of documents) {
            // Apply projection if specified
            const projected = pipelineConfig.projection
                ? this.projectionService.applyProjection(doc, pipelineConfig.projection)
                : doc;

            // Push change event
            await sink.pushChange({
                op: 'insert', // or appropriate op based on change type
                tableName: mapping.tableName,
                row: projected
            });
        }
    }

    private async handleLegacyChange(
        change: ChangeStreamDocument,
        mapping: MappedTableMapping,
        sink: ChangeStreamSink
    ): Promise<void> {
        // Existing implementation for legacy mappings
        // ...
    }
}
```

## Phase 4: Array Diff Handling

**Status**: PLANNED

### Challenge

When a MongoDB document with an unwound array is updated, we need to:

1. Detect which array elements were added/removed/modified
2. Generate appropriate change events (insert/delete/update) for each

### Solution

**File**: `libs/zero-source-mongodb/src/v0/array-diff.service.ts` (NEW)

```typescript
import { Injectable } from '@nestjs/common';

export interface ArrayDiff {
    added: Array<{ index: number; value: any }>;
    removed: Array<{ index: number; value: any }>;
    modified: Array<{ index: number; oldValue: any; newValue: any }>;
}

@Injectable()
export class ArrayDiffService {
    /**
     * Computes diff between two arrays
     */
    computeDiff(
        oldArray: any[] | undefined,
        newArray: any[] | undefined,
        identityField?: string
    ): ArrayDiff {
        // If no identity field, use index-based comparison
        if (!identityField) {
            return this.indexBasedDiff(oldArray || [], newArray || []);
        }

        // Use identity field for stable comparison
        return this.identityBasedDiff(
            oldArray || [],
            newArray || [],
            identityField
        );
    }

    private indexBasedDiff(oldArray: any[], newArray: any[]): ArrayDiff {
        const added: ArrayDiff['added'] = [];
        const removed: ArrayDiff['removed'] = [];
        const modified: ArrayDiff['modified'] = [];

        const maxLength = Math.max(oldArray.length, newArray.length);

        for (let i = 0; i < maxLength; i++) {
            if (i >= oldArray.length) {
                // Added
                added.push({ index: i, value: newArray[i] });
            } else if (i >= newArray.length) {
                // Removed
                removed.push({ index: i, value: oldArray[i] });
            } else if (!this.deepEqual(oldArray[i], newArray[i])) {
                // Modified
                modified.push({
                    index: i,
                    oldValue: oldArray[i],
                    newValue: newArray[i]
                });
            }
        }

        return { added, removed, modified };
    }

    private identityBasedDiff(
        oldArray: any[],
        newArray: any[],
        identityField: string
    ): ArrayDiff {
        const added: ArrayDiff['added'] = [];
        const removed: ArrayDiff['removed'] = [];
        const modified: ArrayDiff['modified'] = [];

        // Create maps for efficient lookup
        const oldMap = new Map(
            oldArray.map((item, index) => [item[identityField], { item, index }])
        );
        const newMap = new Map(
            newArray.map((item, index) => [item[identityField], { item, index }])
        );

        // Find added and modified
        for (const [id, { item: newItem, index: newIndex }] of newMap) {
            const old = oldMap.get(id);
            if (!old) {
                added.push({ index: newIndex, value: newItem });
            } else if (!this.deepEqual(old.item, newItem)) {
                modified.push({
                    index: newIndex,
                    oldValue: old.item,
                    newValue: newItem
                });
            }
        }

        // Find removed
        for (const [id, { item: oldItem, index: oldIndex }] of oldMap) {
            if (!newMap.has(id)) {
                removed.push({ index: oldIndex, value: oldItem });
            }
        }

        return { added, removed, modified };
    }

    private deepEqual(a: any, b: any): boolean {
        // Simple deep equality check
        return JSON.stringify(a) === JSON.stringify(b);
    }
}
```

## Phase 5: Testing

**Status**: PLANNED

### Unit Tests

1. **Type Safety Tests** (`libs/zero-contracts/src/upstream/table-mapping.contract.spec.ts`):
   - Verify discriminated union prevents mixing
   - Test type guards
   - Validate helper functions

2. **Pipeline Executor Tests** (`libs/zero-source-mongodb/src/v0/pipeline-executor.service.spec.ts`):
   - Test $match stage
   - Test $unwind stage with various options
   - Test $addFields stage
   - Test pipeline composition

3. **Array Diff Tests** (`libs/zero-source-mongodb/src/v0/array-diff.service.spec.ts`):
   - Test index-based diff
   - Test identity-based diff
   - Test edge cases (empty arrays, nulls, etc.)

### Integration Tests

1. **End-to-End Pipeline Tests**:
   - Create test MongoDB collection with nested arrays
   - Configure pipeline mapping with unwinding
   - Verify change events generated correctly
   - Test array modifications (add/remove/update elements)

2. **Backward Compatibility Tests**:
   - Verify existing legacy mappings continue to work
   - Test migration from legacy to pipeline

## Phase 6: Documentation

**Status**: PLANNED

### Update Documentation

1. **API Documentation**:
   - Update JSDoc comments with real-world examples
   - Create migration guide from legacy to pipeline

2. **User Guide**:
   - Create comprehensive guide for pipeline-based mappings
   - Provide patterns for common use cases
   - Document performance considerations

3. **Examples**:
   - Account members example (from ISSUE.md)
   - Order line items example
   - Comments/replies example
   - Tags example

## Phase 7: Performance Optimization

**Status**: PLANNED

### Optimizations

1. **Pipeline Execution**:
   - Cache compiled filters
   - Optimize array unwinding for large arrays
   - Batch change events

2. **Array Diffing**:
   - Use efficient diffing algorithms for large arrays
   - Consider streaming approach for very large arrays

3. **Change Stream Handling**:
   - Parallelize pipeline execution where possible
   - Implement batching for multiple change events

## Migration Path

### For Existing Users

1. **No Breaking Changes**: Existing `filter`-based mappings continue to work
2. **Gradual Adoption**: Users can migrate to pipeline approach incrementally
3. **Helper Functions**: Utilities provided to assist migration

### Migration Example

```typescript
// Old (still works)
const oldMapping: TableMapping = {
    source: 'accounts',
    filter: { bundle: 'ENTERPRISE' },
    projection: { _id: 1, name: 1 }
};

// New (more powerful)
const newMapping: TableMapping = {
    source: 'accounts',
    pipeline: [
        { $match: { bundle: 'ENTERPRISE' } },
        { $unwind: '$members' }
    ],
    projection: {
        _id: { $concat: ['$_id', '_', '$members.id'] },
        accountId: '$_id',
        userId: '$members.id',
        name: '$members.name'
    }
};

// Or use helper
const converted = toPipelineMapping(oldMapping);
```

## Success Criteria

1. ✅ **Type Safety**: TypeScript prevents invalid configurations at compile time
2. ⏳ **Backward Compatibility**: All existing mappings work without changes
3. ⏳ **Array Unwinding**: Successfully normalize arrays into separate tables
4. ⏳ **Change Tracking**: Correctly handle array element add/remove/update
5. ⏳ **Performance**: No significant performance degradation vs legacy approach
6. ⏳ **Documentation**: Comprehensive docs with examples
7. ⏳ **Testing**: >90% code coverage for new features

## Timeline

- **Phase 1**: Completed ✅
- **Phase 2**: 1-2 days (helper utilities)
- **Phase 3**: 3-5 days (change source implementation)
- **Phase 4**: 2-3 days (array diff handling)
- **Phase 5**: 3-4 days (comprehensive testing)
- **Phase 6**: 2-3 days (documentation)
- **Phase 7**: 2-3 days (performance optimization)

**Total Estimated Time**: 13-20 days

## Next Steps

1. ✅ Complete Phase 1 (Type system)
2. Create helper utilities (Phase 2)
3. Begin change source implementation (Phase 3)
4. Set up test infrastructure
5. Document progress and gather feedback
