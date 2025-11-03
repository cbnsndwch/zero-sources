---
title: 'ServerMutatorImpl type'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-contracts](./zero-contracts.md) &gt; [ServerMutatorImpl](./zero-contracts.servermutatorimpl.md)

## ServerMutatorImpl type

Represents a server-side mutator function implementation.

TContext - The type of the context object expected by the mutator. TArgs - The type of the arguments expected by the mutator. Defaults to `any`<!-- -->.

**Signature:**

```typescript
type ServerMutatorImpl<TContext extends ServerMutatorContext, TArgs = any> = {
    (context: TContext, args: TArgs): Promise<void>;
};
```

**References:** [ServerMutatorContext](./zero-contracts.servermutatorcontext.md)
