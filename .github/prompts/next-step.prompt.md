# MongoDB Array Unwinding Pipeline Implementation - Next Steps

## Project: mongo-array-unwind-in-mapping

**Branch**: `copilot/vscode1762000567071`  
**PR**: [#138 - WIP] Design API with the Open-Closed Principle in mind

## Current Status: Phase 3 (75% Complete)

### ✅ Completed Work

#### Phase 1: Type System (100% ✅)
- **Discriminated Union Architecture**: `TableMapping = SimpleTableMapping | PipelineTableMapping`
- **Pipeline Stages**: `MatchStage`, `UnwindStage`, `SetStage`, `ProjectStage`
- **Location**: `libs/zero-contracts/src/upstream/`
  - `pipeline/match.ts` - $match filtering
  - `pipeline/unwind.ts` - $unwind array deconstruction
  - `pipeline/set.ts` - $addFields computed fields
  - `pipeline/project.ts` - $project document reshaping (newly added)
  - `simple/index.ts` - Legacy SimpleTableMapping (backward compatible)

#### Phase 2: Helper Utilities (100% ✅)
- **Location**: `libs/zero-contracts/src/upstream/table-mapping.helpers.ts`
- **Type Guards**: `isPipelineMapping()`, `isSimpleMapping()`
- **Stage Builders**: `match()`, `unwind()`, `addFields()`, `project()`
- **Migration Helper**: `toPipelineMapping()` converts legacy to pipeline
- **Fluent Builder**: `PipelineMappingBuilder` class with chainable API
- **Factory**: `pipelineBuilder()` function

#### Phase 3: Change Source Implementation (75% ✅)

**Completed**:
1. **Pipeline Executor Service** ✅
   - **Location**: `libs/zero-source-mongodb/src/v0/pipeline-executor.service.ts`
   - **Core Method**: `executePipeline(document, pipeline): any[]`
   - **Stage Executors**:
     - `executeMatch()` - Filters using MongoDB query syntax
     - `executeUnwind()` - Array deconstruction with index tracking
     - `executeSet()` - Adds computed fields
     - `executeProject()` - Reshapes documents
   - **Expression Evaluator**: Supports 10+ MongoDB operators
     - String: `$concat`
     - Comparison: `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`
     - Arithmetic: `$add`, `$subtract`, `$multiply`, `$divide`
     - Conditional: `$cond`
   - **Utilities**: Path resolution, field computation

2. **Service Registration** ✅
   - **Location**: `libs/zero-source-mongodb/src/v0/index.ts`
   - Exported and registered in `v0ChangeSourceServices` array
   - Available for dependency injection

3. **Build & Compilation** ✅
   - All packages compile successfully
   - Fixed TypeScript type narrowing issues
   - Fixed UnwindOptions path handling (string | number)

**In Progress**:
4. **ChangeMaker Integration** ⏳
   - **Location**: `libs/zero-source-mongodb/src/v0/change-maker-v0.ts`
   - Service imported and injected
   - **TODO**: Update change processing methods

### 🎯 Immediate Next Steps

#### 1. Update `makeInsertChanges()` Method

Current logic handles simple mappings with filter + projection. Need to add pipeline support:

```typescript
makeInsertChanges(watermark, doc, withTransaction = false) {
    const changes: v0.ChangeStreamMessage[] = [];
    const matchingTables = this.getMatchingTables(doc.ns, doc.fullDocument);

    for (const mapping of matchingTables) {
        if (isPipelineMapping(mapping.config)) {
            // NEW: Execute pipeline (may produce multiple documents)
            const transformed = this.pipelineExecutor.executePipeline(
                doc.fullDocument,
                mapping.config.pipeline
            );
            
            // Generate one INSERT per transformed document
            for (const transformedDoc of transformed) {
                changes.push([
                    'data',
                    {
                        tag: 'insert',
                        new: transformedDoc,
                        relation: {
                            keyColumns: mapping.spec.primaryKey || ['_id'],
                            schema: mapping.spec.schema,
                            name: mapping.tableName
                        }
                    }
                ]);
            }
        } else {
            // EXISTING: Legacy path (filter + projection)
            const projectedDoc = applyProjection(
                doc.fullDocument,
                mapping.config.projection || {}
            );
            changes.push([...]);
        }
    }
    
    return withTransaction ? this.#wrapInTransaction(changes, watermark) : changes;
}
```

#### 2. Update `makeUpdateChanges()` Method (Complex)

Updates are tricky because:
- Need to execute pipeline on BOTH `fullDocument` (after) and `fullDocumentBeforeChange` (before)
- Compare results to detect which "rows" were added/removed/changed
- Handle array element modifications

**Array Update Scenarios**:
```typescript
// Before: { members: [{id:'u1', role:'admin'}, {id:'u2', role:'member'}] }
// After:  { members: [{id:'u1', role:'owner'}, {id:'u3', role:'member'}] }

// After unwinding:
// - u1 changed (admin → owner) = UPDATE
// - u2 removed = DELETE
// - u3 added = INSERT
```

**Required Logic**:
```typescript
makeUpdateChanges(watermark, doc, withTransaction = false) {
    const changes: v0.ChangeStreamMessage[] = [];
    const matchingTables = this.getMatchingTables(doc.ns, doc.fullDocument);

    for (const mapping of matchingTables) {
        if (isPipelineMapping(mapping.config)) {
            // Execute pipeline on both versions
            const docsAfter = this.pipelineExecutor.executePipeline(
                doc.fullDocument,
                mapping.config.pipeline
            );
            const docsBefore = doc.fullDocumentBeforeChange
                ? this.pipelineExecutor.executePipeline(
                      doc.fullDocumentBeforeChange,
                      mapping.config.pipeline
                  )
                : [];

            // TODO Phase 4: Array diff logic
            // - Match docs by composite key
            // - Detect: added, removed, changed
            // - Generate appropriate INSERT/UPDATE/DELETE
        } else {
            // EXISTING: Legacy update logic
        }
    }
}
```

#### 3. Update `makeReplaceChanges()` and `makeDeleteChanges()`

Similar patterns to updates - execute pipeline and generate appropriate changes.

### 📋 Phase 4: Array Diff Handling (Planned)

Need to implement sophisticated diffing for UPDATE events:

**Key Decision**: How to match array elements?
- **Option A**: Index-based (fragile, breaks on reordering)
- **Option B**: Identity field (requires unique ID in elements)
- **Option C**: Content hash (stable, less readable)

**Recommended Approach**: Identity field with fallback to index:
```typescript
interface ArrayDiffOptions {
    identityField?: string; // e.g., 'id', '_id'
    fallbackToIndex?: boolean; // default: true
}

function computeArrayDiff(
    before: any[],
    after: any[],
    options: ArrayDiffOptions
): ArrayDiffResult {
    // Returns: { added: [], removed: [], updated: [] }
}
```

### 🔧 Technical Details

**File Locations**:
- Contracts: `libs/zero-contracts/src/upstream/`
- MongoDB Source: `libs/zero-source-mongodb/src/v0/`
- Documentation: `docs/projects/mongo-array-unwind-in-mapping/`

**Key Interfaces**:
```typescript
// Pipeline mapping (NEW)
interface PipelineTableMapping<T> {
    source: string;
    pipeline: PipelineStage[];
}

// Simple mapping (LEGACY - backward compatible)
interface SimpleTableMapping<T> {
    source: string;
    filter?: Filter<T>;
    projection?: Record<keyof T, 1 | 0 | DocumentPath | ProjectionOperator>;
}

// Discriminated union
type TableMapping<T> = SimpleTableMapping<T> | PipelineTableMapping<T>;
```

**Pipeline Stages**:
```typescript
type PipelineStage = MatchStage | UnwindStage | SetStage | ProjectStage;

interface MatchStage { $match: Filter }
interface UnwindStage { $unwind: string | UnwindOptions }
interface SetStage { $addFields: Dict }
interface ProjectStage { $project: Record<string, 1 | 0 | DocumentPath | ProjectionOperator> }
```

### 📖 Example Usage

**Basic Array Unwinding**:
```typescript
const mapping: TableMapping = {
    source: 'accounts',
    pipeline: [
        { $match: { bundle: 'ENTERPRISE' } },
        { $unwind: '$members' },
        { $match: { 'members.role': { $in: ['admin', 'owner'] } } }
    ]
};
```

**With Projection**:
```typescript
const mapping = pipelineBuilder<IAccountMember>('accounts')
    .match({ bundle: 'ENTERPRISE' })
    .unwind('$members')
    .project({
        _id: { $concat: ['$_id', '_', '$members.id'] },
        accountId: '$_id',
        userId: '$members.id',
        role: '$members.role'
    })
    .build();
```

### 🧪 Testing Strategy (Phase 5)

**Unit Tests** (Priority):
1. `PipelineExecutorService`:
   - Each stage executor independently
   - Expression evaluator for all operators
   - Edge cases: null, undefined, empty arrays
2. `ChangeMakerV0` integration:
   - Pipeline vs legacy mapping detection
   - Change generation for each operation type

**Integration Tests**:
1. Real MongoDB change streams
2. Pipeline execution with sample data
3. Zero sync protocol compliance

**E2E Tests**:
1. Full change source → Zero client sync
2. Array updates propagating correctly
3. Performance with large arrays

### 🐛 Known Issues / Considerations

1. **Composite Keys**: Pipeline mappings that unwind need composite primary keys
   - Format: `{parentId}_{elementId}` or similar
   - Must be defined in table spec

2. **Performance**: Unwinding large arrays in-memory
   - May need streaming/batching for 1000+ elements
   - Consider pipeline stage limits

3. **Expression Coverage**: Current evaluator has 10 operators
   - MongoDB has 200+ operators
   - Add more as needed (extensible architecture)

4. **Change Ordering**: Multiple changes from single update
   - Must maintain causality
   - Transaction boundaries important

### 📚 Documentation Created

- `docs/projects/mongo-array-unwind-in-mapping/ISSUE.md` - Feature spec
- `docs/projects/mongo-array-unwind-in-mapping/IMPLEMENTATION_PLAN.md` - 7-phase plan
- `docs/projects/mongo-array-unwind-in-mapping/PHASE_1_2_COMPLETE.md` - Phases 1 & 2 summary
- `docs/projects/mongo-array-unwind-in-mapping/PHASE_3_IN_PROGRESS.md` - Phase 3 progress
- `docs/projects/mongo-array-unwind-in-mapping/PROJECT_STAGE_COMPLETE.md` - $project stage docs
- `docs/projects/mongo-array-unwind-in-mapping/examples/` - Usage examples

### 🚀 Commands to Continue

```bash
# Build packages
pn build

# Run tests (when written)
pn test

# Start dev server
pn dev

# Lint/format
pn lint
pn format
```

### 💡 Key Design Decisions Made

1. **Discriminated Union**: Prevents mixing legacy and pipeline approaches at compile-time
2. **Open-Closed Principle**: New pipeline stages can be added without modifying existing code
3. **Backward Compatibility**: All existing SimpleTableMapping configurations continue to work
4. **Expression Evaluator**: Simplified MongoDB expression language (extensible as needed)
5. **Type Safety**: Strong TypeScript typing throughout, with type guards for runtime checks

---

## Quick Start for Next Session

1. Open `libs/zero-source-mongodb/src/v0/change-maker-v0.ts`
2. Locate `makeInsertChanges()` method (line ~90)
3. Add pipeline detection and execution logic
4. Test with sample mapping
5. Move to `makeUpdateChanges()` for array diff handling

**Current Build Status**: ✅ All packages compile successfully
