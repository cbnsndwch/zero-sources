---
title: 'ZqliteWatermarkService.getOrCreateWatermark() method'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-watermark-zqlite](./zero-watermark-zqlite.md) &gt; [ZqliteWatermarkService](./zero-watermark-zqlite.zqlitewatermarkservice.md) &gt; [getOrCreateWatermark](./zero-watermark-zqlite.zqlitewatermarkservice.getorcreatewatermark.md)

## ZqliteWatermarkService.getOrCreateWatermark() method

Retrieves an existing watermark for the given shard ID and resume token, or creates a new one if it does not exist.

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

The token used to resume from a specific point.

</td></tr>
</tbody></table>

**Returns:**

Promise&lt;string&gt;

A promise that resolves to the watermark string.
