---
title: 'project() function'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-contracts](./zero-contracts.md) &gt; [project](./zero-contracts.project.md)

## project() function

Creates a $project pipeline stage for reshaping documents.

This is equivalent to MongoDB's $project aggregation operator. Unlike the top-level `projection` field which applies only to the final output, $project stages can be used at any point in the pipeline.

**Signature:**

```typescript
declare function project<T = Dict>(projection: Projection<T>): ProjectStage<T>;
```

## Parameters

<table><thead><tr><th>

Parameter

</th><th>

Type

</th><th>

Description

</th></tr></thead>
<tbody><tr><td>

projection

</td><td>

[Projection](./zero-contracts.projection.md)<!-- -->&lt;T&gt;

</td><td>

Projection specification with field selections and computed values

</td></tr>
</tbody></table>

**Returns:**

[ProjectStage](./zero-contracts.projectstage.md)<!-- -->&lt;T&gt;

A $project stage

## Example

```typescript
// Include specific fields
const includeStage = project({
    _id: 1,
    name: 1,
    email: 1
});
// { $project: { _id: 1, name: 1, email: 1 } }

// Rename and compute fields
const computedStage = project({
    userId: '$_id',
    fullName: { $concat: ['$firstName', ' ', '$lastName'] },
    isActive: { $eq: ['$status', 'active'] }
});
// { $project: { userId: '$_id', fullName: ..., isActive: ... } }

// Complex transformations
const complexStage = project({
    compositeId: { $concat: ['$accountId', '_', '$userId'] },
    accountRef: '$accountId',
    metadata: {
        createdAt: '$createdAt',
        updatedAt: '$updatedAt'
    }
});
```
