---
title: 'ZqliteWatermarkModule.forRootAsync() method'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-watermark-zqlite](./zero-watermark-zqlite.md) &gt; [ZqliteWatermarkModule](./zero-watermark-zqlite.zqlitewatermarkmodule.md) &gt; [forRootAsync](./zero-watermark-zqlite.zqlitewatermarkmodule.forrootasync.md)

## ZqliteWatermarkModule.forRootAsync() method

Use this method to configure and register the ZQLite-based watermark service.

\*\*NOTE:\*\* This is a global module, import a \*single\* instance in your app's top-level module.

**Signature:**

```typescript
static forRootAsync(options: ZqliteWatermarkModuleAsyncOptions): DynamicModule;
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

[ZqliteWatermarkModuleAsyncOptions](./zero-watermark-zqlite.zqlitewatermarkmoduleasyncoptions.md)

</td><td>

The options to configure the ZQLite database.

</td></tr>
</tbody></table>

**Returns:**

DynamicModule
