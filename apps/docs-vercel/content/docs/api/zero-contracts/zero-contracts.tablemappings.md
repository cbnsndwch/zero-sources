---
title: 'TableMappings type'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-contracts](./zero-contracts.md) &gt; [TableMappings](./zero-contracts.tablemappings.md)

## TableMappings type

**Signature:**

```typescript
type TableMappings<
    TTables extends readonly TableBuilderWithColumns<TableSchema>[]
> = Record<TableNames<TTables>, TableMapping<unknown>>;
```

**References:** [TableNames](./zero-contracts.tablenames.md)<!-- -->, [TableMapping](./zero-contracts.tablemapping.md)
