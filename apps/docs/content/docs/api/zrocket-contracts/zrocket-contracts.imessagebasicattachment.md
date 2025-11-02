---
title: 'IMessageBasicAttachment type'
---

[Home](./index.md) &gt; [@cbnsndwch/zrocket-contracts](./zrocket-contracts.md) &gt; [IMessageBasicAttachment](./zrocket-contracts.imessagebasicattachment.md)

## IMessageBasicAttachment type

**Signature:**

```typescript
type IMessageBasicAttachment = {
    author_icon?: string;
    author_link?: string;
    author_name?: string;
    fields?: FieldProps[];
    image_url?: string;
    image_dimensions?: IDimensions;
    mrkdwn_in?: Array<MarkdownFields>;
    pretext?: string;
    text?: string;
    md?: SerializedEditorState;
    thumb_url?: string;
    color?: string;
} & MessageAttachmentBase;
```

**References:** [FieldProps](./zrocket-contracts.fieldprops.md)<!-- -->, [IDimensions](./zrocket-contracts.idimensions.md)<!-- -->, [MarkdownFields](./zrocket-contracts.markdownfields.md)<!-- -->, [MessageAttachmentBase](./zrocket-contracts.messageattachmentbase.md)
