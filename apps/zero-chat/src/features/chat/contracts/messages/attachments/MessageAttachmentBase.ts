import type { SerializedEditorState } from 'lexical';

export type MessageAttachmentBase = {
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
