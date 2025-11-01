# API Reference: Pipeline Table Mappings

## Overview

Pipeline table mappings enable unwinding MongoDB arrays into separate Zero table rows using aggregation pipeline stages. This API follows the Open-Closed Principle with discriminated unions for type safety and backward compatibility.

## Table of Contents

- [Type Definitions](#type-definitions)
- [Pipeline Stages](#pipeline-stages)
- [Helper Functions](#helper-functions)
- [Builder API](#builder-api)
- [Expression Operators](#expression-operators)
- [Type Guards](#type-guards)

---

## Type Definitions

### `TableMapping<T>`

Discriminated union of simple and pipeline-based table mappings.

```typescript
type TableMapping<T> = SimpleTableMapping<T> | PipelineTableMapping<T>;
```

**Usage**: Defines how to map a MongoDB collection to a Zero table.

**Type Safety**: Use `isPipelineMapping()` or `isSimpleMapping()` type guards for runtime checks.

---

### `SimpleTableMapping<T>`

Legacy table mapping with filter and projection (backward compatible).

```typescript
interface SimpleTableMapping<T> {
  source: string;
  filter?: Filter<T>;
  projection?: Record<keyof T, 1 | 0 | DocumentPath | ProjectionOperator>;
}
```

**Properties**:
- `source` (required): MongoDB collection name
- `filter` (optional): MongoDB query filter to select documents
- `projection` (optional): Field inclusion/exclusion and projection operators

**Example**:
```typescript
const mapping: SimpleTableMapping<User> = {
  source: 'users',
  filter: { role: 'admin' },
  projection: { name: 1, email: 1, _id: 0 }
};
```

---

### `PipelineTableMapping<T>`

Pipeline-based table mapping with aggregation stages.

```typescript
interface PipelineTableMapping<T> {
  source: string;
  pipeline: PipelineStage[];
  projection?: Record<keyof T, 1 | 0 | DocumentPath | ProjectionOperator>;
}
```

**Properties**:
- `source` (required): MongoDB collection name
- `pipeline` (required): Array of aggregation pipeline stages
- `projection` (optional): Final projection applied after pipeline execution

**Example**:
```typescript
const mapping: PipelineTableMapping<Member> = {
  source: 'accounts',
  pipeline: [
    { $match: { bundle: 'ENTERPRISE' } },
    { $unwind: '$members' }
  ],
  projection: {
    _id: { $concat: ['$_id', '_', '$members.id'] },
    accountId: '$_id',
    userId: '$members.id',
    role: '$members.role'
  }
};
```

---

## Pipeline Stages

### `MatchStage`

Filters documents using MongoDB query operators.

```typescript
interface MatchStage {
  $match: Filter<T>;
}
```

**Parameters**:
- `$match`: MongoDB query filter

**Supported Operators**: All MongoDB query operators (`$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`, etc.)

**Example**:
```typescript
{ $match: { status: 'active', age: { $gte: 18 } } }
```

**Use Cases**:
- Pre-filter documents before unwinding (performance optimization)
- Post-filter after unwinding (element-level filtering)
- Combine with nested field paths for complex filters

---

### `UnwindStage`

Deconstructs an array field, creating one document per array element.

```typescript
interface UnwindStage {
  $unwind: string | UnwindOptions;
}

interface UnwindOptions {
  path: string | number;
  includeArrayIndex?: string;
  preserveNullAndEmptyArrays?: boolean;
}
```

**Parameters**:

**String form**: `$unwind: '$arrayField'`
- Simple unwinding of array field

**Options form**: `$unwind: { path, includeArrayIndex?, preserveNullAndEmptyArrays? }`
- `path` (required): Field path to array (e.g., `'$members'`)
- `includeArrayIndex` (optional): Output field name for array index (0-based)
- `preserveNullAndEmptyArrays` (optional): Keep documents with null/empty arrays (default: false)

**Examples**:

Simple unwinding:
```typescript
{ $unwind: '$members' }
```

With array index:
```typescript
{ $unwind: { path: '$members', includeArrayIndex: 'memberIndex' } }
```

Preserve empty arrays:
```typescript
{ $unwind: { path: '$tags', preserveNullAndEmptyArrays: true } }
```

**Behavior**:
- Input: `{ _id: 1, items: ['a', 'b', 'c'] }`
- Output (3 documents):
  - `{ _id: 1, items: 'a' }`
  - `{ _id: 1, items: 'b' }`
  - `{ _id: 1, items: 'c' }`

**Known Limitation**: Nested array paths (e.g., `$data.members`) have a shallow copy bug. Use top-level arrays only. See [Known Issues](#known-issues).

---

### `SetStage` (AddFields)

Adds computed fields to documents using expressions.

```typescript
interface SetStage {
  $addFields: Record<string, any>;
}
```

**Alias**: `$set` (same behavior)

**Parameters**:
- `$addFields`: Object mapping field names to values or expressions

**Supported Expressions**: See [Expression Operators](#expression-operators)

**Examples**:

Literal values:
```typescript
{ $addFields: { status: 'active', priority: 1 } }
```

Field references:
```typescript
{ $addFields: { accountId: '$_id', userId: '$members.id' } }
```

String concatenation:
```typescript
{
  $addFields: {
    compositeId: { $concat: ['$_id', '_', '$members.id'] }
  }
}
```

Conditional logic:
```typescript
{
  $addFields: {
    isAdmin: { $cond: [{ $eq: ['$role', 'admin'] }, true, false] }
  }
}
```

Arithmetic:
```typescript
{
  $addFields: {
    total: { $add: ['$subtotal', '$tax', '$shipping'] }
  }
}
```

---

### `ProjectStage`

Reshapes documents by including, excluding, or computing fields.

```typescript
interface ProjectStage {
  $project: Record<string, 1 | 0 | DocumentPath | ProjectionOperator>;
}
```

**Parameters**:
- `$project`: Object mapping field names to:
  - `1`: Include field
  - `0`: Exclude field
  - String (e.g., `'$fieldName'`): Field reference (via `$addFields` first)
  - Object: Projection operator (e.g., `{ $concat: [...] }`)

**Rules**:
- Cannot mix inclusion (1) and exclusion (0) except for `_id`
- Field references require two-stage approach: `$addFields` then `$project`

**Examples**:

Inclusion projection:
```typescript
{ $project: { name: 1, email: 1, role: 1 } }
```

Exclusion projection:
```typescript
{ $project: { password: 0, internalNotes: 0 } }
```

Include with exclusion of `_id`:
```typescript
{ $project: { _id: 0, name: 1, email: 1 } }
```

Computed fields via projection operators:
```typescript
{
  $project: {
    fullName: { $concat: ['$firstName', ' ', '$lastName'] },
    age: { $subtract: [2024, '$birthYear'] }
  }
}
```

**Field Renaming** (two-stage approach):
```typescript
[
  { $addFields: { fullName: '$name' } },
  { $project: { fullName: 1, email: 1, _id: 0 } }
]
```

**Why not direct field references?**: The projection utility only handles inclusion, exclusion, and projection operators. Use `$addFields` for field references.

---

## Helper Functions

### `match(filter)`

Creates a `$match` stage.

```typescript
function match<T>(filter: Filter<T>): MatchStage;
```

**Parameters**:
- `filter`: MongoDB query filter object

**Returns**: `MatchStage`

**Example**:
```typescript
import { match } from '@cbnsndwch/zero-contracts';

const stage = match({ status: 'active', age: { $gte: 18 } });
// Result: { $match: { status: 'active', age: { $gte: 18 } } }
```

---

### `unwind(path, options?)`

Creates an `$unwind` stage.

```typescript
function unwind(
  path: string,
  options?: { includeArrayIndex?: string; preserveNullAndEmptyArrays?: boolean }
): UnwindStage;
```

**Parameters**:
- `path`: Array field path (e.g., `'$members'`)
- `options` (optional):
  - `includeArrayIndex`: Output field name for array index
  - `preserveNullAndEmptyArrays`: Keep documents with null/empty arrays

**Returns**: `UnwindStage`

**Examples**:
```typescript
import { unwind } from '@cbnsndwch/zero-contracts';

// Simple
unwind('$members');

// With index
unwind('$members', { includeArrayIndex: 'memberIndex' });

// Preserve empty
unwind('$tags', { preserveNullAndEmptyArrays: true });
```

---

### `addFields(fields)`

Creates an `$addFields` stage.

```typescript
function addFields(fields: Record<string, any>): SetStage;
```

**Parameters**:
- `fields`: Object mapping field names to values or expressions

**Returns**: `SetStage`

**Example**:
```typescript
import { addFields } from '@cbnsndwch/zero-contracts';

const stage = addFields({
  accountId: '$_id',
  compositeId: { $concat: ['$_id', '_', '$members.id'] },
  isActive: true
});
```

---

### `project(spec)`

Creates a `$project` stage.

```typescript
function project(spec: Record<string, 1 | 0 | DocumentPath | ProjectionOperator>): ProjectStage;
```

**Parameters**:
- `spec`: Projection specification

**Returns**: `ProjectStage`

**Example**:
```typescript
import { project } from '@cbnsndwch/zero-contracts';

// Inclusion
project({ name: 1, email: 1, role: 1 });

// Exclusion
project({ password: 0, internalData: 0 });

// Computed fields
project({
  fullName: { $concat: ['$firstName', ' ', '$lastName'] }
});
```

---

### `toPipelineMapping(simple)`

Converts a `SimpleTableMapping` to `PipelineTableMapping`.

```typescript
function toPipelineMapping<T>(simple: SimpleTableMapping<T>): PipelineTableMapping<T>;
```

**Parameters**:
- `simple`: Legacy simple table mapping

**Returns**: Equivalent `PipelineTableMapping`

**Conversion Logic**:
1. If `filter` exists → `$match` stage
2. If `projection` exists → Final projection (not a stage)

**Example**:
```typescript
import { toPipelineMapping } from '@cbnsndwch/zero-contracts';

const simple: SimpleTableMapping<User> = {
  source: 'users',
  filter: { role: 'admin' },
  projection: { name: 1, email: 1 }
};

const pipeline = toPipelineMapping(simple);
// Result: {
//   source: 'users',
//   pipeline: [{ $match: { role: 'admin' } }],
//   projection: { name: 1, email: 1 }
// }
```

---

## Builder API

### `PipelineMappingBuilder<T>`

Fluent API for constructing pipeline mappings with method chaining.

```typescript
class PipelineMappingBuilder<T> {
  match(filter: Filter<T>): this;
  unwind(path: string, options?: UnwindOptions): this;
  addFields(fields: Record<string, any>): this;
  project(spec: Record<string, 1 | 0 | any>): this;
  build(): PipelineTableMapping<T>;
}
```

**Factory Function**:
```typescript
function pipelineBuilder<T>(source: string): PipelineMappingBuilder<T>;
```

**Methods**:

#### `match(filter)`
Adds a `$match` stage. Returns `this` for chaining.

#### `unwind(path, options?)`
Adds an `$unwind` stage. Returns `this` for chaining.

#### `addFields(fields)`
Adds an `$addFields` stage. Returns `this` for chaining.

#### `project(spec)`
Adds a `$project` stage. Returns `this` for chaining.

#### `build()`
Returns the final `PipelineTableMapping<T>`.

**Example**:
```typescript
import { pipelineBuilder } from '@cbnsndwch/zero-contracts';

const mapping = pipelineBuilder<Member>('accounts')
  .match({ bundle: 'ENTERPRISE' })
  .unwind('$members', { includeArrayIndex: 'memberIndex' })
  .addFields({
    accountId: '$_id',
    memberId: '$members.id',
    role: '$members.role'
  })
  .project({
    _id: { $concat: ['$accountId', '_', '$memberId'] },
    accountId: 1,
    memberId: 1,
    role: 1
  })
  .build();
```

**Benefits**:
- Type-safe (generic `<T>`)
- Readable and chainable
- Prevents common mistakes (e.g., forgetting `source`)

---

## Expression Operators

The expression evaluator supports the following MongoDB operators:

### String Operators

#### `$concat`
Concatenates strings.

```typescript
{ $concat: ['Hello', ' ', 'World'] }
// Result: "Hello World"

{ $concat: ['$firstName', ' ', '$lastName'] }
// With doc: { firstName: 'John', lastName: 'Doe' }
// Result: "John Doe"
```

---

### Comparison Operators

#### `$eq` (equal)
```typescript
{ $eq: ['$status', 'active'] }  // true if status === 'active'
```

#### `$ne` (not equal)
```typescript
{ $ne: ['$role', 'guest'] }  // true if role !== 'guest'
```

#### `$gt` (greater than)
```typescript
{ $gt: ['$age', 18] }  // true if age > 18
```

#### `$gte` (greater than or equal)
```typescript
{ $gte: ['$score', 90] }  // true if score >= 90
```

#### `$lt` (less than)
```typescript
{ $lt: ['$price', 100] }  // true if price < 100
```

#### `$lte` (less than or equal)
```typescript
{ $lte: ['$quantity', 10] }  // true if quantity <= 10
```

---

### Arithmetic Operators

#### `$add`
```typescript
{ $add: ['$subtotal', '$tax', '$shipping'] }
// Result: sum of all values
```

#### `$subtract`
```typescript
{ $subtract: ['$total', '$discount'] }
// Result: total - discount
```

#### `$multiply`
```typescript
{ $multiply: ['$price', '$quantity'] }
// Result: price * quantity
```

#### `$divide`
```typescript
{ $divide: ['$total', '$itemCount'] }
// Result: total / itemCount
```

---

### Conditional Operators

#### `$cond`
Ternary conditional expression.

```typescript
{
  $cond: [
    condition,  // if this is true
    trueValue,  // return this
    falseValue  // else return this
  ]
}
```

**Example**:
```typescript
{
  $addFields: {
    discount: {
      $cond: [
        { $gte: ['$total', 100] },
        10,  // 10% discount if total >= 100
        0    // no discount otherwise
      ]
    }
  }
}
```

**Nested conditions**:
```typescript
{
  $cond: [
    { $eq: ['$tier', 'premium'] },
    20,
    {
      $cond: [
        { $eq: ['$tier', 'standard'] },
        10,
        0
      ]
    }
  ]
}
```

---

### Special Operators

#### `$hexToBase64Url`
Converts MongoDB ObjectId hex string to base64url encoding.

```typescript
{ $hexToBase64Url: '$_id' }
// Input: "507f1f77bcf86cd799439011"
// Output: "UH8fd7z4bNeZQ5AR"
```

**Use Case**: Generate URL-safe IDs for Zero tables.

---

## Type Guards

### `isPipelineMapping(mapping)`

Type guard to check if a mapping is a `PipelineTableMapping`.

```typescript
function isPipelineMapping<T>(mapping: TableMapping<T>): mapping is PipelineTableMapping<T>;
```

**Parameters**:
- `mapping`: Table mapping to check

**Returns**: `true` if mapping has a `pipeline` property

**Example**:
```typescript
import { isPipelineMapping } from '@cbnsndwch/zero-contracts';

if (isPipelineMapping(mapping)) {
  // TypeScript knows mapping.pipeline exists
  const stages = mapping.pipeline;
  console.log(`Pipeline has ${stages.length} stages`);
} else {
  // TypeScript knows mapping.filter and mapping.projection exist
  const filter = mapping.filter;
}
```

---

### `isSimpleMapping(mapping)`

Type guard to check if a mapping is a `SimpleTableMapping`.

```typescript
function isSimpleMapping<T>(mapping: TableMapping<T>): mapping is SimpleTableMapping<T>;
```

**Parameters**:
- `mapping`: Table mapping to check

**Returns**: `true` if mapping has NO `pipeline` property

**Example**:
```typescript
import { isSimpleMapping } from '@cbnsndwch/zero-contracts';

if (isSimpleMapping(mapping)) {
  // Legacy path
  const filter = mapping.filter;
  const projection = mapping.projection;
}
```

---

## Known Issues

### 1. Nested Unwind Shallow Copy Bug

**Issue**: Unwinding nested array paths (e.g., `$data.members`) causes shared object references due to shallow copy.

**Impact**: All unwound documents share the same nested object reference, causing last-write-wins behavior.

**Status**: Known bug, fix planned for Phase 7.

**Workaround**: Use only top-level array paths:
```typescript
// ❌ Don't use nested paths
{ $unwind: '$data.members' }

// ✅ Use top-level paths
{ $unwind: '$members' }
```

---

### 2. Projection Field References

**Issue**: The `$project` stage doesn't support field references like `name: '$firstName'` directly.

**Reason**: The `applyProjection` utility only handles inclusion (1), exclusion (0), and projection operators.

**Workaround**: Use `$addFields` before `$project`:
```typescript
// ❌ Doesn't work
[{ $project: { name: '$firstName' } }]

// ✅ Works
[
  { $addFields: { name: '$firstName' } },
  { $project: { name: 1 } }
]
```

---

## TypeScript Usage

### With Type Parameters

```typescript
import type { PipelineTableMapping } from '@cbnsndwch/zero-contracts';

interface Member {
  _id: string;
  accountId: string;
  userId: string;
  role: string;
}

const mapping: PipelineTableMapping<Member> = {
  source: 'accounts',
  pipeline: [
    { $unwind: '$members' }
  ],
  projection: {
    _id: { $concat: ['$_id', '_', '$members.id'] },
    accountId: '$_id',
    userId: '$members.id',
    role: '$members.role'
  }
};
```

### With Builder

```typescript
import { pipelineBuilder } from '@cbnsndwch/zero-contracts';

const mapping = pipelineBuilder<Member>('accounts')
  .unwind('$members')
  .addFields({ accountId: '$_id', userId: '$members.id' })
  .build();
```

---

## Performance Considerations

See [Performance Guide](./PERFORMANCE_GUIDE.md) for:
- Identity field selection best practices
- Pipeline stage ordering optimization
- Array size considerations
- Known limitations and workarounds

---

## Examples

See [Usage Guide](./USAGE_GUIDE.md) for comprehensive real-world examples:
- Basic array unwinding
- Multi-stage pipelines
- Discriminated unions for polymorphic collections
- Complex RBAC scenarios

---

## Migration

See [Migration Guide](./MIGRATION_GUIDE.md) for:
- When to use pipeline vs simple mappings
- Step-by-step migration process
- Testing migration changes
