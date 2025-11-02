---
title: 'isPipelineMapping() function'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-contracts](./zero-contracts.md) &gt; [isPipelineMapping](./zero-contracts.ispipelinemapping.md)

## isPipelineMapping() function

Type guard to check if a table mapping uses the pipeline-based approach.

**Signature:**

```typescript
declare function isPipelineMapping<T>(
    mapping: TableMapping<T>
): mapping is PipelineTableMapping<T>;
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

[TableMapping](./zero-contracts.tablemapping.md)<!-- -->&lt;T&gt;

</td><td>

The table mapping to check

</td></tr>
</tbody></table>

**Returns:**

mapping is [PipelineTableMapping](./zero-contracts.pipelinetablemapping.md)<!-- -->&lt;T&gt;

True if the mapping uses pipeline, false if it uses simple filter

## Example

```typescript
const mapping: TableMapping = { source: 'accounts', pipeline: [...] };

if (isPipelineMapping(mapping)) {
  // mapping is PipelineTableMapping
  console.log(mapping.pipeline);
}
```
