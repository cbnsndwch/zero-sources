# Phase 4: Array Diff Implementation

## Objective

Optimize the `makeUpdateChanges()` method in `ChangeMakerV0` to use array diffing instead of the naive DELETE all + INSERT all approach.

## Current State

✅ **Phase 3 Complete**: All CRUD operations handle pipeline mappings
- INSERT: Executes pipeline, emits changes per result row
- UPDATE: **Uses naive approach** - DELETE all old rows + INSERT all new rows
- REPLACE: Executes pipeline, generates changes
- DELETE: Executes pipeline, handles deletion

❌ **Phase 4 Needed**: Optimize UPDATE with array diffing

## Implementation Plan

### 1. Create Array Diff Service

**File**: `libs/zero-source-mongodb/src/v0/array-diff.service.ts` (NEW)

**Features**:
- `computeArrayDiff(oldArray, newArray, options)` function
- Support **identity field matching** (Option B - recommended)
  - Use a designated field (like `_id`, `memberId`, etc.) for element matching
  - More stable than index-based when arrays reorder
- Support **index-based fallback** (Option A)
  - Compare by position when no identity field available
- Return diff with:
  - `added`: Elements to INSERT
  - `removed`: Elements to DELETE
  - `modified`: Elements to UPDATE

**Interface**:
```typescript
export interface ArrayDiffOptions {
  identityField?: string;     // Field to use for element matching (e.g., '_id')
  fallbackToIndex?: boolean;  // Use index-based if identity match fails
}

export interface ArrayDiff {
  added: Array<{ index: number; value: any }>;
  removed: Array<{ index: number; value: any }>;
  modified: Array<{ index: number; oldValue: any; newValue: any }>;
}

@Injectable()
export class ArrayDiffService {
  computeDiff(
    oldArray: any[] | undefined,
    newArray: any[] | undefined,
    options?: ArrayDiffOptions
  ): ArrayDiff {
    // Implementation here
  }
}
```

### 2. Update ChangeMakerV0

**File**: `libs/zero-source-mongodb/src/v0/change-maker-v0.ts`

**Changes to `makeUpdateChanges()`**:

1. Inject `ArrayDiffService` in constructor
2. When handling pipeline mappings:
   - Execute pipeline on `updateDescription.updatedFields`
   - Execute pipeline on old document (from `fullDocumentBeforeChange`)
   - Call `arrayDiffService.computeDiff(oldResults, newResults, { identityField: mapping.identityField })`
   - Generate changes based on diff:
     - For each `added` element → emit `INSERT` change
     - For each `removed` element → emit `DELETE` change
     - For each `modified` element → emit `UPDATE` change

**Identity Field Configuration**:

The identity field should be configurable per mapping:
- For `account.members` unwinding: Use `memberId` as identity
- For `project.stages` unwinding: Use `stageId` as identity
- If no identity field: Fall back to index-based comparison

### 3. Register Service

**File**: `libs/zero-source-mongodb/src/v0/index.ts`

- Export `ArrayDiffService`
- Add to `v0ChangeSourceServices` array

## Design Decisions

### Why Identity-Based Matching?

**Problem**: Array elements can be reordered without semantic changes
```typescript
// Before
members: [
  { memberId: 'u1', role: 'admin' },
  { memberId: 'u2', role: 'member' }
]

// After (reordered, but no semantic change)
members: [
  { memberId: 'u2', role: 'member' },
  { memberId: 'u1', role: 'admin' }
]
```

**Index-based** would see:
- Position 0: Changed from `u1/admin` to `u2/member` (UPDATE)
- Position 1: Changed from `u2/member` to `u1/admin` (UPDATE)

**Identity-based** would see:
- No changes (both elements still present with same data)

### Deep Equality Check

For the `modified` detection, use deep equality comparison:
```typescript
private deepEqual(a: any, b: any): boolean {
  // Consider using fast-deep-equal library
  return JSON.stringify(a) === JSON.stringify(b);
}
```

### Edge Cases to Handle

1. **Empty arrays**: `oldArray: []` or `newArray: []`
2. **Null/undefined**: `oldArray: undefined` or `newArray: null`
3. **Missing identity field**: Element doesn't have the identity field
4. **Duplicate identity values**: Multiple elements with same identity (error/warning?)

## Success Criteria

1. ✅ `ArrayDiffService` created with unit tests
2. ✅ `makeUpdateChanges()` uses array diffing for pipeline mappings
3. ✅ Identity-based matching works correctly
4. ✅ Index-based fallback works when needed
5. ✅ Build passes with no errors
6. ✅ Generates minimal change events (only actual changes)

## Testing Strategy

### Unit Tests
- Test `ArrayDiffService.computeDiff()` with various scenarios:
  - Added elements
  - Removed elements
  - Modified elements
  - Reordered elements (identity-based should detect no changes)
  - Mixed operations
  - Edge cases (empty, null, missing identity)

### Integration Tests
- Test with real MongoDB change events
- Verify correct change events generated for array updates

## Next Steps After Phase 4

Once array diffing is complete:
- **Phase 5**: Comprehensive testing
- **Phase 6**: Documentation updates
- **Phase 7**: Performance optimization

## Notes

- The current naive approach (DELETE all + INSERT all) is **correct** but inefficient
- Array diffing will significantly reduce change event volume for large arrays
- This optimization is especially important for frequently-updated arrays like `members`, `stages`, etc.
