import type { MessageAttachmentBase } from '../MessageAttachmentBase.js';

import type { IMessageFileAttachment } from './file-attachment.contract.js';
import type { IFileInfo } from './file-info.contract.js';

export type IMessageAudioAttachment = MessageAttachmentBase & {
    audio_url: string;
    audio_type: string;
    audio_size?: number;
    file?: IFileInfo;
};

export const isFileAudioAttachment = (
    attachment: IMessageFileAttachment
): attachment is IMessageAudioAttachment & { type: 'file' } => 'audio_url' in attachment;
