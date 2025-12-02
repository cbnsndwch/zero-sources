import type { Dict } from '@cbnsndwch/zero-contracts';

import type {
    IHasCreatedAt,
    IEntityBase,
    IHasName,
    IHasUsername
} from '../common/index.js';

import type { UserPresenceStatus } from './user-presence-status.contract.js';

/**
 * A string that identifies a user's profile in an extenal provider. Compose of
 * the provider id and the user's id on the provider separated by a slash.
 */
export type ExternalUserId = `${string}/${string}`;

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
 *   id: "user123",
 *   email: "john.doe@example.com",
 *   name: "John Doe",
 *   username: "johndoe",
 *   active: true,
 *   presence: UserPresenceStatus.ONLINE,
 *   profile: {},
 *   createdAt: new Date()
 * };
 * ```
 */
export interface IUser
    extends IEntityBase, IHasCreatedAt, IHasName, IHasUsername {
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

export type IUserSummary = Pick<IUser, '_id' | 'username'>;

export type IUserSummaryWithName = Pick<IUser, '_id' | 'username' | 'name'>;
