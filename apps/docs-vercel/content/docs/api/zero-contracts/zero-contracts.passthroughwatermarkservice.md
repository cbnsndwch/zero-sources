---
title: 'PassthroughWatermarkService class'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-contracts](./zero-contracts.md) &gt; [PassthroughWatermarkService](./zero-contracts.passthroughwatermarkservice.md)

## PassthroughWatermarkService class

A watermark service that simply passes through the watermark and resume token values it receives. Useful for testing or when no special mapping is needed between zero-cache watermarks and the change source's native resume token format.

**Signature:**

```typescript
declare class PassthroughWatermarkService implements IWatermarkService
```

**Implements:** [IWatermarkService](./zero-contracts.iwatermarkservice.md)

## Methods

<table><thead><tr><th>

Method

</th><th>

Modifiers

</th><th>

Description

</th></tr></thead>
<tbody><tr><td>

[getOrCreateWatermark(\_shardId, resumeToken)](./zero-contracts.passthroughwatermarkservice.getorcreatewatermark.md)

</td><td>

</td><td>

</td></tr>
<tr><td>

[getResumeToken(\_shardId, watermark)](./zero-contracts.passthroughwatermarkservice.getresumetoken.md)

</td><td>

</td><td>

</td></tr>
</tbody></table>
