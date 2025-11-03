---
title: 'JSONObject type'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-nest-mongoose](./zero-nest-mongoose.md) &gt; [JSONObject](./zero-nest-mongoose.jsonobject.md)

## JSONObject type

A JSON object. This is a map from strings to JSON values or `undefined`<!-- -->. We allow `undefined` values as a convenience... but beware that the `undefined` values do not round trip to the server. For example:

```
// Time t1
await tx.set('a', {a: undefined});

// time passes, in a new transaction
const v = await tx.get('a');
console.log(v); // either {a: undefined} or {}
```

**Signature:**

```typescript
type JSONObject = {
    [key: string]: JSONValue | undefined;
};
```

**References:** [JSONValue](./zero-nest-mongoose.jsonvalue.md)
