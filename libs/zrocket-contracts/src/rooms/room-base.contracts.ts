import type { IEntityBase } from '../common/index.js';
import type { SystemMessageType } from '../messages/index.js';
import type { IMessageBase } from '../messages/message-base.contract.js';

import type { RoomType } from './room-type.enum.js';

/**
 * A base data contract for room entities.
 */
export interface IRoomBase<TType extends RoomType = RoomType>
    extends IEntityBase {
    /**
     * The type of the room.
     */
    t: TType;

    /**
     * The message types that should be treated as system messages for this room.
     */
    systemMessages?: SystemMessageType[];

    //#region User Cache

    /**
     * The IDs of the users in the room.
     */
    memberIds: string[];

    /**
     * The usernames of the users in the room
     */
    usernames: string[];

    //#endregion User Cache

    //#region Message Cache

    /**
     * The total number of messages in the room.
     */
    messageCount: number;

    /**
     * The last message sent in the room.
     */
    lastMessage?: IMessageBase;

    /**
     * The timestamp of the last message sent in the room.
     */
    lastMessageAt?: Date;

    //#endregion Message Cache
}
