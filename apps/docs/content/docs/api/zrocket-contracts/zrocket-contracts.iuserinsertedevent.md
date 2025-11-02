---
title: 'IUserInsertedEvent type'
---

[Home](./index.md) &gt; [@cbnsndwch/zrocket-contracts](./zrocket-contracts.md) &gt; [IUserInsertedEvent](./zrocket-contracts.iuserinsertedevent.md)

## IUserInsertedEvent type

**Signature:**

```typescript
type IUserInsertedEvent = IHasShortId & {
    type: 'inserted';
    data: IUser;
    diff?: never;
    unset?: never;
};
```

**References:** [IHasShortId](./zrocket-contracts.ihasshortid.md)<!-- -->, [IUser](./zrocket-contracts.iuser.md)
