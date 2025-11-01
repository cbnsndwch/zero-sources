# Usage Guide: Pipeline Table Mappings

## Overview

This guide demonstrates real-world usage patterns for pipeline table mappings, from basic array unwinding to complex multi-stage transformations.

## Table of Contents

- [Basic Patterns](#basic-patterns)
- [Filtering Strategies](#filtering-strategies)
- [Working with Composite Keys](#working-with-composite-keys)
- [Discriminated Unions](#discriminated-unions)
- [Real-World Scenarios](#real-world-scenarios)
- [Best Practices](#best-practices)

---

## Basic Patterns

### Simple Array Unwinding

**Scenario**: Normalize a document with an embedded array into separate table rows.

**MongoDB Collection**: `accounts`

```json
{
  "_id": "acc1",
  "name": "Acme Corp",
  "members": [
    { "id": "u1", "name": "Alice", "role": "admin" },
    { "id": "u2", "name": "Bob", "role": "member" }
  ]
}
```

**Desired Zero Table**: `account_members`

| id | accountId | userId | name | role |
|----|-----------|--------|------|------|
| acc1_u1 | acc1 | u1 | Alice | admin |
| acc1_u2 | acc1 | u2 | Bob | member |

**Mapping**:

```typescript
import { pipelineBuilder } from '@cbnsndwch/zero-contracts';

const mapping = pipelineBuilder<AccountMember>('accounts')
  .unwind('$members')
  .addFields({
    accountId: '$_id',
    userId: '$members.id',
    name: '$members.name',
    role: '$members.role'
  })
  .project({
    _id: { $concat: ['$accountId', '_', '$userId'] },
    accountId: 1,
    userId: 1,
    name: 1,
    role: 1
  })
  .build();
```

**Result**: 2 INSERT events when the account is created, one per member.

---

### Array Unwinding with Index

**Scenario**: Preserve element ordering by including array index.

**Use Case**: Ordered lists (e.g., task priorities, ranking)

**Mapping**:

```typescript
const mapping = pipelineBuilder<Task>('projects')
  .unwind('$tasks', { includeArrayIndex: 'taskOrder' })
  .addFields({
    projectId: '$_id',
    taskId: '$tasks.id',
    title: '$tasks.title',
    priority: '$taskOrder'  // 0, 1, 2, ...
  })
  .build();
```

**MongoDB Document**:

```json
{
  "_id": "proj1",
  "name": "Website Redesign",
  "tasks": [
    { "id": "t1", "title": "Design mockups" },
    { "id": "t2", "title": "Implement frontend" },
    { "id": "t3", "title": "Deploy" }
  ]
}
```

**Zero Table**:

| projectId | taskId | title | priority |
|-----------|--------|-------|----------|
| proj1 | t1 | Design mockups | 0 |
| proj1 | t2 | Implement frontend | 1 |
| proj1 | t3 | Deploy | 2 |

---

### Preserve Null and Empty Arrays

**Scenario**: Keep parent documents even if array is empty or null.

**Use Case**: Optional relationships (e.g., users with optional tags)

**Mapping**:

```typescript
const mapping = pipelineBuilder<User>('users')
  .unwind('$tags', { preserveNullAndEmptyArrays: true })
  .build();
```

**Behavior**:

| Input Document | Output Documents |
|----------------|------------------|
| `{ _id: 'u1', tags: ['vip', 'beta'] }` | 2 docs (one per tag) |
| `{ _id: 'u2', tags: [] }` | 1 doc with `tags: null` |
| `{ _id: 'u3', tags: null }` | 1 doc with `tags: null` |
| `{ _id: 'u4' }` | 1 doc with `tags: null` |

**Without `preserveNullAndEmptyArrays`**: Documents u2, u3, u4 would be filtered out.

---

## Filtering Strategies

### Pre-Filtering (Performance Optimization)

**Best Practice**: Filter documents BEFORE unwinding to reduce processing.

**Scenario**: Only unwind members from ENTERPRISE accounts.

**Mapping**:

```typescript
const mapping = pipelineBuilder<Member>('accounts')
  .match({ bundle: 'ENTERPRISE' })  // Filter FIRST
  .unwind('$members')
  .build();
```

**Performance Impact**:

- 1,000 accounts total
- 100 ENTERPRISE accounts
- Average 10 members per account

**Without pre-filter**: Process 10,000 unwound documents  
**With pre-filter**: Process 1,000 unwound documents  
**Savings**: 90% reduction in processing

---

### Post-Filtering (Element-Level)

**Scenario**: Unwind all members but only sync admins/owners.

**Mapping**:

```typescript
const mapping = pipelineBuilder<Member>('accounts')
  .unwind('$members')
  .match({ 'members.role': { $in: ['admin', 'owner'] } })  // Filter AFTER unwind
  .addFields({
    accountId: '$_id',
    userId: '$members.id',
    role: '$members.role'
  })
  .build();
```

**Use Case**: When you need element-level filtering (not document-level).

---

### Combined Filtering

**Scenario**: Filter documents AND elements.

**Mapping**:

```typescript
const mapping = pipelineBuilder<Member>('accounts')
  .match({ bundle: { $in: ['PRO', 'ENTERPRISE'] } })  // Document filter
  .unwind('$members')
  .match({ 'members.active': true })  // Element filter
  .build();
```

**Result**: Only active members from PRO/ENTERPRISE accounts.

---

## Working with Composite Keys

### Composite Primary Keys

**Scenario**: Multi-column primary key for Zero table.

**Table Spec**:

```typescript
{
  tableName: 'account_members',
  spec: {
    schema: 'public',
    primaryKey: ['accountId', 'userId']  // Composite key
  },
  config: mapping
}
```

**Mapping Strategy**: Ensure both key columns are present in projection.

```typescript
const mapping = pipelineBuilder<Member>('accounts')
  .unwind('$members')
  .addFields({
    accountId: '$_id',
    userId: '$members.id'
  })
  .build();
```

**Why composite keys?**: Natural join support in Zero queries.

---

### Synthetic ID Generation

**Scenario**: Generate a single-column primary key from composite values.

**Mapping**:

```typescript
const mapping = pipelineBuilder<Member>('accounts')
  .unwind('$members')
  .addFields({
    accountId: '$_id',
    userId: '$members.id'
  })
  .project({
    _id: { $concat: ['$accountId', '_', '$userId'] },  // Synthetic ID
    accountId: 1,
    userId: 1,
    role: '$members.role'
  })
  .build();
```

**Benefit**: Simpler primary key for Zero table.

**Tradeoff**: Must reconstruct composite key for joins.

---

## Discriminated Unions

### Polymorphic Collections

**Scenario**: Single MongoDB collection contains multiple entity types.

**MongoDB Collection**: `content`

```json
[
  {
    "_id": "c1",
    "type": "announcement",
    "title": "Welcome!",
    "body": "Welcome to our platform"
  },
  {
    "_id": "c2",
    "type": "event",
    "title": "Webinar",
    "eventDate": "2024-05-15"
  },
  {
    "_id": "c3",
    "type": "article",
    "title": "Getting Started",
    "tags": ["tutorial", "basics"]
  }
]
```

**Goal**: Separate Zero tables per type.

**Mappings**:

```typescript
// Announcements table
const announcementsMapping = pipelineBuilder<Announcement>('content')
  .match({ type: 'announcement' })
  .project({
    _id: 1,
    title: 1,
    body: 1
  })
  .build();

// Events table
const eventsMapping = pipelineBuilder<Event>('content')
  .match({ type: 'event' })
  .project({
    _id: 1,
    title: 1,
    eventDate: 1
  })
  .build();

// Articles table with tag unwinding
const articlesMapping = pipelineBuilder<ArticleTag>('content')
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

**Table Specs**:

```typescript
[
  { tableName: 'announcements', spec: { ... }, config: announcementsMapping },
  { tableName: 'events', spec: { ... }, config: eventsMapping },
  { tableName: 'article_tags', spec: { ... }, config: articlesMapping }
]
```

**Result**:

- `announcements`: 1 row (c1)
- `events`: 1 row (c2)
- `article_tags`: 2 rows (c3 unwound by tags)

---

## Real-World Scenarios

### Scenario 1: RBAC Permission System

**Requirement**: Track account members with roles for authorization.

**MongoDB Schema**:

```json
{
  "_id": "acc1",
  "name": "Acme Corp",
  "bundle": "ENTERPRISE",
  "members": [
    {
      "id": "u1",
      "email": "alice@acme.com",
      "role": "owner",
      "permissions": ["admin", "billing", "invite"]
    },
    {
      "id": "u2",
      "email": "bob@acme.com",
      "role": "admin",
      "permissions": ["admin", "invite"]
    },
    {
      "id": "u3",
      "email": "charlie@acme.com",
      "role": "member",
      "permissions": ["read"]
    }
  ]
}
```

**Zero Tables**:

1. `accounts` (parent table - simple mapping)
2. `account_members` (unwound members)
3. `member_permissions` (further unwound permissions)

**Mappings**:

```typescript
// 1. Accounts table (simple mapping)
const accountsMapping: SimpleTableMapping<Account> = {
  source: 'accounts',
  projection: { _id: 1, name: 1, bundle: 1 }
};

// 2. Account members table
const membersMapping = pipelineBuilder<AccountMember>('accounts')
  .unwind('$members')
  .addFields({
    accountId: '$_id',
    userId: '$members.id',
    email: '$members.email',
    role: '$members.role'
  })
  .project({
    _id: { $concat: ['$accountId', '_', '$userId'] },
    accountId: 1,
    userId: 1,
    email: 1,
    role: 1
  })
  .build();

// 3. Member permissions table (double unwind)
const permissionsMapping = pipelineBuilder<MemberPermission>('accounts')
  .unwind('$members')
  .unwind('$members.permissions')
  .addFields({
    accountId: '$_id',
    userId: '$members.id',
    permission: '$members.permissions'
  })
  .project({
    _id: { $concat: ['$accountId', '_', '$userId', '_', '$permission'] },
    accountId: 1,
    userId: 1,
    permission: 1
  })
  .build();
```

**Result Tables**:

`accounts`:

| _id | name | bundle |
|-----|------|--------|
| acc1 | Acme Corp | ENTERPRISE |

`account_members`:

| _id | accountId | userId | email | role |
|-----|-----------|--------|-------|------|
| acc1_u1 | acc1 | u1 | alice@acme.com | owner |
| acc1_u2 | acc1 | u2 | bob@acme.com | admin |
| acc1_u3 | acc1 | u3 | charlie@acme.com | member |

`member_permissions`:

| _id | accountId | userId | permission |
|-----|-----------|--------|------------|
| acc1_u1_admin | acc1 | u1 | admin |
| acc1_u1_billing | acc1 | u1 | billing |
| acc1_u1_invite | acc1 | u1 | invite |
| acc1_u2_admin | acc1 | u2 | admin |
| acc1_u2_invite | acc1 | u2 | invite |
| acc1_u3_read | acc1 | u3 | read |

---

### Scenario 2: E-commerce Order Line Items

**Requirement**: Track orders and line items separately for analytics.

**MongoDB Schema**:

```json
{
  "_id": "ord1",
  "customerId": "cust1",
  "status": "completed",
  "total": 150.00,
  "items": [
    { "sku": "WIDGET-001", "name": "Widget", "quantity": 2, "price": 50.00 },
    { "sku": "GADGET-002", "name": "Gadget", "quantity": 1, "price": 50.00 }
  ]
}
```

**Mappings**:

```typescript
// Orders table
const ordersMapping: SimpleTableMapping<Order> = {
  source: 'orders',
  projection: { _id: 1, customerId: 1, status: 1, total: 1 }
};

// Order line items
const lineItemsMapping = pipelineBuilder<OrderLineItem>('orders')
  .unwind('$items', { includeArrayIndex: 'lineNumber' })
  .addFields({
    orderId: '$_id',
    sku: '$items.sku',
    name: '$items.name',
    quantity: '$items.quantity',
    price: '$items.price',
    lineTotal: { $multiply: ['$items.quantity', '$items.price'] }
  })
  .project({
    _id: { $concat: ['$orderId', '_', { $toString: '$lineNumber' }] },
    orderId: 1,
    lineNumber: 1,
    sku: 1,
    name: 1,
    quantity: 1,
    price: 1,
    lineTotal: 1
  })
  .build();
```

**Benefits**:

- Query individual line items efficiently
- Calculate analytics per SKU
- Track inventory by SKU
- Maintain order integrity via `orderId` foreign key

---

### Scenario 3: Notification Subscriptions

**Requirement**: Users can subscribe to multiple notification channels.

**MongoDB Schema**:

```json
{
  "_id": "u1",
  "email": "alice@example.com",
  "subscriptions": [
    { "channel": "email", "topics": ["news", "updates"] },
    { "channel": "sms", "topics": ["alerts"] },
    { "channel": "push", "topics": ["news", "alerts", "updates"] }
  ]
}
```

**Mapping** (double unwind):

```typescript
const subscriptionsMapping = pipelineBuilder<UserSubscription>('users')
  .unwind('$subscriptions')
  .unwind('$subscriptions.topics')
  .addFields({
    userId: '$_id',
    channel: '$subscriptions.channel',
    topic: '$subscriptions.topics'
  })
  .project({
    _id: { $concat: ['$userId', '_', '$channel', '_', '$topic'] },
    userId: 1,
    channel: 1,
    topic: 1
  })
  .build();
```

**Zero Table** (`user_subscriptions`):

| _id | userId | channel | topic |
|-----|--------|---------|-------|
| u1_email_news | u1 | email | news |
| u1_email_updates | u1 | email | updates |
| u1_sms_alerts | u1 | sms | alerts |
| u1_push_news | u1 | push | news |
| u1_push_alerts | u1 | push | alerts |
| u1_push_updates | u1 | push | updates |

**Use Case**: Efficiently query "which users want email notifications for news?"

```typescript
const subscribers = await zero.query.user_subscriptions
  .where('channel', 'email')
  .where('topic', 'news')
  .run();
```

---

## Best Practices

### 1. Filter Before Unwinding

**Performance Impact**: Reduces number of documents to process.

```typescript
// ✅ Good - filter first
.match({ status: 'active' })
.unwind('$items')

// ❌ Bad - filter after
.unwind('$items')
.match({ status: 'active' })
```

**Exception**: When filtering by array element properties, you must unwind first.

---

### 2. Use Identity Fields for Array Diffing

**Performance Impact**: ~200x reduction in change events for array updates.

**Requirement**: Array elements must have unique identifier field.

```typescript
// ✅ Good - elements have ID
{
  "members": [
    { "id": "u1", "name": "Alice" },  // id is unique
    { "id": "u2", "name": "Bob" }
  ]
}

// ❌ Bad - no unique ID
{
  "items": [
    { "name": "Widget", "quantity": 2 },  // no ID
    { "name": "Gadget", "quantity": 1 }
  ]
}
```

**Solution for missing IDs**: Add synthetic ID in mapping:

```typescript
.unwind('$items', { includeArrayIndex: 'idx' })
.addFields({
  itemId: { $concat: ['$_id', '_', { $toString: '$idx' }] }
})
```

**Tradeoff**: Index-based IDs break on reordering (performance degrades to DELETE all + INSERT all).

---

### 3. Keep Nested Objects Shallow

**Known Issue**: Nested array path unwinding has shallow copy bug.

```typescript
// ✅ Good - top-level array
{ $unwind: '$members' }

// ❌ Bad - nested array
{ $unwind: '$data.members' }  // Bug: shared object references
```

**Workaround**: Restructure MongoDB schema to use top-level arrays.

---

### 4. Use Composite Primary Keys

**Performance**: Natural join support in Zero queries.

```typescript
// ✅ Good - composite key
{
  tableName: 'account_members',
  spec: {
    primaryKey: ['accountId', 'userId']
  }
}

// ❌ OK but less efficient - synthetic key
{
  tableName: 'account_members',
  spec: {
    primaryKey: ['id']  // where id = accountId_userId
  }
}
```

**Trade-offs**:

- Composite: Better for joins, more columns
- Synthetic: Simpler key, requires string parsing for joins

---

### 5. Document Array Size Limits

**MongoDB Limits**: 16MB document size limit

**Practical Limits**:

- < 100 elements: No issues
- 100-1000 elements: Monitor performance
- \> 1000 elements: Consider pagination or separate collections

**Solution for large arrays**: Use separate collections with foreign keys instead of unwinding.

---

### 6. Test with Realistic Data

**Array Update Scenarios**:

- Add one element (should generate 1 INSERT)
- Remove one element (should generate 1 DELETE)
- Modify one element (should generate 1 UPDATE)
- Reorder elements (should generate 0 changes if identity-based)

**Validation Script**:

```typescript
// Before: 100 members
// After: 99 members (removed 1)
// Expected: 1 DELETE change event
// Actual: Verify with telemetry API
```

---

### 7. Use Builder API for Readability

**Comparison**:

```typescript
// ✅ Readable - builder API
const mapping = pipelineBuilder<Member>('accounts')
  .match({ bundle: 'ENTERPRISE' })
  .unwind('$members')
  .addFields({ accountId: '$_id', userId: '$members.id' })
  .build();

// ❌ Verbose - manual construction
const mapping: PipelineTableMapping<Member> = {
  source: 'accounts',
  pipeline: [
    { $match: { bundle: 'ENTERPRISE' } },
    { $unwind: '$members' },
    { $addFields: { accountId: '$_id', userId: '$members.id' } }
  ]
};
```

Both are equivalent, but builder API is more readable and type-safe.

---

## Troubleshooting

### Issue: No change events generated

**Cause**: Document doesn't match filter or mapping source.

**Solution**: Check MongoDB change stream is watching correct collection and filters are correct.

---

### Issue: Too many change events for array update

**Symptom**: Update 1 element → 200 change events (100 DELETE + 100 INSERT).

**Cause**: Array diff fallback to index-based matching.

**Solution**: Ensure array elements have identity field specified in table spec:

```typescript
{
  tableName: 'account_members',
  spec: {
    primaryKey: ['accountId', 'userId'],
    identityField: 'userId'  // Critical for array diff
  }
}
```

---

### Issue: Array reordering generates spurious changes

**Cause**: Using index-based matching instead of identity-based.

**Solution**: Add identity field to array elements and table spec.

---

### Issue: Shared object references after unwind

**Symptom**: All unwound documents have the same nested object values.

**Cause**: Nested array path shallow copy bug.

**Solution**: Use top-level arrays only (not `$data.members`, use `$members`).

---

## Next Steps

- See [API Reference](./API_REFERENCE.md) for detailed API documentation
- See [Migration Guide](./MIGRATION_GUIDE.md) for migrating from simple to pipeline mappings
- See [Performance Guide](./PERFORMANCE_GUIDE.md) for optimization strategies
