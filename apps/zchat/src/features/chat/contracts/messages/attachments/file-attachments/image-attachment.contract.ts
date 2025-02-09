import type { MessageAttachmentBase } from '../MessageAttachmentBase.js';

import type { IDimensions } from './dimensions.contract.js';

import type { IFileInfo } from './file-info.contract.js';
import type { IMessageFileAttachment } from './file-attachment.contract.js';

export type ImageAttachmentProps = {
    image_dimensions?: IDimensions;
    image_preview?: string;
    image_url: string;
    image_type?: string;
    image_size?: number;
    file?: IFileInfo;
} & MessageAttachmentBase;

export const isFileImageAttachment = (
    attachment: IMessageFileAttachment
): attachment is ImageAttachmentProps & { type: 'file' } => 'image_url' in attachment;
