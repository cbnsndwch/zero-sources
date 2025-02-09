/**
 * A direct messages room
 */
export const ROOM_TYPE_DIRECT_MESSAGES = 'd';

/**
 * A public group (nee: channel) room
 */
export const ROOM_TYPE_PUBLIC_GROUP = 'c';

/**
 * A private group room
 */
export const ROOM_TYPE_PRIVATE_GROUP = 'p';

export const ROOM_TYPES = [
    ROOM_TYPE_DIRECT_MESSAGES,
    ROOM_TYPE_PUBLIC_GROUP,
    ROOM_TYPE_PRIVATE_GROUP
] as const;

export type RoomType = (typeof ROOM_TYPES)[number];
