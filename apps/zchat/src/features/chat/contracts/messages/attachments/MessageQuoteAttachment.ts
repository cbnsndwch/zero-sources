import type { SerializedEditorState } from 'lexical';

import type { MessageAttachment } from './MessageAttachment.js';
import type { MessageAttachmentBase } from './MessageAttachmentBase.js';

export type MessageQuoteAttachment = {
    author_name: string;
    author_link: string;
    author_icon: string;
    message_link?: string;
    text: string;

    md?: SerializedEditorState;

    // TODO this is causing issues to define a model, see @ts-expect-error at apps/meteor/app/api/server/v1/channels.ts:274
    attachments?: MessageAttachment[];
} & MessageAttachmentBase;

export const isQuoteAttachment = (
    attachment: MessageAttachment
): attachment is MessageQuoteAttachment =>
    'message_link' in attachment && attachment.message_link !== undefined;
