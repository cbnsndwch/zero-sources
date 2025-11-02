---
title: 'toPipelineMapping() function'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-contracts](./zero-contracts.md) &gt; [toPipelineMapping](./zero-contracts.topipelinemapping.md)

## toPipelineMapping() function

Converts a simple filter-based mapping to a pipeline-based mapping.

This is useful for migrating existing configurations or when you need pipeline features but want to preserve simple configuration structure.

**Signature:**

```typescript
declare function toPipelineMapping<T>(
    mapping: SimpleTableMapping<T>
): PipelineTableMapping<T>;
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

mapping

</td><td>

[SimpleTableMapping](./zero-contracts.simpletablemapping.md)<!-- -->&lt;T&gt;

</td><td>

simple mapping to convert

</td></tr>
</tbody></table>

**Returns:**

[PipelineTableMapping](./zero-contracts.pipelinetablemapping.md)<!-- -->&lt;T&gt;

Equivalent pipeline-based mapping

## Example

```typescript
const simple: SimpleTableMapping = {
    source: 'accounts',
    filter: { bundle: 'ENTERPRISE' },
    projection: { _id: 1, name: 1 }
};

const pipeline = toPipelineMapping(simple);
// {
//   source: 'accounts',
//   pipeline: [{ $match: { bundle: 'ENTERPRISE' } }],
//   projection: { _id: 1, name: 1 }
// }
```
