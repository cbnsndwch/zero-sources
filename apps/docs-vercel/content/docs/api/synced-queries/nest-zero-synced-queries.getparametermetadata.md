---
title: 'getParameterMetadata() function'
---

[Home](./index.md) &gt; [@cbnsndwch/nest-zero-synced-queries](./nest-zero-synced-queries.md) &gt; [getParameterMetadata](./nest-zero-synced-queries.getparametermetadata.md)

## getParameterMetadata() function

Get parameter metadata for a method.

**Signature:**

```typescript
export declare function getParameterMetadata(
    target: any,
    propertyKey: string | symbol
): SyncedQueryParamMetadata[];
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

target

</td><td>

any

</td><td>

The target object (class prototype)

</td></tr>
<tr><td>

propertyKey

</td><td>

string \| symbol

</td><td>

The method name

</td></tr>
</tbody></table>

**Returns:**

[SyncedQueryParamMetadata](./nest-zero-synced-queries.syncedqueryparammetadata.md)<!-- -->\[\]

Array of parameter metadata, sorted by parameter index
