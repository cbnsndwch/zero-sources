---
title: 'match() function'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-contracts](./zero-contracts.md) &gt; [match](./zero-contracts.match.md)

## match() function

Creates a $match pipeline stage for filtering documents.

This is equivalent to MongoDB's $match aggregation operator.

**Signature:**

```typescript
declare function match<T>(filter: Filter<T>): MatchStage<T>;
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

filter

</td><td>

[Filter](./zero-contracts.filter.md)<!-- -->&lt;T&gt;

</td><td>

MongoDB filter criteria

</td></tr>
</tbody></table>

**Returns:**

[MatchStage](./zero-contracts.matchstage.md)<!-- -->&lt;T&gt;

A $match stage

## Example

```typescript
const stage = match({ bundle: 'ENTERPRISE', isActive: true });
// { $match: { bundle: 'ENTERPRISE', isActive: true } }

const nestedStage = match({ 'members.role': { $in: ['admin', 'owner'] } });
// { $match: { 'members.role': { $in: ['admin', 'owner'] } } }
```
