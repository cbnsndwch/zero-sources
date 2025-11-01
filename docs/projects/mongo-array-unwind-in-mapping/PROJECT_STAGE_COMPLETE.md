# $project Pipeline Stage Implementation

## Summary

Successfully added support for MongoDB's `$project` aggregation stage to the pipeline-based table mapping configuration.

## Changes Made

### 1. New Type Definition

**File:** `libs/zero-contracts/src/upstream/pipeline/project.ts`

Created `ProjectStage<T>` interface representing MongoDB's $project operator:

```typescript
export interface ProjectStage<T = Dict> {
    $project: Record<string, 1 | 0 | DocumentPath | ProjectionOperator>;
}
```

Features:
- Supports field inclusion/exclusion (`1 | 0`)
- Supports field references (`DocumentPath`)
- Supports computed expressions (`ProjectionOperator`)
- Comprehensive JSDoc with multiple examples

### 2. Updated Pipeline Union

**File:** `libs/zero-contracts/src/upstream/pipeline/index.ts`

Added `ProjectStage` to the `PipelineStage` union:

```typescript
export type PipelineStage<T = Dict> =
    | MatchStage<T>
    | UnwindStage
    | SetStage
    | ProjectStage<T>;
```

### 3. New Helper Function

**File:** `libs/zero-contracts/src/upstream/table-mapping.helpers.ts`

Added `project()` helper function for creating $project stages:

```typescript
export function project(
    projection: Record<string, 1 | 0 | DocumentPath | ProjectionOperator>
): ProjectStage {
    return { $project: projection };
}
```

### 4. Builder API Enhancement

**File:** `libs/zero-contracts/src/upstream/table-mapping.helpers.ts`

Added `project()` method to `PipelineMappingBuilder` class:

```typescript
class PipelineMappingBuilder<T> {
    // ... existing methods ...
    
    project(
        projection: Record<string, 1 | 0 | DocumentPath | ProjectionOperator>
    ): this {
        this._pipeline.push({ $project: projection });
        return this;
    }
}
```

### 5. Documentation

**File:** `docs/projects/mongo-array-unwind-in-mapping/examples/project-stage.example.ts`

Created comprehensive examples demonstrating:
- Early projection for performance optimization
- Reshaping after unwinding
- Multi-stage transformations
- Builder API usage
- Combining $project with $addFields
- Using the helper function

## Key Differences: $project vs projection field

### Top-level `projection` field (SimpleTableMapping)
- Applied **only at the end** of processing
- Cannot be used in pipeline mappings
- Single transformation step

### `$project` pipeline stage (PipelineTableMapping)
- Can be used **at any point** in the pipeline
- Multiple $project stages can be chained
- Each stage transforms the document for subsequent stages
- More flexible and powerful

## Usage Examples

### Basic field selection
```typescript
const mapping: TableMapping = {
    source: 'users',
    pipeline: [
        { $match: { isActive: true } },
        { $project: { _id: 1, name: 1, email: 1 } }
    ]
};
```

### Computed fields
```typescript
const mapping: TableMapping = {
    source: 'users',
    pipeline: [
        {
            $project: {
                fullName: { $concat: ['$firstName', ' ', '$lastName'] },
                email: 1
            }
        }
    ]
};
```

### Using helper function
```typescript
import { project } from '@cbnsndwch/zero-contracts';

const mapping: TableMapping = {
    source: 'users',
    pipeline: [
        project({
            fullName: { $concat: ['$firstName', ' ', '$lastName'] },
            email: 1
        })
    ]
};
```

### Using builder API
```typescript
const mapping = pipelineBuilder<IUser>('users')
    .match({ isActive: true })
    .project({
        fullName: { $concat: ['$firstName', ' ', '$lastName'] },
        email: 1
    })
    .build();
```

## Benefits

1. **Pipeline Flexibility**: Transform documents at any stage of processing
2. **Performance Optimization**: Reduce document size early in pipeline before expensive operations
3. **Multi-step Transformations**: Chain multiple projections for complex reshaping
4. **Computed Fields**: Create intermediate calculated fields for use in later stages
5. **Open-Closed Principle**: New stages added without modifying existing code

## Implementation Status

✅ Type definitions complete
✅ Helper function complete
✅ Builder API complete
✅ Documentation and examples complete
✅ TypeScript compilation successful

⏳ Package needs to be built before usage in applications
⏳ Unit tests needed for $project stage executor
⏳ Integration tests with MongoDB aggregation
