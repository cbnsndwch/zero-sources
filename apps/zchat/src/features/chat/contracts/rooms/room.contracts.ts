import type { IEntityBase } from '../../../../common/contracts/index.js';
import type { IMessage } from '../messages/message.contracts.js';
import type { SystemMessageType } from '../messages/message-type.contracts.js';

import type { RoomType } from './room-type.contract.js';

/**
 * A base data contract for room entities.
 */
export interface IRoomBase extends IEntityBase {
    /**
     * The type of the room.
     */
    t: RoomType;

    /**
     * The message types that should be treated as system messages for this room.
     */
    systemMessages?: SystemMessageType[];

    //#region User Cache

    /**
     * The IDs of the users in the room.
     */
    memberIds: string[];

    //#endregion User Cache

    //#region Message Cache

    /**
     * The total number of messages in the room.
     */
    messageCount: number;

    /**
     * The last message sent in the room.
     */
    lastMessage?: IMessage;

    /**
     * The timestamp of the last message sent in the room.
     */
    lastMessageAt?: Date;

    //#endregion Message Cache
}
