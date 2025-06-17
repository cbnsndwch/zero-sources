import type { MessageAttachmentBase } from '../MessageAttachmentBase.js';
import type { IMessageAudioAttachment } from './audio-attachment.contracts.js';
import type { ImageAttachmentProps } from './image-attachment.contract.js';
import type { IMessageVideoAttachment } from './video-attachment.contract.js';

export type IMessageFileAttachment =
    | ({ type: 'file' } & IMessageVideoAttachment)
    | ({ type: 'file' } & ImageAttachmentProps)
    | ({ type: 'file' } & IMessageAudioAttachment)
    | ({ type: 'file' } & MessageAttachmentBase);

export const isFileAttachment = (
    attachment: MessageAttachmentBase
): attachment is IMessageFileAttachment =>
    'type' in attachment && (attachment as Dict).type === 'file';
