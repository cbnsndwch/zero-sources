import type { SerializedEditorState } from 'lexical';

import type { FieldProps } from './FieldProps.js';
import type { IDimensions } from './file-attachments/dimensions.contract.js';
import type { MessageAttachmentBase } from './MessageAttachmentBase.js';

export type MarkdownFields = 'text' | 'pretext' | 'fields';

export type IMessageBasicAttachment = {
    author_icon?: string;
    author_link?: string;
    author_name?: string;

    fields?: FieldProps[];

    // footer
    // footer_icon

    image_url?: string;
    image_dimensions?: IDimensions;

    mrkdwn_in?: Array<MarkdownFields>;
    pretext?: string;

    text?: string;
    md?: SerializedEditorState;

    thumb_url?: string;

    color?: string;
} & MessageAttachmentBase;
