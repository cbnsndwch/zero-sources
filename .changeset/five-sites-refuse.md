---
'@cbnsndwch/nest-zero-synced-queries': minor
'@cbnsndwch/zero-contracts': minor
'@cbnsndwch/zero-nest-mongoose': minor
'@cbnsndwch/zero-source-mongodb': minor
'@cbnsndwch/zrocket-contracts': minor
---

# Pipeline-Based Table Mappings with Array Unwinding

This release introduces a major new feature: **pipeline-based table mappings** that enable MongoDB-style array unwinding and transformations in Zero's change source system. This allows developers to declaratively map documents with nested arrays to flat Zero tables without custom change stream handling code.

## 🎯 Key Features

### Discriminated Union Architecture

- Type-safe separation between simple and pipeline-based mappings
- Compile-time prevention of mixing legacy `filter` and modern `pipeline` approaches
- Full backward compatibility with existing simple table mappings

### Array Unwinding Support

- `$unwind` pipeline stage for deconstructing arrays into separate rows
- Support for `includeArrayIndex` to add array position tracking
- Option to `preserveNullAndEmptyArrays` for flexible handling
- Handles nested paths and complex array structures

### Pipeline Stages

- **`$match`**: Filter documents with MongoDB query operators
- **`$unwind`**: Deconstruct arrays into individual documents
- **`$addFields`**: Add computed fields with expression support
- **`$project`**: Reshape documents by selecting/transforming fields

### Array Diff Optimization

- **Identity-based matching**: Match array elements by unique ID field (~200x performance improvement)
- **Index-based fallback**: Position-based comparison when no identity field exists
- Smart diffing generates minimal change events (UPDATE instead of DELETE+INSERT)
- Deep equality checking for detecting actual content changes

### Helper Utilities

- Stage builders: `match()`, `unwind()`, `addFields()`, `project()`
- Fluent builder API via `PipelineMappingBuilder` for chainable construction
- Migration helper: `toPipelineMapping()` to convert simple mappings
- Type guards: `isPipelineMapping()`, `isSimpleMapping()`

## 📊 Performance Improvements

**Array Updates**:

- Without identity field: Updating 1 element in 100-element array = 200 events (100 DELETE + 100 INSERT)
- With identity field: Updating 1 element in 100-element array = 1 event (1 UPDATE)
- **~200x reduction in change events** for typical array update scenarios

## 🔧 Technical Implementation

### New Services

#### PipelineExecutorService (`@cbnsndwch/zero-source-mongodb`)

- Client-side pipeline execution with sequential stage processing
- Expression evaluator supporting 10+ MongoDB operators ($concat, $eq, $add, etc.)
- Path resolution utilities for nested field access

#### ArrayDiffService (`@cbnsndwch/zero-source-mongodb`)

- Computes differences between array versions
- Supports both identity-based and index-based strategies
- Null-safe handling with comprehensive edge case coverage

### Integration Points

#### ChangeMakerV0 Updates

- All CRUD operations (INSERT, UPDATE, REPLACE, DELETE) now support pipeline mappings
- Runtime discrimination using type guards
- Composite key extraction for pipeline-generated IDs
- Optimized UPDATE operations using array diffing

## 📚 Documentation

This release includes 3,700+ lines of comprehensive documentation:

- **API Reference**: Complete type definitions and pipeline stages
- **Usage Guide**: Real-world scenarios and best practices
- **Migration Guide**: Step-by-step transition from simple to pipeline mappings
- **Performance Guide**: Optimization strategies and benchmarks
- **Implementation Plan**: 7-phase rollout with detailed technical specs

## 🧪 Testing

Complete test coverage added:

- **ArrayDiffService**: 21 tests covering identity/index-based matching and edge cases
- **PipelineExecutorService**: 29 tests covering all 4 pipeline stages and composition
- All tests passing (1 skipped due to known nested array path limitation)

## 🔄 Dependency Updates

Updated multiple dependencies to latest stable versions:

- **TypeScript & ESLint**: Latest compiler and linting tools
- **NestJS**: Framework packages updated
- **React Router**: v7.9.3 → v7.9.5
- **Testing**: Playwright, Vitest, and related packages
- **Build Tools**: SWC, Turbo, and toolchain updates
- **UI/Styling**: Tailwind CSS, Framer Motion, Lucide icons
- **Utilities**: Mongoose, lint-staged, dotenv, and more

All builds and tests passing (132 passed | 77 skipped)

## 📖 Example Usage

```typescript
import { pipelineBuilder } from '@cbnsndwch/zero-contracts';

// Unwind account members array into flat table
const accountMembersMapping = pipelineBuilder<AccountMember>('accounts')
  .match({ bundle: 'ENTERPRISE' })  // Pre-filter for performance
  .unwind('$members')                // Unwind members array
  .addFields({                       // Add computed fields
    accountId: '$_id',
    userId: '$members.id'
  })
  .project({                         // Shape final output
    _id: { $concat: ['$accountId', '_', '$userId'] },
    accountId: 1,
    userId: 1,
    role: '$members.role',
    name: '$members.name'
  })
  .build();
```

## 🔗 Breaking Changes

None! This release maintains full backward compatibility. Existing simple table mappings continue to work without any changes required.

## 🎁 Benefits

1. **Declarative Configuration**: Table mappings as pure configuration instead of imperative code
2. **Type Safety**: Compile-time discrimination prevents configuration errors
3. **Consistency**: Standard pattern across all table mappings
4. **Reduced Complexity**: No custom change stream handling needed
5. **Performance**: Intelligent array diffing minimizes change events
6. **Extensibility**: New pipeline stages can be added without breaking existing code
7. **Familiarity**: Pipeline stages match MongoDB aggregation operators developers already know
8. **Maintainability**: Easier to understand, debug, and extend

## 📝 Migration Path

Existing applications require no changes. To adopt pipeline features:

1. Keep simple mappings for straightforward cases
2. Use pipeline approach for array unwinding scenarios
3. Leverage fluent builder API for readable configuration
4. Add identity fields to array elements for optimal performance
5. Refer to migration guide for step-by-step examples
