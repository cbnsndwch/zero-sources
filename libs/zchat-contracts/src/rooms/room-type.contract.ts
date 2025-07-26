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

export const ROOM_TYPES = [...Object.values(RoomType)] as const;
