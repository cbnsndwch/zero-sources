//#region User System Messages

/**
 * User room change message types
 */
export enum UserRoomChangeMessageType {
    /**
     * System Message: a user joined the room
     */
    USER_JOINED = 'USER_JOINED',

    /**
     * System Message: a user left the room
     */
    USER_LEFT = 'USER_LEFT',

    /**
     * System Message: a user was removed from the room by an admin/manager
     *
     * @remarks in RC: `ru`
     */
    USER_REMOVED = 'USER_REMOVED',

    /**
     * System Message: a user was added to the room by an admin/manager
     *
     * @remarks in RC: `au`
     */
    USER_ADDED = 'USER_ADDED'
}

export const USER_ROOM_CHANGE_MESSAGE_TYPES = [
    UserRoomChangeMessageType.USER_JOINED,
    UserRoomChangeMessageType.USER_LEFT,
    UserRoomChangeMessageType.USER_REMOVED,
    UserRoomChangeMessageType.USER_ADDED
] as const;

//#endregion User System Messages

//#region Message Status Changes

/**
 * Message change message types
 */
export enum MessageChangeMessageType {
    /**
     * System Message: a message was deleted
     *
     * @remarks in RC: `rm`
     */
    MESSAGE_DELETED = 'MESSAGE_DELETED',

    /**
     * System Message: a message was pinned
     */
    MESSAGE_PINNED = 'MESSAGE_PINNED'
}

export const MESSAGE_CHANGE_MESSAGE_TYPES = [
    MessageChangeMessageType.MESSAGE_DELETED,
    MessageChangeMessageType.MESSAGE_PINNED
] as const;

//#endregion Message Status Changes

//#region Room Changes

/**
 * Room change message types
 */
export enum RoomChangeMessageType {
    /**
     * System Message: a room was renamed
     *
     * @remarks in RC: `r`
     */
    ROOM_RENAMED = 'ROOM_RENAMED',

    /**
     * System Message: a room was archived
     */
    ROOM_ARCHIVED = 'ROOM_ARCHIVED',

    /**
     * System Message: a room that was previously archived was restored
     */
    ROOM_UNARCHIVED = 'ROOM_UNARCHIVED',

    /**
     * System Message: a room's privacy was changed
     */
    ROOM_CHANGED_PRIVACY = 'ROOM_CHANGED_PRIVACY',

    /**
     * System Message: a room's description was changed
     */
    ROOM_CHANGED_DESCRIPTION = 'ROOM_CHANGED_DESCRIPTION',

    /**
     * System Message: a room's avatar was changed
     */
    ROOM_CHANGED_AVATAR = 'ROOM_CHANGED_AVATAR',

    /**
     * System Message: a room's topic was changed
     */
    ROOM_CHANGED_TOPIC = 'ROOM_CHANGED_TOPIC',

    /**
     * System Message: a room was set to read-only
     */
    ROOM_REMOVED_READ_ONLY = 'ROOM_REMOVED_READ_ONLY',

    /**
     * System Message: a room that was previously set to read-only was made writable again
     */
    ROOM_SET_READ_ONLY = 'ROOM_SET_READ_ONLY',

    /**
     * System Message: a room was set to allow reactions
     */
    ROOM_ALLOWED_REACTING = 'ROOM_ALLOWED_REACTING',

    /**
     * System Message: a room was set to disallow reactions
     */
    ROOM_DISALLOWED_REACTING = 'ROOM_DISALLOWED_REACTING',

    /**
     * System Message: a room moderator was added
     */
    ROOM_MODERATOR_ADDED = 'ROOM_MODERATOR_ADDED',

    /**
     * System Message: a room moderator was removed
     */
    ROOM_MODERATOR_REMOVED = 'ROOM_MODERATOR_REMOVED',

    /**
     * System Message: a room owner was added
     */
    ROOM_OWNER_ADDED = 'ROOM_OWNER_ADDED',

    /**
     * System Message: a room owner was removed
     */
    ROOM_OWNER_REMOVED = 'ROOM_OWNER_REMOVED'
}

export const ROOM_CHANGE_MESSAGE_TYPES = [
    RoomChangeMessageType.ROOM_RENAMED,
    RoomChangeMessageType.ROOM_ARCHIVED,
    RoomChangeMessageType.ROOM_UNARCHIVED,
    RoomChangeMessageType.ROOM_CHANGED_PRIVACY,
    RoomChangeMessageType.ROOM_CHANGED_DESCRIPTION,
    RoomChangeMessageType.ROOM_CHANGED_AVATAR,
    RoomChangeMessageType.ROOM_CHANGED_TOPIC,
    RoomChangeMessageType.ROOM_REMOVED_READ_ONLY,
    RoomChangeMessageType.ROOM_SET_READ_ONLY,
    RoomChangeMessageType.ROOM_ALLOWED_REACTING,
    RoomChangeMessageType.ROOM_DISALLOWED_REACTING,
    RoomChangeMessageType.ROOM_MODERATOR_ADDED,
    RoomChangeMessageType.ROOM_MODERATOR_REMOVED,
    RoomChangeMessageType.ROOM_OWNER_ADDED,
    RoomChangeMessageType.ROOM_OWNER_REMOVED
] as const;

//#endregion Room Changes

//#region System Messages

export type SystemMessageType =
    | UserRoomChangeMessageType
    | MessageChangeMessageType
    | RoomChangeMessageType;

export const SYSTEM_MESSAGE_TYPES = [
    ...USER_ROOM_CHANGE_MESSAGE_TYPES,
    ...MESSAGE_CHANGE_MESSAGE_TYPES,
    ...USER_ROOM_CHANGE_MESSAGE_TYPES
] as const;

//#endregion System Messages

//#region User Messages

export enum UserMessageType {
    USER = 'USER'
}

export const USER_MESSAGE_TYPES = [UserMessageType.USER] as const;

//#endregion User Messages

//#region All message types

export type MessageType = UserMessageType | SystemMessageType;

export const MESSAGE_TYPES = [
    ...SYSTEM_MESSAGE_TYPES,
    UserMessageType.USER
] as const;

//#endregion All message types
