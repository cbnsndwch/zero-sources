---
title: 'pipelineBuilder() function'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-contracts](./zero-contracts.md) &gt; [pipelineBuilder](./zero-contracts.pipelinebuilder.md)

## pipelineBuilder() function

Creates a new pipeline mapping builder.

**Signature:**

```typescript
declare function pipelineBuilder<T>(source: string): PipelineMappingBuilder<T>;
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

source

</td><td>

string

</td><td>

MongoDB collection name

</td></tr>
</tbody></table>

**Returns:**

[PipelineMappingBuilder](./zero-contracts.pipelinemappingbuilder.md)<!-- -->&lt;T&gt;

A new PipelineMappingBuilder instance

## Example

```typescript
const mapping = pipelineBuilder<IUser>('users')
    .match({ isActive: true })
    .addFields({ fullName: { $concat: ['$firstName', ' ', '$lastName'] } })
    .projection({ _id: 1, fullName: 1, email: 1 })
    .build();
```
