---
title: 'SyncedQueryTransformService.transformQueries() method'
---

[Home](./index.md) &gt; [@cbnsndwch/nest-zero-synced-queries](./nest-zero-synced-queries.md) &gt; [SyncedQueryTransformService](./nest-zero-synced-queries.syncedquerytransformservice.md) &gt; [transformQueries](./nest-zero-synced-queries.syncedquerytransformservice.transformqueries.md)

## SyncedQueryTransformService.transformQueries() method

Transform multiple query requests in parallel.

**Signature:**

```typescript
transformQueries(request: any, input: TransformRequestBody): Promise<TransformQueryResult[]>;
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

request

</td><td>

any

</td><td>

The full Express/HTTP request object

</td></tr>
<tr><td>

input

</td><td>

[TransformRequestBody](./nest-zero-synced-queries.transformrequestbody.md)

</td><td>

Array of query requests from Zero cache

</td></tr>
</tbody></table>

**Returns:**

Promise&lt;[TransformQueryResult](./nest-zero-synced-queries.transformqueryresult.md)<!-- -->\[\]&gt;

Array of query responses (success or error)

## Remarks

This method processes multiple queries in parallel for performance. Each query is executed independently and errors are isolated to individual query responses rather than failing the entire request.

The full request object is passed through to guards so they can access headers, cookies, and other request properties.
