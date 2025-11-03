---
title: 'IMessageAudioAttachment type'
---

[Home](./index.md) &gt; [@cbnsndwch/zrocket-contracts](./zrocket-contracts.md) &gt; [IMessageAudioAttachment](./zrocket-contracts.imessageaudioattachment.md)

## IMessageAudioAttachment type

**Signature:**

```typescript
type IMessageAudioAttachment = MessageAttachmentBase & {
    audio_url: string;
    audio_type: string;
    audio_size?: number;
    file?: IFileInfo;
};
```

**References:** [MessageAttachmentBase](./zrocket-contracts.messageattachmentbase.md)<!-- -->, [IFileInfo](./zrocket-contracts.ifileinfo.md)
