# Phase 3 Progress: Change Source Implementation

## Status: In Progress ⏳

## Overview

Phase 3 adds pipeline execution support to the MongoDB change source, enabling real-time transformation of change stream events through aggregation pipelines.

## Completed Work ✅

### 1. Pipeline Executor Service

**File**: `libs/zero-source-mongodb/src/v0/pipeline-executor.service.ts`

Created comprehensive service for executing MongoDB aggregation pipeline stages on change stream documents.

#### Features Implemented:

**Core Pipeline Execution**:
- `executePipeline()`: Main entry point for processing documents through pipeline stages
- Sequential stage execution with early exit optimization
- Support for multiple output documents (from unwinding)

**Stage Executors**:
- `executeMatch()`: Document filtering using MongoDB query syntax
- `executeUnwind()`: Array deconstruction with options support
  - Preserves null/empty arrays when specified
  - Adds array index tracking
  - Proper handling of nested paths
- `executeSet()`: Computed field addition ($addFields/$set)
- `executeProject()`: Document reshaping and field selection

**Expression Evaluator**:
Implemented simplified MongoDB expression language:
- **Field references**: `$fieldName`, `$nested.path`
- **String operators**: `$concat`
- **Comparison operators**: `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`
- **Arithmetic operators**: `$add`, `$subtract`, `$multiply`, `$divide`
- **Conditional operators**: `$cond` (if-then-else logic)
- Extensible architecture for adding more operators

**Utilities**:
- `resolvePath()`: Dot-notation path resolution
- `setPath()`: Nested value assignment
- `computeFields()`: Expression evaluation
- Comprehensive error handling and logging

#### Code Structure:

```typescript
@Injectable()
export class PipelineExecutorService {
    // Main API
    executePipeline(document: any, pipeline: PipelineStage[]): any[]
    
    // Stage executors (private)
    private executeStage(documents: any[], stage: PipelineStage): any[]
    private executeMatch(documents: any[], stage: MatchStage): any[]
    private executeUnwind(documents: any[], stage: UnwindStage): any[]
    private executeSet(documents: any[], stage: SetStage): any[]
    private executeProject(documents: any[], stage: ProjectStage): any[]
    
    // Expression evaluator (private)
    private evaluateExpression(doc: any, expr: any): any
    private computeFields(doc: any, fields: Record<string, any>): any
    
    // Path utilities (private)
    private resolvePath(obj: any, path: string): any
    private setPath(obj: any, path: string, value: any): void
}
```

### 2. Service Registration

**File**: `libs/zero-source-mongodb/src/v0/index.ts`

- Added `PipelineExecutorService` to module exports
- Registered service in `v0ChangeSourceServices` provider array
- Service now available for dependency injection

### 3. Change Maker Integration Setup

**File**: `libs/zero-source-mongodb/src/v0/change-maker-v0.ts`

- Imported `PipelineExecutorService` and `isPipelineMapping` helper
- Injected executor service into constructor
- Prepared for integration with change processing methods

## Next Steps 🔄

### Immediate Tasks:

1. **Update `makeInsertChanges()`**:
   ```typescript
   // For each mapped table:
   if (isPipelineMapping(mapping.config)) {
       // Execute pipeline - may produce multiple documents
       const transformed = this.pipelineExecutor.executePipeline(
           doc.fullDocument,
           mapping.config.pipeline
       );
       
       // Generate one INSERT change per transformed document
       for (const transformedDoc of transformed) {
           changes.push(...);
       }
   } else {
       // Legacy path: filter + projection
       const projectedDoc = applyProjection(doc.fullDocument, ...);
       changes.push(...);
   }
   ```

2. **Update `makeUpdateChanges()`**:
   - Handle pipeline transformations on both `fullDocument` (after) and `fullDocumentBeforeChange` (before)
   - Detect documents that entered/exited filters due to updates
   - Generate appropriate INSERT/DELETE/UPDATE changes
   - Handle array element changes (compare before/after unwinding results)

3. **Update `makeReplaceChanges()`**:
   - Similar logic to updates
   - Execute pipeline on both old and new documents
   - Generate appropriate changes based on transformation results

4. **Update `makeDeleteChanges()`**:
   - Execute pipeline on deleted document (if fullDocumentBeforeChange available)
   - Generate DELETE changes for all transformed documents

### Challenges to Address:

**Array Element Updates**:
When an array is unwound, updates to the source document need to be translated to appropriate changes for each unwound "row":
- Element added → INSERT
- Element removed → DELETE  
- Element modified → UPDATE
- Array reordered → Multiple UPDATE/DELETE/INSERT

**Composite Key Generation**:
Pipeline mappings that unwind arrays need composite keys:
- Original document _id
- Array element identifier (index or unique field)
- Implement key generation strategy

**Performance Optimization**:
- Cache pipeline execution results where possible
- Minimize redundant transformations
- Consider batching for large arrays

## Implementation Examples

### Basic Unwind Example:

**Source Document**:
```json
{
  "_id": "acc123",
  "name": "Acme Corp",
  "members": [
    { "id": "u1", "role": "admin" },
    { "id": "u2", "role": "member" }
  ]
}
```

**Pipeline**:
```typescript
[
  { $unwind: '$members' },
  { $match: { 'members.role': 'admin' } }
]
```

**Transformed Output**:
```json
[
  {
    "_id": "acc123",
    "name": "Acme Corp",
    "members": { "id": "u1", "role": "admin" }
  }
]
```

**Generated Change**:
```typescript
['data', {
  tag: 'insert',
  new: { /* transformed document */ },
  relation: { /* table spec */ }
}]
```

### Complex Pipeline Example:

**Pipeline**:
```typescript
[
  { $match: { status: 'active' } },
  { $unwind: { path: '$items', includeArrayIndex: 'itemIndex' } },
  { $addFields: { 
      itemTotal: { $multiply: ['$items.price', '$items.quantity'] }
  } },
  { $project: {
      orderId: '$_id',
      itemId: '$items.id',
      itemName: '$items.name',
      itemTotal: 1,
      itemIndex: 1
  } }
]
```

**This produces one row per item with computed fields and clean structure**.

## Testing Requirements

### Unit Tests Needed:

1. **PipelineExecutorService Tests**:
   - `executePipeline()` with various stage combinations
   - `executeMatch()` with complex filters
   - `executeUnwind()` with options (preserve, array index)
   - `executeSet()` with computed fields
   - `executeProject()` with operators
   - `evaluateExpression()` for all supported operators
   - Edge cases: empty arrays, null values, missing fields

2. **ChangeMakerV0 Integration Tests**:
   - INSERT events with pipeline mappings
   - UPDATE events with array modifications
   - DELETE events for unwound documents
   - Filtering: documents entering/exiting filters
   - Multiple mappings per collection

### Integration Tests Needed:

1. **End-to-End Change Streaming**:
   - Real MongoDB change streams
   - Pipeline execution in change handlers
   - Zero sync protocol message generation
   - Watermark management

2. **Array Diff Scenarios**:
   - Array element added
   - Array element removed
   - Array element updated
   - Array reordered
   - Multiple changes in single update

## Performance Considerations

### Optimizations:

1. **Early Filtering**:
   - Apply $match stages early to reduce document count
   - Skip pipeline execution if no documents match

2. **Projection Optimization**:
   - Only access fields needed by pipeline
   - Minimize document copying

3. **Expression Caching**:
   - Cache compiled expressions for repeated evaluation
   - Reuse field path lookups

### Monitoring:

- Log pipeline execution time for long pipelines
- Track documents produced by unwinding
- Monitor change event queue depth

## Documentation Updates Needed

1. **User Guide**: How to use pipeline mappings
2. **Migration Guide**: Converting from filter/projection to pipelines
3. **Performance Guide**: Best practices for pipeline design
4. **API Reference**: Pipeline stage documentation

## Open Questions

1. **Composite Key Strategy**: How should composite keys be generated for unwound arrays?
   - Option A: `parentId_arrayIndex` (simple, but fragile with array mutations)
   - Option B: `parentId_elementId` (requires unique identifier in array elements)
   - Option C: Content-based hash (stable, but less readable)

2. **Array Diff Implementation**: Should we use:
   - Deep comparison of before/after arrays?
   - Element-by-element matching with identity field?
   - Index-based diffing?

3. **Transaction Boundaries**: When unwinding produces multiple rows, should they be:
   - Single transaction (atomic)
   - Separate changes (better for large arrays)
   - Configurable?

## Files Modified

✅ `libs/zero-source-mongodb/src/v0/pipeline-executor.service.ts` (created)
✅ `libs/zero-source-mongodb/src/v0/index.ts` (updated)
⏳ `libs/zero-source-mongodb/src/v0/change-maker-v0.ts` (partially updated)

## Next Phase Preview: Phase 4 - Array Diff Handling

Will implement sophisticated array diffing to properly handle UPDATE events that modify array elements:

- Detect which elements were added, removed, or changed
- Generate appropriate INSERT/UPDATE/DELETE changes
- Support both index-based and identity-based diffing
- Handle nested array modifications

---

**Current Status**: Pipeline executor service complete and registered. Ready to integrate with change processing logic.
