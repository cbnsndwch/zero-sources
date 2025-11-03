---
title: 'IUserMessage interface'
---

[Home](./index.md) &gt; [@cbnsndwch/zrocket-contracts](./zrocket-contracts.md) &gt; [IUserMessage](./zrocket-contracts.iusermessage.md)

## IUserMessage interface

**Signature:**

```typescript
interface IUserMessage extends IMessageBase
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

[attachments?](./zrocket-contracts.iusermessage.attachments.md)

</td><td>

</td><td>

[MessageAttachment](./zrocket-contracts.messageattachment.md)<!-- -->\[\]

</td><td>

_(Optional)_ Attachments of the message, if any

</td></tr>
<tr><td>

[contents](./zrocket-contracts.iusermessage.contents.md)

</td><td>

</td><td>

SerializedEditorState

</td><td>

The message contents, in Lexical JSON format

</td></tr>
<tr><td>

[groupable?](./zrocket-contracts.iusermessage.groupable.md)

</td><td>

</td><td>

boolean

</td><td>

_(Optional)_ Whether the message can be grouped with other messages from the same user

</td></tr>
<tr><td>

[pinned?](./zrocket-contracts.iusermessage.pinned.md)

</td><td>

</td><td>

boolean

</td><td>

_(Optional)_ Whether the message is pinned in the room

</td></tr>
<tr><td>

[pinnedAt?](./zrocket-contracts.iusermessage.pinnedat.md)

</td><td>

</td><td>

Date

</td><td>

_(Optional)_ If the messages is pinned, the date and time it was pinned

</td></tr>
<tr><td>

[pinnedBy?](./zrocket-contracts.iusermessage.pinnedby.md)

</td><td>

</td><td>

[IUserSummary](./zrocket-contracts.iusersummary.md)

</td><td>

_(Optional)_ If the messages is pinned, the user who pinned it

</td></tr>
<tr><td>

[reactions?](./zrocket-contracts.iusermessage.reactions.md)

</td><td>

</td><td>

Record&lt;string, [IMessageReaction](./zrocket-contracts.imessagereaction.md)<!-- -->&gt;

</td><td>

_(Optional)_ A map of reaction emojis to the list of user ids that have reacted with that emoji

</td></tr>
<tr><td>

[repliedBy?](./zrocket-contracts.iusermessage.repliedby.md)

</td><td>

</td><td>

string\[\]

</td><td>

_(Optional)_ List of user ids that have replied to this message

</td></tr>
<tr><td>

[sender](./zrocket-contracts.iusermessage.sender.md)

</td><td>

</td><td>

Required&lt;[IUserSummary](./zrocket-contracts.iusersummary.md)<!-- -->&gt; &amp; Partial&lt;[IHasName](./zrocket-contracts.ihasname.md)<!-- -->&gt;

</td><td>

The user who sent the message

</td></tr>
<tr><td>

[starredBy?](./zrocket-contracts.iusermessage.starredby.md)

</td><td>

</td><td>

string\[\]

</td><td>

_(Optional)_ List of user ids that have reacted to this message

</td></tr>
<tr><td>

[unread?](./zrocket-contracts.iusermessage.unread.md)

</td><td>

</td><td>

boolean

</td><td>

_(Optional)_ Whether the message is has not been viewed by the users in the room

</td></tr>
</tbody></table>
