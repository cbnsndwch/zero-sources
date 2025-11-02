---
title: 'SetStage interface'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-contracts](./zero-contracts.md) &gt; [SetStage](./zero-contracts.setstage.md)

## SetStage interface

Add computed fields stage - equivalent to MongoDB's $addFields operator.

Adds new fields to documents or replaces existing fields with computed values. Uses the same expression syntax as $project, but retains all existing fields.

**Signature:**

```typescript
interface SetStage
```

## Example

```typescript
{
  $set: {
    isOwner: { $eq: ['$role', 'owner'] },
    fullName: { $concat: ['$firstName', ' ', '$lastName'] }
  }
}
```

## Properties

<table><thead><tr><th>

Property

</th><th>

Modifiers

</th><th>

Type

</th><th>

Description

</th></tr></thead>
<tbody><tr><td>

[$addFields](./zero-contracts.setstage._addfields.md)

</td><td>

</td><td>

[Dict](./zero-contracts.dict.md)

</td><td>

</td></tr>
</tbody></table>
