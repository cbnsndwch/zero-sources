# User Entity Schema Contracts

This document contains all TypeScript interfaces and types that define the schema of user entities.

## Base Types

### Entity Base Types

```typescript
export type IHasId = {
    _id: string;
};

export type IHasShortId = {
    id: string;
};

export type IHasCreatedAt = {
    createdAt: Date;
};

export type IHasUpdatedAt = {
    updatedAt: Date;
};

export type IEntityBase = IHasId & IHasCreatedAt & IHasUpdatedAt;

export type IHasName = {
    name: string;
};

export type IHasUsername = {
    username: string;
};
```

### Utility Types

```typescript
/**
 * Dictionary type for key-value pairs
 */
export type Dict<T = any> = {
    [key: string]: T;
};

/**
 * A string that identifies a user's profile in an external provider.
 * Composed of the provider id and the user's id on the provider separated by a slash.
 */
export type ExternalUserId = `${string}/${string}`;
```

## User Presence

### User Presence Status Enum

```typescript
export enum UserPresenceStatus {
    ONLINE = 'ONLINE',
    AWAY = 'AWAY',
    OFFLINE = 'OFFLINE',
    BUSY = 'BUSY',
    DISABLED = 'DISABLED'
}

export const USER_PRESENCE_STATUSES = [
    ...Object.values(UserPresenceStatus)
] as const;
```

## User Interface

### Main User Interface

````typescript
/**
 * Represents a user entity in the chat system.
 *
 * @extends IEntityBase - Provides base entity properties like id
 * @extends IHasCreatedAt - Provides creation timestamp functionality
 *
 * @description This interface defines the structure for a user object containing
 * personal information, contact details, presence status, and user preferences.
 *
 * @example
 * ```typescript
 * const user: IUser = {
 *   _id: "user123",
 *   email: "john.doe@example.com",
 *   name: "John Doe",
 *   username: "johndoe",
 *   active: true,
 *   presence: UserPresenceStatus.ONLINE,
 *   profile: {},
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * };
 * ```
 */
export interface IUser
    extends IEntityBase,
        IHasCreatedAt,
        IHasName,
        IHasUsername {
    //#region Public Profile

    /**
     * The user's preferred email address.
     */
    email: string;

    /**
     * The user's additional email addresses.
     */
    additionalEmails?: string[];

    /**
     * Whether the user's profile is currently active (enabled) in the system.
     */
    active: boolean;

    /**
     * A short text bio or description of the user.
     */
    bio?: string;

    /**
     * The URL of the user's avatar image.
     */
    avatarUrl?: string;

    /**
     * If the user signed up using an external provider, this field contains
     * the user's id on that provider.
     *
     * The format is `<providerId>/<userId>`, e.g. `google/1234567890` where
     * `google` is the provider id and `1234567890` is the user's Google Id.
     */
    externalId?: ExternalUserId;

    //#endregion Public Profile

    //#region User Presence Status

    /**
     * Default presence status of the user.
     */
    defaultPresence?: UserPresenceStatus;

    /**
     * Current presence status of the user.
     */
    presence?: UserPresenceStatus;

    /**
     * Text that describes the user's current presence status.
     */
    presenceText?: string;

    //#endregion User Presence Status

    //#region User Settings & Preferences

    /**
     * The default room that the user has set for quick access.
     */
    defaultRoom?: string;

    /**
     * Additional user profile information stored as a dictionary.
     */
    profile: Dict;

    /**
     * User preferences stored as a dictionary.
     */
    preferences?: Dict;

    //#endregion User Settings & Preferences
}
````

### User Summary Types

```typescript
/**
 * Minimal user information containing only ID and username
 */
export type IUserSummary = Pick<IUser, '_id' | 'username'>;

/**
 * User summary with name included
 */
export type IUserSummaryWithName = Pick<IUser, '_id' | 'username' | 'name'>;
```

## User Events

### User Data Event Types

```typescript
/**
 * Event fired when a user is inserted/created
 */
export type IUserInsertedEvent = IHasShortId & {
    type: 'inserted';
    data: IUser;
    diff?: never;
    unset?: never;
};

/**
 * Event fired when a user is updated
 */
export type IUserUpdatedEvent = IHasShortId & {
    type: 'updated';
    data?: never;
    diff: Partial<IUser>;
    unset: Record<string, number>;
};

/**
 * Event fired when a user is removed/deleted
 */
export type IUserRemovedEvent = IHasShortId & {
    type: 'removed';
    data?: never;
    diff?: never;
    unset?: never;
};

/**
 * Union type for all user data events
 */
export type IUserDataEvent =
    | IUserInsertedEvent
    | IUserUpdatedEvent
    | IUserRemovedEvent;
```

## Summary

The user entity schema includes:

### Core Properties

- **Identity**: `_id`, `username`, `name`, `email`
- **Timestamps**: `createdAt`, `updatedAt`
- **Status**: `active` flag to enable/disable users
- **External Integration**: `externalId` for third-party provider authentication

### Profile Information

- **Personal**: `bio`, `avatarUrl`, `additionalEmails`
- **Flexible Data**: `profile` dictionary for additional profile information
- **Preferences**: `preferences` dictionary for user settings

### Presence System

- **Status**: Current and default presence status (Online, Away, Offline, Busy, Disabled)
- **Custom Text**: `presenceText` for custom status messages

### Chat Integration

- **Default Room**: Quick access to a preferred chat room

### Event System

- **Change Tracking**: Insert, update, and remove events with diff support
- **Flexible Updates**: Partial updates with unset field tracking

The user schema is designed to be flexible with dictionary-based profile and preferences storage while maintaining type safety for core properties.
