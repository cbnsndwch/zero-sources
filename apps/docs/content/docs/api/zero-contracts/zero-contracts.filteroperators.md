---
title: 'FilterOperators type'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-contracts](./zero-contracts.md) &gt; [FilterOperators](./zero-contracts.filteroperators.md)

## FilterOperators type

**Signature:**

```typescript
type FilterOperators<T> = {
    $eq?: T;
    $ne?: T;
    $gt?: T;
    $gte?: T;
    $lt?: T;
    $lte?: T;
    $in?: ReadonlyArray<T>;
    $nin?: ReadonlyArray<T>;
    $not?: T extends string ? FilterOperators<T> | RegExp : FilterOperators<T>;
    $exists?: boolean;
    $regex?: T extends string ? RegExp | string : never;
    $options?: T extends string ? string : never;
    $all?: ReadonlyArray<any>;
    $size?: T extends ReadonlyArray<any> ? number : never;
};
```

**References:** [FilterOperators](./zero-contracts.filteroperators.md)
