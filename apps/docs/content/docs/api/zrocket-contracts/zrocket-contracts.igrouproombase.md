---
title: 'IGroupRoomBase type'
---

[Home](./index.md) &gt; [@cbnsndwch/zrocket-contracts](./zrocket-contracts.md) &gt; [IGroupRoomBase](./zrocket-contracts.igrouproombase.md)

## IGroupRoomBase type

Represents the base structure for a group room.

**Signature:**

```typescript
type IGroupRoomBase<
    TType extends RoomType.PrivateGroup | RoomType.PublicChannel
> = IRoomBase<TType> & {
    name: string;
    topic?: string;
    description?: string;
    readOnly?: boolean;
    archived?: boolean;
};
```

**References:** [RoomType.PrivateGroup](./zrocket-contracts.roomtype.md)<!-- -->, [RoomType.PublicChannel](./zrocket-contracts.roomtype.md)<!-- -->, [IRoomBase](./zrocket-contracts.iroombase.md)
