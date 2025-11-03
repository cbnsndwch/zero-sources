---
title: 'TableNames type'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-contracts](./zero-contracts.md) &gt; [TableNames](./zero-contracts.tablenames.md)

## TableNames type

**Signature:**

```typescript
type TableNames<
    TTables extends readonly TableBuilderWithColumns<TableSchema>[]
> = TTables[number]['schema']['name'];
```
