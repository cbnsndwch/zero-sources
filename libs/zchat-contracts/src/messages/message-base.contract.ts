import type { IEntityBase } from '../common/index.js';

export interface IMessageBase extends IEntityBase {
    /**
     * The room id this message belongs to
     */
    roomId: string;

    /**
     * The date and time the message was sent
     */
    ts: Date;

    /**
     * Whether to hide the message from the UI
     */
    hidden?: boolean;
}
