import type {
    ROOM_TYPE_PRIVATE_GROUP,
    ROOM_TYPE_PUBLIC_GROUP
} from './room-type.contract.js';
import type { IRoomBase } from './room.contracts.js';

/**
 * Represents the base structure for a group room.
 */
export type IGroupRoomBase = IRoomBase & {
    /**
     * Indicates if the room is read-only.
     */
    readOnly?: boolean;

    /**
     * Indicates if the room is featured.
     */
    featured?: true;

    /**
     * Indicates if the room is the default room.
     */
    default?: boolean;

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
     * Indicates if the room is archived.
     */
    archived?: boolean;
};

export type IPublicGroupRoom = IGroupRoomBase & {
    t: typeof ROOM_TYPE_PUBLIC_GROUP;
};

export function isPublicGroupRoom(
    room: Partial<IRoomBase>
): room is IPublicGroupRoom {
    return room.t === 'c';
}

export type IPrivateGroupRoom = IGroupRoomBase & {
    t: typeof ROOM_TYPE_PRIVATE_GROUP;
};

export function isPrivateGroupRoom(
    room: Partial<IRoomBase>
): room is IPrivateGroupRoom {
    return room.t === 'p';
}
