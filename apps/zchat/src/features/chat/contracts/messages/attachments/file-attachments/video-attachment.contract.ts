import type { MessageAttachmentBase } from '../MessageAttachmentBase.js';

import type { IMessageFileAttachment } from './file-attachment.contract.js';
import type { IFileInfo } from './file-info.contract.js';

export type IMessageVideoAttachment = MessageAttachmentBase & {
    video_url: string;
    video_type: string;
    video_size: number;
    file?: IFileInfo;
};

export const isFileVideoAttachment = (
    attachment: IMessageFileAttachment
): attachment is IMessageVideoAttachment & { type: 'file' } => 'video_url' in attachment;
