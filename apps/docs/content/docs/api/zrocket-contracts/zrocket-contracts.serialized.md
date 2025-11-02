---
title: 'Serialized type'
---

[Home](./index.md) &gt; [@cbnsndwch/zrocket-contracts](./zrocket-contracts.md) &gt; [Serialized](./zrocket-contracts.serialized.md)

## Serialized type

The type of a value that was serialized via `JSON.stringify` and then deserialized via `JSON.parse`<!-- -->.

**Signature:**

```typescript
type Serialized<T> =
    T extends CustomSerializable<infer U>
        ? Serialized<U>
        : T extends [any, ...any]
          ? {
                [K in keyof T]: T extends UnserializablePrimitive
                    ? never
                    : Serialized<T[K]>;
            }
          : T extends any[]
            ? Serialized<T[number]>[]
            : T extends object
              ? {
                    [K in keyof T]: Serialized<T[K]>;
                }
              : T extends SerializablePrimitive
                ? T
                : T extends UnserializablePrimitive
                  ? undefined
                  : null;
```

**References:** [Serialized](./zrocket-contracts.serialized.md)
