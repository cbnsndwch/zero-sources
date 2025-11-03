---
title: 'SyncedQueryRegistry.getHandler() method'
---

[Home](./index.md) &gt; [@cbnsndwch/nest-zero-synced-queries](./nest-zero-synced-queries.md) &gt; [SyncedQueryRegistry](./nest-zero-synced-queries.syncedqueryregistry.md) &gt; [getHandler](./nest-zero-synced-queries.syncedqueryregistry.gethandler.md)

## SyncedQueryRegistry.getHandler() method

Get a registered handler by query name.

**Signature:**

```typescript
getHandler(queryName: string): RegisteredQueryHandler | undefined;
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

queryName

</td><td>

string

</td><td>

The name of the query to look up

</td></tr>
</tbody></table>

**Returns:**

[RegisteredQueryHandler](./nest-zero-synced-queries.registeredqueryhandler.md) \| undefined

The registered handler or undefined if not found
