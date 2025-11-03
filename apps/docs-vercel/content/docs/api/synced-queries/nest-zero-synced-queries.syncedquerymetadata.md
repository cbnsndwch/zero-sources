---
title: 'SyncedQueryMetadata interface'
---

[Home](./index.md) &gt; [@cbnsndwch/nest-zero-synced-queries](./nest-zero-synced-queries.md) &gt; [SyncedQueryMetadata](./nest-zero-synced-queries.syncedquerymetadata.md)

## SyncedQueryMetadata interface

Configuration for a synced query handler.

**Signature:**

```typescript
export interface SyncedQueryMetadata
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

[inputSchema](./nest-zero-synced-queries.syncedquerymetadata.inputschema.md)

</td><td>

</td><td>

z.ZodTypeAny

</td><td>

Zod schema for validating query input arguments. Should be a tuple schema matching the expected arguments.

</td></tr>
<tr><td>

[queryName](./nest-zero-synced-queries.syncedquerymetadata.queryname.md)

</td><td>

</td><td>

string

</td><td>

The name of the query as registered with Zero. Must match the query name used in client-side query definitions.

</td></tr>
</tbody></table>
