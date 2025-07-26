import type { IEntityBase } from '../common/index.js';

export interface IMessageBase extends IEntityBase {
    /**
     * The room id this message belongs to
     */
    roomId: string;

    /**
     * Whether to hide the message from the UI
     */
    hidden?: boolean;
}
