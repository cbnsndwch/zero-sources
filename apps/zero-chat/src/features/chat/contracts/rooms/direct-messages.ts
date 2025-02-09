import type { IRoomBase } from './room.contracts.js';

export interface IDirectMessagesRoom extends IRoomBase {
    /**
     * Direct Message rooms have their own type
     */
    t: 'd';

    /**
     * The IDs of the users in the room
     */
    memberIds: string[];

    /**
     * The usernames of the users in the room
     */
    usernames: string[];
}

/**
 * Determines if a given room is a direct message room.
 *
 * @param room - The room to check, which can be a partial IRoom or an IDirectMessageRoom.
 * @returns A boolean indicating whether the room is a direct message room.
 */
export function isDirectMessageRoom(
    room: Partial<IRoomBase> | IDirectMessagesRoom
): room is IDirectMessagesRoom {
    return room.t === 'd';
}
/**
 * Determines if the given room is a direct message room with multiple participants.
 *
 * @param room - The room to check, which can be either an IRoom or an IDirectMessageRoom.
 * @returns True if the room is a direct message room and has more than two participants, otherwise false.
 */
export function isMultipleDirectMessageRoom(
    room: IRoomBase | IDirectMessagesRoom
): room is IDirectMessagesRoom {
    return isDirectMessageRoom(room) && room.memberIds.length > 2;
}
