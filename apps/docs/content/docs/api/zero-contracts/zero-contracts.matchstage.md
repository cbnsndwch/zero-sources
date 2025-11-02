---
title: 'MatchStage interface'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-contracts](./zero-contracts.md) &gt; [MatchStage](./zero-contracts.matchstage.md)

## MatchStage interface

Filter stage - equivalent to MongoDB's $match operator.

Filters documents based on the specified criteria. Documents that don't match the filter are excluded from further processing.

**Signature:**

```typescript
interface MatchStage<T = Dict>
```

## Example

```typescript
{ $match: { bundle: 'ENTERPRISE', isActive: true } }
{ $match: { 'members.role': { $in: ['admin', 'owner'] } } }
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

[$match](./zero-contracts.matchstage._match.md)

</td><td>

</td><td>

[Filter](./zero-contracts.filter.md)<!-- -->&lt;T&gt;

</td><td>

</td></tr>
</tbody></table>
