# Migration Guide: Simple to Pipeline Mappings

## Overview

This guide helps you migrate from simple table mappings to pipeline-based mappings. It explains when to migrate, how to migrate safely, and how to test your migrations.

## Table of Contents

- [When to Migrate](#when-to-migrate)
- [When NOT to Migrate](#when-not-to-migrate)
- [Migration Process](#migration-process)
- [Migration Examples](#migration-examples)
- [Testing Strategy](#testing-strategy)
- [Rollback Plan](#rollback-plan)
- [Common Pitfalls](#common-pitfalls)

---

## When to Migrate

### ✅ You SHOULD migrate if:

1. **Array Unwinding Required**
   - Need to normalize embedded arrays into separate table rows
   - Example: Account members, order line items, user permissions

2. **Multi-Stage Transformations**
   - Complex field computations requiring multiple steps
   - Example: Filtering, unwinding, computing composite keys

3. **Performance Optimization**
   - Pre-filtering before unwinding reduces processing
   - Example: Only unwind ENTERPRISE accounts

4. **Identity-Based Array Diffing**
   - Array elements have unique identifiers
   - Example: Members have userId, line items have SKU

5. **Discriminated Unions**
   - Single collection contains multiple entity types
   - Example: Content collection with announcements, events, articles

---

## When NOT to Migrate

### ❌ You should KEEP simple mappings if:

1. **No Arrays to Unwind**
   - Document structure is flat or contains only scalar fields
   - Example: Users table with email, name, role

2. **Simple Filter + Projection**
   - Only filtering and field selection, no transformations
   - Example: Active users with specific fields

3. **Already Works Fine**
   - Existing simple mapping meets requirements
   - No performance issues
   - No need for array unwinding

4. **Limited Resources**
   - Migration requires testing and validation effort
   - Risk may outweigh benefits for stable code

---

## Migration Process

### Step 1: Analyze Current Mapping

**Question**: Does your mapping need array unwinding?

**Check**:

```typescript
// Simple mapping (current)
const mapping: SimpleTableMapping<User> = {
  source: 'users',
  filter: { role: 'admin' },
  projection: { name: 1, email: 1 }
};
```

**If NO arrays to unwind → Keep simple mapping**

---

### Step 2: Design Pipeline Mapping

**Convert to pipeline stages**:

```typescript
// Pipeline mapping (new)
const mapping = pipelineBuilder<User>('users')
  .match({ role: 'admin' })  // filter → $match
  .build();

// Final projection stays in projection field
{
  tableName: 'users',
  spec: { ... },
  config: {
    ...mapping,
    projection: { name: 1, email: 1 }
  }
}
```

**If unwinding arrays**:

```typescript
const mapping = pipelineBuilder<Member>('accounts')
  .match({ bundle: 'ENTERPRISE' })  // Pre-filter
  .unwind('$members')  // Unwind array
  .addFields({  // Add computed fields
    accountId: '$_id',
    userId: '$members.id'
  })
  .build();
```

---

### Step 3: Add Identity Fields

**Critical for performance**: Array diff needs identity fields.

**Add to table spec**:

```typescript
{
  tableName: 'account_members',
  spec: {
    schema: 'public',
    primaryKey: ['accountId', 'userId'],
    // NEW: Identity field for array diffing
    identityField: 'userId'  // or composite: ['accountId', 'userId']
  },
  config: mapping
}
```

**Without identity field**: Array updates cause DELETE all + INSERT all (poor performance).

**With identity field**: Array updates generate targeted INSERT/UPDATE/DELETE changes (~200x faster).

---

### Step 4: Test in Staging

**Test Scenarios**:

1. **Initial Sync**: Create new documents with arrays
2. **Array Add**: Add one element to existing array
3. **Array Remove**: Remove one element from array
4. **Array Update**: Modify one element in array
5. **Array Reorder**: Change element order without content changes

**Expected Results**:

| Scenario | Expected Change Events |
|----------|------------------------|
| Create with 10 elements | 10 INSERT |
| Add 1 element | 1 INSERT |
| Remove 1 element | 1 DELETE |
| Modify 1 element | 1 UPDATE |
| Reorder (identity-based) | 0 changes |
| Reorder (index-based) | 10 DELETE + 10 INSERT |

---

### Step 5: Monitor Performance

**Key Metrics**:

- Change event count per MongoDB update
- Processing latency
- Memory usage (for large arrays)

**Telemetry API** (if available):

```typescript
// Query change event metrics
const metrics = await telemetry.getChangeMetrics({
  tableName: 'account_members',
  timeRange: 'last-hour'
});

console.log(`Average changes per update: ${metrics.avgChangesPerUpdate}`);
```

---

### Step 6: Deploy to Production

**Deployment Strategy**:

1. **Blue-Green Deployment**: Run old and new side-by-side, switch traffic
2. **Canary Deployment**: Gradually roll out to percentage of traffic
3. **Feature Flag**: Toggle between simple and pipeline mapping

**Rollback Plan**: Keep simple mapping configuration in version control.

---

## Migration Examples

### Example 1: Basic Unwinding

**Before** (simple mapping):

```typescript
const mapping: SimpleTableMapping<Account> = {
  source: 'accounts',
  filter: { bundle: 'ENTERPRISE' },
  projection: { _id: 1, name: 1, members: 1 }
};
```

**Problem**: Members array embedded in each row, can't query individual members.

**After** (pipeline mapping):

```typescript
const mapping = pipelineBuilder<Member>('accounts')
  .match({ bundle: 'ENTERPRISE' })
  .unwind('$members')
  .addFields({
    accountId: '$_id',
    userId: '$members.id',
    role: '$members.role'
  })
  .project({
    _id: { $concat: ['$accountId', '_', '$userId'] },
    accountId: 1,
    userId: 1,
    role: 1
  })
  .build();
```

**Benefits**:

- Query individual members efficiently
- Join members with other tables
- Array updates generate targeted changes

---

### Example 2: Discriminated Union

**Before** (single simple mapping):

```typescript
const mapping: SimpleTableMapping<Content> = {
  source: 'content',
  projection: { _id: 1, type: 1, title: 1, body: 1, eventDate: 1, tags: 1 }
};
```

**Problem**: Mixed entity types in one table, nullable fields, poor type safety.

**After** (multiple pipeline mappings):

```typescript
// Announcements table
const announcementsMapping = pipelineBuilder<Announcement>('content')
  .match({ type: 'announcement' })
  .project({ _id: 1, title: 1, body: 1 })
  .build();

// Events table
const eventsMapping = pipelineBuilder<Event>('content')
  .match({ type: 'event' })
  .project({ _id: 1, title: 1, eventDate: 1 })
  .build();

// Article tags table (with unwinding)
const articleTagsMapping = pipelineBuilder<ArticleTag>('content')
  .match({ type: 'article' })
  .unwind('$tags')
  .addFields({
    articleId: '$_id',
    tag: '$tags'
  })
  .project({
    _id: { $concat: ['$articleId', '_', '$tag'] },
    articleId: 1,
    tag: 1
  })
  .build();
```

**Benefits**:

- Type-safe tables per entity type
- No nullable fields
- Can unwind arrays independently per type

---

### Example 3: Pre-Filtering Optimization

**Before** (no filter):

```typescript
const mapping: SimpleTableMapping<Member> = {
  source: 'accounts',
  projection: { _id: 1, name: 1, members: 1 }
};
```

**Problem**: Syncing all accounts even if you only need ENTERPRISE members.

**After** (with pre-filter):

```typescript
const mapping = pipelineBuilder<Member>('accounts')
  .match({ bundle: 'ENTERPRISE' })  // Pre-filter BEFORE projection
  .unwind('$members')
  .build();
```

**Performance Impact**:

- **Before**: Process 1,000 accounts × 10 members = 10,000 docs
- **After**: Process 100 ENTERPRISE accounts × 10 members = 1,000 docs
- **Savings**: 90% reduction

---

### Example 4: Adding Computed Fields

**Before** (limited transformation):

```typescript
const mapping: SimpleTableMapping<Order> = {
  source: 'orders',
  projection: { _id: 1, customerId: 1, items: 1 }
};
```

**Problem**: Need line-level totals (quantity × price).

**After** (with computed fields):

```typescript
const mapping = pipelineBuilder<LineItem>('orders')
  .unwind('$items', { includeArrayIndex: 'lineNumber' })
  .addFields({
    orderId: '$_id',
    sku: '$items.sku',
    quantity: '$items.quantity',
    price: '$items.price',
    lineTotal: { $multiply: ['$items.quantity', '$items.price'] }  // Computed
  })
  .build();
```

**Benefits**:

- Computed fields available in Zero queries
- No client-side calculation needed

---

## Testing Strategy

### Unit Tests

**Test Pipeline Execution**:

```typescript
import { PipelineExecutorService } from '@cbnsndwch/zero-source-mongodb';

describe('Account Members Mapping', () => {
  let executor: PipelineExecutorService;

  beforeEach(() => {
    executor = new PipelineExecutorService();
  });

  test('should unwind members correctly', () => {
    const doc = {
      _id: 'acc1',
      name: 'Acme',
      members: [
        { id: 'u1', role: 'admin' },
        { id: 'u2', role: 'member' }
      ]
    };

    const pipeline = [
      { $unwind: '$members' },
      { $addFields: { accountId: '$_id', userId: '$members.id' } }
    ];

    const results = executor.executePipeline(doc, pipeline);

    expect(results).toHaveLength(2);
    expect(results[0].accountId).toBe('acc1');
    expect(results[0].userId).toBe('u1');
  });
});
```

---

### Integration Tests

**Test Change Stream Processing**:

```typescript
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Change Stream Integration', () => {
  let mongoServer: MongoMemoryServer;
  let connection: Connection;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    connection = await mongoose.connect(mongoServer.getUri());
  });

  test('should generate correct INSERT events', async () => {
    const collection = connection.db.collection('accounts');
    
    // Insert document with members
    await collection.insertOne({
      _id: 'acc1',
      name: 'Test',
      members: [
        { id: 'u1', role: 'admin' },
        { id: 'u2', role: 'member' }
      ]
    });

    // Verify 2 INSERT change events generated
    const changes = await getChangeEvents('account_members');
    expect(changes).toHaveLength(2);
    expect(changes[0].tag).toBe('insert');
    expect(changes[1].tag).toBe('insert');
  });

  test('should generate minimal changes for array update', async () => {
    // Initial: 3 members
    await collection.insertOne({
      _id: 'acc1',
      members: [
        { id: 'u1', role: 'admin' },
        { id: 'u2', role: 'member' },
        { id: 'u3', role: 'member' }
      ]
    });

    // Update: Remove u2
    await collection.updateOne(
      { _id: 'acc1' },
      { $pull: { members: { id: 'u2' } } }
    );

    // Verify only 1 DELETE event (not 3 DELETE + 2 INSERT)
    const changes = await getChangeEvents('account_members', { since: 'lastInsert' });
    expect(changes).toHaveLength(1);
    expect(changes[0].tag).toBe('delete');
    expect(changes[0].old.userId).toBe('u2');
  });
});
```

---

### E2E Tests

**Test Zero Client Sync**:

```typescript
import { Zero } from '@rocicorp/zero';

describe('Zero Client Sync', () => {
  let zero: Zero;

  beforeEach(async () => {
    zero = new Zero({ server: TEST_SERVER_URL });
  });

  test('should sync unwound members', async () => {
    // Insert account via MongoDB
    await mongoClient.db().collection('accounts').insertOne({
      _id: 'acc1',
      name: 'Test',
      members: [
        { id: 'u1', name: 'Alice', role: 'admin' },
        { id: 'u2', name: 'Bob', role: 'member' }
      ]
    });

    // Wait for sync
    await zero.waitForSync();

    // Query Zero client
    const members = await zero.query.account_members.run();

    expect(members).toHaveLength(2);
    expect(members[0].userId).toBe('u1');
    expect(members[1].userId).toBe('u2');
  });

  test('should reflect array update in real-time', async () => {
    // Initial state
    await mongoClient.db().collection('accounts').insertOne({
      _id: 'acc1',
      members: [{ id: 'u1', name: 'Alice' }]
    });

    await zero.waitForSync();

    // Add member
    await mongoClient.db().collection('accounts').updateOne(
      { _id: 'acc1' },
      { $push: { members: { id: 'u2', name: 'Bob' } } }
    );

    // Wait for real-time update
    await zero.waitForSync();

    const members = await zero.query.account_members.run();
    expect(members).toHaveLength(2);
  });
});
```

---

## Rollback Plan

### Preparing for Rollback

**1. Version Control**: Keep both configurations in git

```typescript
// config/mappings.ts
export const MAPPINGS_V1 = {
  account_members: simpleMapping  // Old
};

export const MAPPINGS_V2 = {
  account_members: pipelineMapping  // New
};

// Use feature flag to switch
const activeMappings = process.env.USE_PIPELINE_MAPPINGS === 'true'
  ? MAPPINGS_V2
  : MAPPINGS_V1;
```

**2. Feature Flag**: Toggle without deployment

```typescript
import { FeatureFlags } from './feature-flags';

const mapping = FeatureFlags.isEnabled('pipeline-mappings-v2')
  ? pipelineMappings.account_members
  : simpleMappings.account_members;
```

**3. Monitoring**: Alert on anomalies

```typescript
// Alert if change event count spike
if (changeCount > THRESHOLD) {
  logger.error('Change event count spike detected', { changeCount });
  // Auto-rollback or notify team
}
```

---

### Rollback Procedure

**Step 1**: Set feature flag to false

```bash
# Environment variable
export USE_PIPELINE_MAPPINGS=false

# Or via feature flag service
curl -X POST https://flags.example.com/flags/pipeline-mappings-v2 \
  -d '{"enabled": false}'
```

**Step 2**: Restart change source servers

```bash
kubectl rollout restart deployment/change-source-server
```

**Step 3**: Verify rollback

```typescript
// Check active configuration
const config = await fetch('http://change-source/api/config');
console.log(config.mappings.account_members);
// Should show simple mapping
```

**Step 4**: Clear Zero cache (if needed)

```bash
# Force full re-sync from MongoDB
curl -X POST http://zero-cache/api/admin/reset
```

---

## Common Pitfalls

### Pitfall 1: Forgetting Identity Fields

**Symptom**: Array updates generate 200 change events instead of 2.

**Cause**: Missing `identityField` in table spec.

**Solution**: Add identity field

```typescript
{
  tableName: 'account_members',
  spec: {
    primaryKey: ['accountId', 'userId'],
    identityField: 'userId'  // Add this
  }
}
```

---

### Pitfall 2: Nested Array Paths

**Symptom**: All unwound documents have same values.

**Cause**: Shallow copy bug in nested path unwinding.

**Solution**: Use top-level arrays only

```typescript
// ❌ Bad
{ $unwind: '$data.members' }

// ✅ Good
{ $unwind: '$members' }
```

---

### Pitfall 3: Filter After Unwind

**Symptom**: Poor performance, processing too many documents.

**Cause**: Filter applied after unwinding instead of before.

**Solution**: Move filter before unwind

```typescript
// ❌ Bad
.unwind('$members')
.match({ bundle: 'ENTERPRISE' })

// ✅ Good
.match({ bundle: 'ENTERPRISE' })
.unwind('$members')
```

---

### Pitfall 4: Missing Composite Key Columns

**Symptom**: Zero client query fails with "missing primary key column".

**Cause**: Projection doesn't include all primary key columns.

**Solution**: Ensure all PK columns in projection

```typescript
{
  spec: {
    primaryKey: ['accountId', 'userId']  // Composite key
  },
  config: {
    pipeline: [...],
    projection: {
      accountId: 1,  // Must include
      userId: 1,     // Must include
      role: 1
    }
  }
}
```

---

### Pitfall 5: No Testing Strategy

**Symptom**: Migration breaks production, no way to validate.

**Cause**: Deployed without testing array update scenarios.

**Solution**: Test all CRUD operations

```typescript
// Test checklist:
// - ✅ INSERT with array
// - ✅ UPDATE add array element
// - ✅ UPDATE remove array element
// - ✅ UPDATE modify array element
// - ✅ UPDATE reorder array elements
// - ✅ REPLACE document with array
// - ✅ DELETE document with array
```

---

### Pitfall 6: Large Arrays Without Pagination

**Symptom**: Performance degrades with large arrays (1000+ elements).

**Cause**: In-memory unwinding of entire array.

**Solution**: Consider separate collections or pagination

```typescript
// If array > 1000 elements, consider:
// 1. Separate collection with foreign key
// 2. Paginated unwinding (custom logic)
// 3. Hybrid approach (first 100 in doc, rest in collection)
```

---

## Automated Migration Tool

**Helper Script**: Convert simple to pipeline mapping

```typescript
import { toPipelineMapping } from '@cbnsndwch/zero-contracts';

function migrateMapping(simple: SimpleTableMapping<any>) {
  const pipeline = toPipelineMapping(simple);
  
  console.log('Before:', JSON.stringify(simple, null, 2));
  console.log('After:', JSON.stringify(pipeline, null, 2));
  
  return pipeline;
}

// Usage
const oldMapping = {
  source: 'users',
  filter: { role: 'admin' },
  projection: { name: 1, email: 1 }
};

const newMapping = migrateMapping(oldMapping);
// Result: {
//   source: 'users',
//   pipeline: [{ $match: { role: 'admin' } }],
//   projection: { name: 1, email: 1 }
// }
```

---

## Next Steps

- See [API Reference](./API_REFERENCE.md) for detailed API documentation
- See [Usage Guide](./USAGE_GUIDE.md) for comprehensive examples
- See [Performance Guide](./PERFORMANCE_GUIDE.md) for optimization strategies
