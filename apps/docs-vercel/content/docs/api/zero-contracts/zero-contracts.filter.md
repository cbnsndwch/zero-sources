---
title: 'Filter type'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-contracts](./zero-contracts.md) &gt; [Filter](./zero-contracts.filter.md)

## Filter type

A MongoDB-like filter can be some portion of the table-collection schema or a set of operators

**Signature:**

```typescript
type Filter<T> = RootFilterOperators<T> & {
    [K in keyof T]?: Condition<T[K]>;
};
```

**References:** [RootFilterOperators](./zero-contracts.rootfilteroperators.md)<!-- -->, [Condition](./zero-contracts.condition.md)
