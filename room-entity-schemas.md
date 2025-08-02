# Room Entity Schema Contracts

This document contains all TypeScript interfaces and types that define the schema of room entities.

## Base Types

### Entity Base Types
```typescript
export type IHasId = {
    _id: string;
};

export type IHasCreatedAt = {
    createdAt: Date;
};

export type IHasUpdatedAt = {
    updatedAt: Date;
};

export type IEntityBase = IHasId & IHasCreatedAt & IHasUpdatedAt;
```

### Message Base Interface
```typescript
export interface IMessageBase extends IEntityBase {
    /**
     * The room id this message belongs to
     */
    roomId: string;

    /**
     * Whether to hide the message from the UI
     */
    hidden?: boolean;
}
```

## Room Type Enums

### Room Type Enumeration
```typescript
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
```

### System Message Types
```typescript
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
     */
    USER_REMOVED = 'USER_REMOVED',

    /**
     * System Message: a user was added to the room by an admin/manager
     */
    USER_ADDED = 'USER_ADDED'
}

/**
 * Message change message types
 */
export enum MessageChangeMessageType {
    /**
     * System Message: a message was deleted
     */
    MESSAGE_DELETED = 'MESSAGE_DELETED',

    /**
     * System Message: a message was pinned
     */
    MESSAGE_PINNED = 'MESSAGE_PINNED'
}

/**
 * Room change message types
 */
export enum RoomChangeMessageType {
    /**
     * System Message: a room was renamed
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

export type SystemMessageType =
    | UserRoomChangeMessageType
    | MessageChangeMessageType
    | RoomChangeMessageType;
```

## Room Interfaces

### Base Room Interface
```typescript
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
```

### Direct Messages Room
```typescript
export type IDirectMessagesRoom = IRoomBase<RoomType.DirectMessages>;
```

### Group Room Base
```typescript
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
```

### Public Channel Room
```typescript
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
```

### Private Group Room
```typescript
export type IPrivateGroupRoom = IGroupRoomBase<RoomType.PrivateGroup>;
```

## Type Guards

### Direct Messages Type Guards
```typescript
/**
 * Determines if a given room is a direct message room.
 */
export function isDirectMessagesRoom(
    room: Partial<IRoomBase> | IDirectMessagesRoom
): room is IDirectMessagesRoom {
    return room.t === RoomType.DirectMessages;
}

/**
 * Determines if the given room is a direct message room with multiple participants.
 */
export function isMultiDirectMessagesRoom(
    room: IRoomBase | IDirectMessagesRoom
): room is IDirectMessagesRoom {
    return isDirectMessagesRoom(room) && room.memberIds.length > 2;
}
```

### Group Room Type Guards
```typescript
export function isPublicGroupRoom(
    room: Partial<IRoomBase>
): room is IPublicChannelRoom {
    return room.t === RoomType.PublicChannel;
}

export function isPrivateGroupRoom(
    room: Partial<IRoomBase>
): room is IPrivateGroupRoom {
    return room.t === RoomType.PrivateGroup;
}
```

## Union Types

### All Room Types
```typescript
export type IRoom = IDirectMessagesRoom | IPublicChannelRoom | IPrivateGroupRoom;
```

## Summary

The room entity schema is organized around a discriminated union pattern with three main room types:

1. **Direct Messages** (`RoomType.DirectMessages = 'd'`) - Simple chat rooms between users
2. **Public Channels** (`RoomType.PublicChannel = 'c'`) - Named rooms that can be featured and set as default
3. **Private Groups** (`RoomType.PrivateGroup = 'p'`) - Named private rooms

All rooms share a common base structure (`IRoomBase`) that includes:
- Basic entity properties (_id, createdAt, updatedAt)
- Room type discriminator (`t`)
- User membership data (memberIds, usernames)  
- Message cache data (messageCount, lastMessage, lastMessageAt)
- Optional system message types

Group rooms (both public channels and private groups) extend the base with additional properties like name, topic, description, readOnly flag, and archived status.
