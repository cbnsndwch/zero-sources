---
title: 'IWatermarkService interface'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-contracts](./zero-contracts.md) &gt; [IWatermarkService](./zero-contracts.iwatermarkservice.md)

## IWatermarkService interface

Data contract for a Watermark-to-Resume-Token mapping service.

Provides an simple API to convert MongoDB change stream resume tokens to Zero watermark strings and vice versa.

**Signature:**

```typescript
interface IWatermarkService
```

## Methods

<table><thead><tr><th>

Method

</th><th>

Description

</th></tr></thead>
<tbody><tr><td>

[getOrCreateWatermark(shardId, resumeToken)](./zero-contracts.iwatermarkservice.getorcreatewatermark.md)

</td><td>

Retrieves an existing watermark for the given shard ID and a change source's native resume token value, or creates a new one if one cannot be retrieved.

</td></tr>
<tr><td>

[getResumeToken(shardId, watermark)](./zero-contracts.iwatermarkservice.getresumetoken.md)

</td><td>

Retrieves the change source's native resume token for a given shard Id and watermark value.

</td></tr>
</tbody></table>
