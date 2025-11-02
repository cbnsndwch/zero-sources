---
title: 'JsonColumnOptional type'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-nest-mongoose](./zero-nest-mongoose.md) &gt; [JsonColumnOptional](./zero-nest-mongoose.jsoncolumnoptional.md)

## JsonColumnOptional type

**Signature:**

```typescript
type JsonColumnOptional<T extends ReadonlyJSONValue = ReadonlyJSONValue> = {
    type: 'json';
    optional: true;
    customType: T;
};
```

**References:** [ReadonlyJSONValue](./zero-nest-mongoose.readonlyjsonvalue.md)
