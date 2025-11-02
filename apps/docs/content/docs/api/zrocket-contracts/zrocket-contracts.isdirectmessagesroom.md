---
title: 'isDirectMessagesRoom() function'
---

[Home](./index.md) &gt; [@cbnsndwch/zrocket-contracts](./zrocket-contracts.md) &gt; [isDirectMessagesRoom](./zrocket-contracts.isdirectmessagesroom.md)

## isDirectMessagesRoom() function

Determines if a given room is a direct message room.

**Signature:**

```typescript
declare function isDirectMessagesRoom(
    room: Partial<IRoomBase> | IDirectMessagesRoom
): room is IDirectMessagesRoom;
```

## Parameters

<table><thead><tr><th>

Parameter

</th><th>

Type

</th><th>

Description

</th></tr></thead>
<tbody><tr><td>

room

</td><td>

Partial&lt;[IRoomBase](./zrocket-contracts.iroombase.md)<!-- -->&gt; \| [IDirectMessagesRoom](./zrocket-contracts.idirectmessagesroom.md)

</td><td>

The room to check, which can be a partial IRoom or an IDirectMessageRoom.

</td></tr>
</tbody></table>

**Returns:**

room is [IDirectMessagesRoom](./zrocket-contracts.idirectmessagesroom.md)

A boolean indicating whether the room is a direct message room.
