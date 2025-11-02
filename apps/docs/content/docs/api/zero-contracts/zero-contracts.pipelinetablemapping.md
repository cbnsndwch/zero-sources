---
title: 'PipelineTableMapping interface'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-contracts](./zero-contracts.md) &gt; [PipelineTableMapping](./zero-contracts.pipelinetablemapping.md)

## PipelineTableMapping interface

Modern pipeline-based table mapping configuration.

This approach supports composable transformation stages similar to MongoDB's aggregation pipeline, enabling array unwinding, computed fields, and complex transformations.

Pipeline stages execute in array order, with projection applied last.

TTable - The target Zero table type (provides type hints for consumers)

**Signature:**

```typescript
interface PipelineTableMapping<TTable = Dict>
```

## Example

```typescript
const mapping: TableMapping<IAccountMember> = {
    source: 'accounts',
    pipeline: [
        { $match: { bundle: 'ENTERPRISE' } },
        { $unwind: '$members' },
        { $match: { 'members.role': { $in: ['admin', 'owner'] } } }
    ],
    projection: {
        _id: { $concat: ['$_id', '_', '$members.id'] },
        accountId: '$_id',
        userId: '$members.id',
        name: '$members.name',
        role: '$members.role'
    }
};
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

[filter?](./zero-contracts.pipelinetablemapping.filter.md)

</td><td>

</td><td>

never

</td><td>

_(Optional)_

</td></tr>
<tr><td>

[pipeline](./zero-contracts.pipelinetablemapping.pipeline.md)

</td><td>

</td><td>

[PipelineStage](./zero-contracts.pipelinestage.md)<!-- -->&lt;TTable&gt;\[\]

</td><td>

Aggregation pipeline stages executed in order before projection.

Stages are processed sequentially: 1. Each stage transforms the document 2. Stages execute in array order 3. Projection applies last (if specified)

Common patterns: - Filter before unwinding for performance: `[{ $match: ... }, { $unwind: ... }]` - Filter unwound elements: `[{ $unwind: ... }, { $match: ... }]` - Add computed fields: `[{ $addFields: ... }]`

</td></tr>
<tr><td>

[projection?](./zero-contracts.pipelinetablemapping.projection.md)

</td><td>

</td><td>

never

</td><td>

_(Optional)_

</td></tr>
<tr><td>

[source](./zero-contracts.pipelinetablemapping.source.md)

</td><td>

</td><td>

string

</td><td>

MongoDB collection name

</td></tr>
</tbody></table>
