---
title: 'MessageAttachmentBase type'
---

[Home](./index.md) &gt; [@cbnsndwch/zrocket-contracts](./zrocket-contracts.md) &gt; [MessageAttachmentBase](./zrocket-contracts.messageattachmentbase.md)

## MessageAttachmentBase type

**Signature:**

```typescript
type MessageAttachmentBase = {
    id?: string;
    title?: string;
    ts?: Date;
    collapsed?: boolean;
    description?: string;
    descriptionMd?: SerializedEditorState;
    text?: string;
    md?: SerializedEditorState;
    size?: number;
    format?: string;
    title_link?: string;
    title_link_download?: boolean;
    hashes?: {
        sha256: string;
    };
};
```
