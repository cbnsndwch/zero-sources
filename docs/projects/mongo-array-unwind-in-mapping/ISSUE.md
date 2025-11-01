# Feature Request: Array Unwinding Support for Table Mappings

## Use Case

We need to normalize MongoDB documents with nested arrays into separate Zero tables to enable efficient permission queries and relationship management. This is essential for implementing role-based access control (RBAC) systems where user permissions are stored in arrays within documents.

### Real-World Example: Account Members Management

In our accounts system, each account document contains:
- Basic account information (name, bundle, settings)
- An `owner` object with the primary account holder's details
- A `members` array containing all users who have access to the account

```typescript
// MongoDB Document Structure
{
  _id: ObjectId("6639ce8aa4b95ab814d1d5d9"),
  name: "Acme Corporation",
  bundle: "ENTERPRISE",
  owner: {
    id: "user_abc123",
    name: "John Doe",
    email: "john@acme.com",
    role: "owner"
  },
  members: [
    {
      id: "user_def456",
      name: "Jane Smith",
      email: "jane@acme.com",
      role: "admin"
    },
    {
      id: "user_ghi789",
      name: "Bob Johnson",
      email: "bob@acme.com",
      role: "member"
    }
  ]
}
```

### Why We Need Separate Tables

**Zero's Limitation**: Zero doesn't support querying into nested JSON objects or arrays. You cannot write queries like:

```typescript
// ❌ This doesn't work in Zero
const hasAccess = await zero.query.accounts
  .where('members', (members) => members.some(m => m.id === currentUserId))
  .one();
```

**Required Solution**: We need to normalize the data into separate tables with foreign key relationships:

```
accounts (table)
├── account_owners (table, one-to-one relationship)
└── account_members (table, many-to-one relationship)
```

This enables efficient permission queries:

```typescript
// ✅ This works with normalized tables
const hasAccess = await zero.query.account_members
  .where('accountId', accountId)
  .where('userId', currentUserId)
  .one();

const isOwner = await zero.query.account_owners
  .where('accountId', accountId)
  .where('userId', currentUserId)
  .one();
```

## The Problem

The `@cbnsndwch/zero-source-mongodb` package currently supports:

✅ **Nested Object Projection** (works great):
```typescript
// Projecting nested owner object to separate table
export const accountOwnersMapping: TableMapping = {
  source: 'accounts',
  projection: {
    _id: { $concat: ['$_id', '_owner'] },
    id: { $concat: [{ $hexToBase64Url: '$_id' }, '_owner'] },
    accountId: '$_id',
    userId: '$owner.id',
    name: '$owner.name',
    email: '$owner.email'
  }
};
```

❌ **Array Unwinding** (not supported):
```typescript
// This is what we need but isn't supported
export const accountMembersMapping: TableMapping = {
  source: 'accounts',
  unwind: '$members',  // ⚠️ Not supported in current TableMapping type
  projection: {
    _id: { $concat: ['$_id', '_', '$members.id'] },
    id: { $concat: [{ $hexToBase64Url: '$_id' }, '_', '$members.id'] },
    accountId: '$_id',
    userId: '$members.id',
    name: '$members.name',
    email: '$members.email',
    role: '$members.role'
  }
};
```

### Current Workaround Requirements

Without built-in array unwinding support, we must implement custom logic in our change streamer:

1. **Intercept change events** for the source collection
2. **Manually iterate** through the array for each document
3. **Create separate change events** for each array element
4. **Handle array diffs** on UPDATE events (detect added/removed/modified elements)
5. **Maintain consistency** between parent document and child records

This adds significant complexity and is error-prone compared to declarative mapping configuration.

## Proposed Solution

Add native array unwinding support through a **pipeline-based architecture** that follows the Open-Closed Principle. This approach:

- Maintains backward compatibility with existing `filter`-based configurations
- Enables composable transformation stages similar to MongoDB's aggregation pipeline
- Provides a clear, ordered execution model
- Opens the door for future aggregation operations without API changes

### Proposed API (Discriminated Union)

```typescript
/**
 * Table mapping with mutually exclusive configuration approaches.
 * Use EITHER legacy filter OR modern pipeline, but not both.
 */
type TableMapping<TTable = Dict> = 
  | LegacyTableMapping<TTable>
  | PipelineTableMapping<TTable>;

/**
 * Legacy mapping configuration (backward compatible)
 */
interface LegacyTableMapping<TTable = Dict> {
  source: string;
  filter?: Filter<TTable>;
  projection?: Record<keyof TTable, 1 | 0 | DocumentPath | ProjectionOperator>;
}

/**
 * Modern pipeline-based mapping configuration
 */
interface PipelineTableMapping<TTable = Dict> {
  source: string;
  
  /**
   * Aggregation pipeline stages executed in order before projection.
   * Stages are processed sequentially: [stage1, stage2, ..., stageN, projection]
   */
  pipeline: PipelineStage[];
  
  projection?: Record<keyof TTable, 1 | 0 | DocumentPath | ProjectionOperator>;
}

/**
 * Supported pipeline stages (extensible via union type)
 */
type PipelineStage = 
  | MatchStage
  | UnwindStage
  | AddFieldsStage;

/**
 * Filter stage - equivalent to MongoDB $match
 */
interface MatchStage {
  $match: Filter<any>;
}

/**
 * Array unwinding stage - equivalent to MongoDB $unwind
 */
interface UnwindStage {
  $unwind: string | UnwindOptions;
}

interface UnwindOptions {
  /**
   * Path to the array field to unwind (e.g., '$members', '$items')
   */
  path: string;
  
  /**
   * Optional: Preserve documents with null, missing, or empty arrays
   * Default: false (skip documents without the array)
   */
  preserveNullAndEmptyArrays?: boolean;
  
  /**
   * Optional: Include array index in output
   * Adds a field with the array element's position
   */
  includeArrayIndex?: string;
}

/**
 * Add computed fields stage - equivalent to MongoDB $addFields
 */
interface AddFieldsStage {
  $addFields: Record<string, any>;
}
```

### Key Design Decisions

1. **Discriminated Union**: TypeScript prevents mixing legacy `filter` with modern `pipeline` at compile time
2. **Pipeline Execution Order**: Stages execute in array order, then projection applies last
3. **Backward Compatibility**: Existing configurations with `filter` continue to work unchanged
4. **Extensibility**: New stage types can be added to the `PipelineStage` union without breaking changes
5. **MongoDB Familiarity**: Stage names match MongoDB aggregation operators for intuitive adoption

### Usage Examples

#### Legacy Approach (Still Supported)

```typescript
// Simple filtering without array operations
export const enterpriseAccountsMapping: TableMapping<IZeroAccount> = {
  source: 'accounts',
  filter: { bundle: 'ENTERPRISE' },
  projection: {
    _id: 1,
    id: { $hexToBase64Url: '$_id' },
    name: 1,
    bundle: 1
  }
};
```

#### Modern Pipeline Approach (Array Unwinding)

```typescript
// Unwind members array with filtering
export const accountMembersMapping: TableMapping<IZeroAccountMember> = {
  source: 'accounts',
  
  // Pipeline stages execute in order
  pipeline: [
    // Optional: Filter before unwinding for performance
    { $match: { bundle: 'ENTERPRISE' } },
    
    // Unwind the members array
    { $unwind: '$members' },
    
    // Optional: Filter unwound elements
    { $match: { 'members.role': { $in: ['admin', 'owner'] } } }
  ],
  
  // Project each unwound element
  projection: {
    // Composite ID: accountId + member userId
    _id: { $concat: ['$_id', '_', '$members.id'] },
    id: { $concat: [{ $hexToBase64Url: '$_id' }, '_', '$members.id'] },
    
    // Foreign key to parent
    accountId: '$_id',
    
    // Member fields
    userId: '$members.id',
    name: '$members.name',
    email: '$members.email',
    role: '$members.role',
    
    // Parent timestamps
    createdAt: 1,
    updatedAt: 1
  }
};
```

#### Advanced Pipeline with Computed Fields

```typescript
export const enrichedMembersMapping: TableMapping<IZeroAccountMember> = {
  source: 'accounts',
  pipeline: [
    { $unwind: { path: '$members', includeArrayIndex: 'memberIndex' } },
    { $addFields: { 
      isOwner: { $eq: ['$members.role', 'owner'] },
      fullDisplayName: { $concat: ['$name', ' - ', '$members.name'] }
    }}
  ],
  projection: {
    _id: { $concat: ['$_id', '_', '$members.id'] },
    id: { $concat: [{ $hexToBase64Url: '$_id' }, '_', '$members.id'] },
    accountId: '$_id',
    userId: '$members.id',
    name: '$members.name',
    role: '$members.role',
    memberIndex: 1,
    isOwner: 1,
    fullDisplayName: 1
  }
};
```

### Expected Behavior

**Input**: One MongoDB document with N array elements

```javascript
{
  _id: "6639ce8aa4b95ab814d1d5d9",
  name: "Acme Corp",
  members: [
    { id: "user_1", name: "Alice", role: "admin" },
    { id: "user_2", name: "Bob", role: "member" }
  ]
}
```

**Output**: N Zero table records

```javascript
// Record 1
{
  _id: "6639ce8aa4b95ab814d1d5d9_user_1",
  id: "ZjnOiqS5WrgU0dXZ_user_1",
  accountId: "6639ce8aa4b95ab814d1d5d9",
  userId: "user_1",
  name: "Alice",
  role: "admin"
}

// Record 2
{
  _id: "6639ce8aa4b95ab814d1d5d9_user_2",
  id: "ZjnOiqS5WrgU0dXZ_user_2",
  accountId: "6639ce8aa4b95ab814d1d5d9",
  userId: "user_2",
  name: "Bob",
  role: "member"
}
```

### Change Stream Handling

The change source should handle array modifications intelligently:

**INSERT Operation**:

- Unwind array and create all child records

**UPDATE Operation**:

- Compare old vs new array
- Delete removed elements
- Insert new elements
- Update modified elements

**REPLACE Operation**:

- Delete all existing child records
- Unwind new array and create all child records

**DELETE Operation**:

- Delete all child records where foreign key matches parent ID

## Benefits

1. **Declarative Configuration**: Table mappings become pure configuration instead of imperative code
2. **Backward Compatibility**: Existing `filter`-based mappings continue to work without changes
3. **Type Safety**: TypeScript discriminated union prevents mixing legacy and pipeline approaches
4. **Consistency**: All mappings use the same pattern and mechanism
5. **Reduced Complexity**: No custom change stream handling code needed
6. **Maintainability**: Standard approach that's easier to understand and debug
7. **Performance**: Change source can optimize array diffing and batch operations
8. **Extensibility**: New pipeline stages can be added without breaking existing code
9. **Error Handling**: Built-in handling for edge cases (empty arrays, null values, etc.)
10. **Familiarity**: Pipeline stages match MongoDB aggregation operators developers already know

## Design Rationale

### Why Discriminated Union?

The discriminated union approach (`LegacyTableMapping | PipelineTableMapping`) provides compile-time safety:

```typescript
// ✅ TypeScript allows this (legacy approach)
const mapping1: TableMapping = {
  source: 'accounts',
  filter: { bundle: 'ENTERPRISE' },
  projection: { ... }
};

// ✅ TypeScript allows this (pipeline approach)
const mapping2: TableMapping = {
  source: 'accounts',
  pipeline: [{ $match: { bundle: 'ENTERPRISE' } }],
  projection: { ... }
};

// ❌ TypeScript prevents this (mixing approaches)
const mapping3: TableMapping = {
  source: 'accounts',
  filter: { bundle: 'ENTERPRISE' },  // ERROR: Can't use both
  pipeline: [{ $unwind: '$members' }],
  projection: { ... }
};
```

### Why Pipeline Over Simple Unwind?

1. **Future-Proof**: Adding `$lookup`, `$group`, `$sort`, etc. doesn't require API changes
2. **Composable**: Multiple transformations can be chained in a clear, ordered manner
3. **Performance**: Explicit ordering allows optimization (e.g., filter before unwind)
4. **Familiar**: Developers already know MongoDB aggregation pipeline operators

## Impact

This feature would enable proper normalization of MongoDB documents for Zero, which is critical for:

- **Permission Systems**: Checking user access via normalized membership tables
- **Many-to-Many Relationships**: Modeling join tables from embedded arrays
- **Denormalized Data**: Breaking apart MongoDB's denormalized documents for efficient querying
- **RBAC Systems**: Role-based access control with separate role assignments table

## Implementation Notes

### MongoDB Change Stream Considerations

When a parent document is updated, the change stream provides:

- `updateDescription.updatedFields`: Shows modified fields
- `updateDescription.removedFields`: Shows removed fields
- `fullDocument`: Complete document after the change (when configured)

The change source needs to:

1. Detect when an array field is modified
2. Fetch the old array state (if not available in change event)
3. Compute the diff (added/removed/modified elements)
4. Generate appropriate change events for the unwound table

### Composite Key Generation

For unwound records, the change source should:

- Generate deterministic IDs based on parent ID + array element key
- Support custom ID generation via projection operators
- Ensure uniqueness and consistency across updates

### Edge Cases

- Empty arrays (no records created)
- Null arrays (treated as empty based on `preserveNullAndEmptyArrays`)
- Array elements without unique IDs (use array index)
- Nested arrays (not supported in initial implementation)
- Very large arrays (batching and performance considerations)

## Related Use Cases

This pattern applies to many common scenarios:

- **Comments/Replies**: Post documents with embedded comments array
- **Tags**: Documents with tags array → separate tags table with foreign keys
- **Order Items**: Order documents with items array → line items table
- **Permissions**: User documents with permissions array → permissions table
- **Audit Logs**: Documents with history array → separate audit records
- **Notifications**: User documents with notifications array → notifications table

## References

- MongoDB `$unwind`: <https://www.mongodb.com/docs/manual/reference/operator/aggregation/unwind/>
- Zero Schema Documentation: <https://rocicorp.dev/docs/zero/schema>
- Current package: <https://github.com/cbnsndwch/zero-sources>

---

## Example Repository Setup

If needed, I can provide a minimal reproduction repository demonstrating:

1. The desired table structure
2. Sample MongoDB documents
3. Expected Zero query patterns
4. Current workaround implementation

Please let me know if you need any clarification or additional details!
