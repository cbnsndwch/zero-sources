import { RoomType } from './room-type.contract.js';
import type { IRoomBase } from './room-base.contracts.js';

/**
 * Represents the base structure for a group room.
 */
export type IGroupRoomBase<
    TType extends RoomType.PrivateGroup | RoomType.PublicChannel
> = IRoomBase<TType> & {
    /**
     * The name of the room.
     */
    name: string;

    /**
     * The topic of the room.
     */
    topic?: string;

    /**
     * The description of the room.
     */
    description?: string;

    /**
     * Indicates if the room is read-only.
     */
    readOnly?: boolean;

    /**
     * Indicates if the room is archived.
     */
    archived?: boolean;
};

export type IPublicChannelRoom = IGroupRoomBase<RoomType.PublicChannel> & {
    /**
     * Indicates whether new users should be automatically added to the room.
     */
    default?: boolean;

    /**
     * Indicates the room should be publicly highlighted.
     */
    featured?: boolean;
};

export function isPublicGroupRoom(
    room: Partial<IRoomBase>
): room is IPublicChannelRoom {
    return room.t === RoomType.PublicChannel;
}

export type IPrivateGroupRoom = IGroupRoomBase<RoomType.PrivateGroup>;

export function isPrivateGroupRoom(
    room: Partial<IRoomBase>
): room is IPrivateGroupRoom {
    return room.t === RoomType.PrivateGroup;
}
