---
title: 'IThreadMessage interface'
---

[Home](./index.md) &gt; [@cbnsndwch/zrocket-contracts](./zrocket-contracts.md) &gt; [IThreadMessage](./zrocket-contracts.ithreadmessage.md)

## IThreadMessage interface

**Signature:**

```typescript
interface IThreadMessage extends IUserMessage
```

**Extends:** [IUserMessage](./zrocket-contracts.iusermessage.md)

## Properties

<table><thead><tr><th>

Property

</th><th>

Modifiers

</th><th>

Type

</th><th>

Description

</th></tr></thead>
<tbody><tr><td>

[shouldShowInRoom?](./zrocket-contracts.ithreadmessage.shouldshowinroom.md)

</td><td>

</td><td>

boolean

</td><td>

_(Optional)_ Whether this thread message should also be displayed in the main chat at the same time it was sent, in addition to being displayed in the thread

</td></tr>
<tr><td>

[threadId](./zrocket-contracts.ithreadmessage.threadid.md)

</td><td>

</td><td>

string

</td><td>

The message ID of the message that started the thread this message belongs to

</td></tr>
</tbody></table>
