# Phase 1 & 2 Complete: Type System and Helper Utilities ✅

## Summary

We've successfully completed the first two phases of implementing pipeline-based table mappings with array unwinding support for the `@cbnsndwch/zero-source-mongodb` package.

## What Was Accomplished

### 1. Updated Type System (Phase 1) ✅

**File**: `libs/zero-contracts/src/upstream/table-mapping.contract.ts`

#### Key Changes:

- **Discriminated Union Architecture**: Replaced single `TableMapping` interface with a type-safe discriminated union
- **Backward Compatibility**: Existing `LegacyTableMapping` approach fully preserved
- **Pipeline Support**: New `PipelineTableMapping` with composable stages
- **Extensible Design**: Open-Closed Principle - easy to add new pipeline stages without breaking changes

#### New Types Added:

```typescript
// Main discriminated union
type TableMapping<TTable> = 
  | LegacyTableMapping<TTable>
  | PipelineTableMapping<TTable>;

// Pipeline-specific types
interface PipelineTableMapping<TTable> {
  source: string;
  pipeline: PipelineStage[];
  projection?: Record<keyof TTable, 1 | 0 | DocumentPath | ProjectionOperator>;
}

type PipelineStage = MatchStage | UnwindStage | AddFieldsStage;

interface MatchStage {
  $match: Filter<any>;
}

interface UnwindStage {
  $unwind: string | UnwindOptions;
}

interface UnwindOptions {
  path: string;
  preserveNullAndEmptyArrays?: boolean;
  includeArrayIndex?: string;
}

interface AddFieldsStage {
  $addFields: Record<string, any>;
}
```

### 2. Helper Utilities (Phase 2) ✅

**File**: `libs/zero-contracts/src/upstream/table-mapping.helpers.ts`

#### Utilities Added:

1. **Type Guards**:
   - `isPipelineMapping()` - Check if mapping uses pipeline approach
   - `isLegacyMapping()` - Check if mapping uses legacy approach

2. **Stage Builders**:
   - `match(filter)` - Create $match stage
   - `unwind(path | options)` - Create $unwind stage with overloads
   - `addFields(fields)` - Create $addFields stage

3. **Migration Helper**:
   - `toPipelineMapping(legacyMapping)` - Convert legacy to pipeline

4. **Fluent Builder**:
   - `PipelineMappingBuilder` class with chainable API
   - `pipelineBuilder(source)` - Factory function

## Usage Examples

### Type Safety in Action

```typescript
// ✅ Valid: Legacy approach
const legacy: TableMapping = {
  source: 'accounts',
  filter: { bundle: 'ENTERPRISE' },
  projection: { _id: 1, name: 1 }
};

// ✅ Valid: Pipeline approach
const pipeline: TableMapping = {
  source: 'accounts',
  pipeline: [{ $match: { bundle: 'ENTERPRISE' } }],
  projection: { _id: 1, name: 1 }
};

// ❌ TypeScript Error: Can't mix approaches
const invalid: TableMapping = {
  source: 'accounts',
  filter: { bundle: 'ENTERPRISE' },    // ERROR!
  pipeline: [{ $unwind: '$members' }], // Can't use both
  projection: { _id: 1, name: 1 }
};
```

### Using Helper Functions

```typescript
import { match, unwind, addFields, pipelineBuilder } from '@cbnsndwch/zero-contracts';

// Simple approach
const mapping: TableMapping = {
  source: 'accounts',
  pipeline: [
    match({ bundle: 'ENTERPRISE' }),
    unwind('$members'),
    match({ 'members.role': { $in: ['admin', 'owner'] } })
  ],
  projection: {
    _id: { $concat: ['$_id', '_', '$members.id'] },
    accountId: '$_id',
    userId: '$members.id'
  }
};

// Fluent builder approach
const mapping2 = pipelineBuilder<IAccountMember>('accounts')
  .match({ bundle: 'ENTERPRISE' })
  .unwind('$members')
  .match({ 'members.role': { $in: ['admin', 'owner'] } })
  .addFields({
    isOwner: { $eq: ['$members.role', 'owner'] }
  })
  .projection({
    _id: { $concat: ['$_id', '_', '$members.id'] },
    accountId: '$_id',
    userId: '$members.id',
    isOwner: 1
  })
  .build();
```

### Using Type Guards

```typescript
function processMappingConfig(mapping: TableMapping) {
  if (isPipelineMapping(mapping)) {
    // TypeScript knows this is PipelineTableMapping
    console.log(`Pipeline with ${mapping.pipeline.length} stages`);
    
    for (const stage of mapping.pipeline) {
      if ('$match' in stage) {
        console.log('Match filter:', stage.$match);
      }
      if ('$unwind' in stage) {
        console.log('Unwind path:', 
          typeof stage.$unwind === 'string' 
            ? stage.$unwind 
            : stage.$unwind.path
        );
      }
    }
  } else {
    // TypeScript knows this is LegacyTableMapping
    console.log('Legacy filter:', mapping.filter);
  }
}
```

### Migrating from Legacy to Pipeline

```typescript
// Existing legacy mapping
const legacyMapping: LegacyTableMapping = {
  source: 'accounts',
  filter: { bundle: 'ENTERPRISE' },
  projection: { _id: 1, name: 1, bundle: 1 }
};

// Convert to pipeline (preserves filter as $match stage)
const pipelineMapping = toPipelineMapping(legacyMapping);
// Result: {
//   source: 'accounts',
//   pipeline: [{ $match: { bundle: 'ENTERPRISE' } }],
//   projection: { _id: 1, name: 1, bundle: 1 }
// }

// Now you can add array unwinding
pipelineMapping.pipeline.push(unwind('$members'));
```

## Benefits Achieved

### 1. **Type Safety** ✅
- Compile-time prevention of invalid configurations
- TypeScript ensures proper usage of pipeline vs legacy approach
- Autocomplete and IntelliSense support for all stages

### 2. **Backward Compatibility** ✅
- Zero breaking changes for existing code
- Legacy mappings work exactly as before
- Optional migration path provided

### 3. **Extensibility** ✅
- Easy to add new pipeline stages (just extend `PipelineStage` union)
- No modification of existing code required (Open-Closed Principle)
- Future stages like `$lookup`, `$group`, `$sort` will integrate seamlessly

### 4. **Developer Experience** ✅
- Fluent builder API for complex pipelines
- Helper functions reduce boilerplate
- Clear, self-documenting code

### 5. **Documentation** ✅
- Comprehensive JSDoc comments with examples
- Real-world use cases demonstrated
- Clear migration guidance

## Files Modified

1. **`libs/zero-contracts/src/upstream/table-mapping.contract.ts`**
   - Added discriminated union types
   - Added pipeline stage interfaces
   - Added comprehensive documentation

2. **`libs/zero-contracts/src/upstream/table-mapping.helpers.ts`**
   - Added type guard functions
   - Added stage builder functions
   - Added migration helper
   - Added fluent builder class

3. **`docs/projects/mongo-array-unwind-in-mapping/ISSUE.md`**
   - Updated with pipeline-based API design
   - Added usage examples
   - Added design rationale

4. **`docs/projects/mongo-array-unwind-in-mapping/IMPLEMENTATION_PLAN.md`** (NEW)
   - Complete implementation roadmap
   - Phase-by-phase breakdown
   - Code examples and patterns

## Next Steps (Phase 3)

Now that the type system and helpers are complete, we're ready to implement the runtime functionality:

1. **Update Table Mapping Service**
   - Add pipeline detection logic
   - Track which mappings use pipeline approach

2. **Create Pipeline Executor Service**
   - Implement pipeline stage execution
   - Handle $match filtering
   - Handle $unwind array deconstruction
   - Handle $addFields computed fields

3. **Integrate with Change Stream Handler**
   - Detect pipeline mappings in change events
   - Execute pipeline on change documents
   - Generate multiple change events for unwound arrays

4. **Handle Array Diffs**
   - Track array modifications
   - Generate insert/delete/update events for array elements
   - Maintain consistency between parent and child records

See `IMPLEMENTATION_PLAN.md` for detailed Phase 3 specifications.

## Testing Checklist

- ✅ Type system compiles without errors
- ✅ Discriminated union prevents invalid configurations
- ✅ Helper functions have correct type signatures
- ✅ Backward compatibility maintained
- ⏳ Unit tests for helpers (Phase 5)
- ⏳ Integration tests (Phase 5)
- ⏳ E2E tests with real MongoDB (Phase 5)

## References

- Original Issue: `docs/projects/mongo-array-unwind-in-mapping/ISSUE.md`
- Implementation Plan: `docs/projects/mongo-array-unwind-in-mapping/IMPLEMENTATION_PLAN.md`
- MongoDB $unwind: https://www.mongodb.com/docs/manual/reference/operator/aggregation/unwind/
- Open-Closed Principle: https://en.wikipedia.org/wiki/Open%E2%80%93closed_principle
