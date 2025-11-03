---
title: 'NatsKvWatermarkModule.forRootAsync() method'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-watermark-nats-kv](./zero-watermark-nats-kv.md) &gt; [NatsKvWatermarkModule](./zero-watermark-nats-kv.natskvwatermarkmodule.md) &gt; [forRootAsync](./zero-watermark-nats-kv.natskvwatermarkmodule.forrootasync.md)

## NatsKvWatermarkModule.forRootAsync() method

Use this method to configure and register the ZQLite-based watermark service.

\*\*NOTE:\*\* This is a global module, import a \*single\* instance in your app's top-level module.

**Signature:**

```typescript
static forRootAsync(options: NatsKvWatermarkModuleAsyncOptions): DynamicModule;
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

options

</td><td>

[NatsKvWatermarkModuleAsyncOptions](./zero-watermark-nats-kv.natskvwatermarkmoduleasyncoptions.md)

</td><td>

The options to configure the ZQLite database.

</td></tr>
</tbody></table>

**Returns:**

DynamicModule
