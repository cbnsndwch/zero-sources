/**
 * Room type enumeration
 */
export enum RoomType {
    /**
     * A direct messages room
     */
    DirectMessages = 'd',

    /**
     * A public group (nee: channel) room
     */
    PublicChannel = 'c',

    /**
     * A private group room
     */
    PrivateGroup = 'p'
}

export const ROOM_TYPES = [
    RoomType.DirectMessages,
    RoomType.PublicChannel,
    RoomType.PrivateGroup
] as const;

export function isRoomType(value: string): value is RoomType {
    return ROOM_TYPES.includes(value as RoomType);
}
