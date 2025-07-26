import { RoomType } from './room-type.enum.js';
import type { IRoomBase } from './room-base.contracts.js';

export type IDirectMessagesRoom = IRoomBase<RoomType.DirectMessages>;

/**
 * Determines if a given room is a direct message room.
 *
 * @param room - The room to check, which can be a partial IRoom or an IDirectMessageRoom.
 * @returns A boolean indicating whether the room is a direct message room.
 */
export function isDirectMessagesRoom(
    room: Partial<IRoomBase> | IDirectMessagesRoom
): room is IDirectMessagesRoom {
    return room.t === RoomType.DirectMessages;
}

/**
 * Determines if the given room is a direct message room with multiple participants.
 *
 * @param room - The room to check, which can be either an IRoom or an IDirectMessageRoom.
 * @returns True if the room is a direct message room and has more than two participants, otherwise false.
 */
export function isMultiDirectMessagesRoom(
    room: IRoomBase | IDirectMessagesRoom
): room is IDirectMessagesRoom {
    return isDirectMessagesRoom(room) && room.memberIds.length > 2;
}
