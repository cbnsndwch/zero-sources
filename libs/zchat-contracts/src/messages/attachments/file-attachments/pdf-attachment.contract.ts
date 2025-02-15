import type { MessageAttachmentBase } from '../MessageAttachmentBase.js';

import type { IFileInfo } from './file-info.contract.js';

export type IMessagePdfAttachment = MessageAttachmentBase & {
    file: IFileInfo;
};
