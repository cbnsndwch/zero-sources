---
title: 'ExtractMutatorKeys type'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-contracts](./zero-contracts.md) &gt; [ExtractMutatorKeys](./zero-contracts.extractmutatorkeys.md)

## ExtractMutatorKeys type

**Signature:**

```typescript
type ExtractMutatorKeys<
    TContext extends ServerMutatorContext,
    Mutators extends ServerMutatorDefs<TContext>
> = {
    readonly [K in keyof Mutators]: Mutators[K] extends ServerMutatorImpl<TContext>
        ? K & string
        : keyof Mutators[K] extends string
          ? `${K & string}|${keyof Mutators[K] & string}`
          : never;
}[keyof Mutators];
```

**References:** [ServerMutatorContext](./zero-contracts.servermutatorcontext.md)<!-- -->, [ServerMutatorDefs](./zero-contracts.servermutatordefs.md)<!-- -->, [ServerMutatorImpl](./zero-contracts.servermutatorimpl.md)
