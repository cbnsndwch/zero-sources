---
title: 'IWatermarkService.getOrCreateWatermark() method'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-contracts](./zero-contracts.md) &gt; [IWatermarkService](./zero-contracts.iwatermarkservice.md) &gt; [getOrCreateWatermark](./zero-contracts.iwatermarkservice.getorcreatewatermark.md)

## IWatermarkService.getOrCreateWatermark() method

Retrieves an existing watermark for the given shard ID and a change source's native resume token value, or creates a new one if one cannot be retrieved.

**Signature:**

```typescript
getOrCreateWatermark(shardId: string, resumeToken: string): Promise<string>;
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

shardId

</td><td>

string

</td><td>

The identifier for the shard.

</td></tr>
<tr><td>

resumeToken

</td><td>

string

</td><td>

The resume token in the change source's native format.

</td></tr>
</tbody></table>

**Returns:**

Promise&lt;string&gt;

A promise that resolves to the watermark string.
