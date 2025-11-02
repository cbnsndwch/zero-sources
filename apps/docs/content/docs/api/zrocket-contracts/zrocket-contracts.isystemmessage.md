---
title: 'ISystemMessage interface'
---

[Home](./index.md) &gt; [@cbnsndwch/zrocket-contracts](./zrocket-contracts.md) &gt; [ISystemMessage](./zrocket-contracts.isystemmessage.md)

## ISystemMessage interface

A message that is a control message or an event in the channel

**Signature:**

```typescript
interface ISystemMessage extends IMessageBase
```

**Extends:** [IMessageBase](./zrocket-contracts.imessagebase.md)

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

[data?](./zrocket-contracts.isystemmessage.data.md)

</td><td>

</td><td>

Dict

</td><td>

_(Optional)_ (Optional) Data associated with the system message. Schema depends on the type of system message and is not yet strictly enforced. This may change later one

</td></tr>
<tr><td>

[t](./zrocket-contracts.isystemmessage.t.md)

</td><td>

</td><td>

[SystemMessageType](./zrocket-contracts.systemmessagetype.md)

</td><td>

The type of system message

</td></tr>
</tbody></table>
