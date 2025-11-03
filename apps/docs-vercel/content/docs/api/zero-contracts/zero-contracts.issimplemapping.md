---
title: 'isSimpleMapping() function'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-contracts](./zero-contracts.md) &gt; [isSimpleMapping](./zero-contracts.issimplemapping.md)

## isSimpleMapping() function

Type guard to check if a table mapping uses the simple filter-based approach.

**Signature:**

```typescript
declare function isSimpleMapping<T>(
    mapping: TableMapping<T>
): mapping is SimpleTableMapping<T>;
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

mapping is [SimpleTableMapping](./zero-contracts.simpletablemapping.md)<!-- -->&lt;T&gt;

True if the mapping uses simple filter, false if it uses pipeline

## Example

```typescript
const mapping: TableMapping = { source: 'accounts', filter: {...} };

if (isSimpleMapping(mapping)) {
  // mapping is SimpleTableMapping
  console.log(mapping.filter);
}
```
