import type { IFileInfo } from './file-attachments/index.js';

import type { IMessageFileAttachment } from './file-attachments/file-attachment.contract.js';
import type { IMessageBasicAttachment } from './MessageBasicAttachment.js';
import type { MessageQuoteAttachment } from './MessageQuoteAttachment.js';

export type MessageAttachment =
    | IMessageBasicAttachment
    | MessageQuoteAttachment
    | IMessageFileAttachment;

export type FilesAndAttachments = {
    files: IFileInfo[];
    attachments: MessageAttachment[];
};
