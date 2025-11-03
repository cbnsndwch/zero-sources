---
title: 'UnwrapOptional type'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-nest-mongoose](./zero-nest-mongoose.md) &gt; [UnwrapOptional](./zero-nest-mongoose.unwrapoptional.md)

## UnwrapOptional type

**Signature:**

```typescript
type UnwrapOptional<
    T,
    K extends keyof T,
    TOptional = true,
    TRequired = false
> = undefined extends T[K]
    ? {} extends Pick<T, K>
        ? TOptional
        : TRequired
    : TRequired;
```
