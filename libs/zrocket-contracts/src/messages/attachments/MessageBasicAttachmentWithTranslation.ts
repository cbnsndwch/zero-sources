import type { MessageAttachment } from './MessageAttachment.js';
import type { IMessageBasicAttachment } from './MessageBasicAttachment.js';

export interface IMessageBasicAttachmentWithTranslations extends IMessageBasicAttachment {
    translations: {
        [language: string]: string;
    };
}

export const isTranslatedAttachment = (
    attachment: MessageAttachment
): attachment is IMessageBasicAttachmentWithTranslations =>
    'translations' in attachment;

export const isTranslatedMessageAttachment = (
    attachments: MessageAttachment[]
): attachments is IMessageBasicAttachmentWithTranslations[] =>
    attachments?.some(isTranslatedAttachment);
