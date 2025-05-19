 

import type {
    IHasCreatedAt,
    IHasShortId,
    IEntityBase,
    IHasName
} from '../common/index.js';

import type { UserPresenceStatus } from './user-status.contract.js';

/**
 * A that identifies string contains the provider id and the external
 * user id separated by a slash.
 */
export type ExternalUserId = `${string}/${string}`;

export interface IUserSettings {
    profile: Record<string, any>;
    preferences?: Record<string, any>;
}

export interface IGetRoomRoles {
    _id: string;
    rid: string;
    u: IUserSummary;
    roles: string[];
}

export interface IUser extends IEntityBase, IHasCreatedAt {
    name?: string;

    username?: string;

    email: string;

    additionalEmails?: string[];

    active: boolean;

    roles: string[];

    bio?: string;

    avatarUrl?: string;

    providerId?: ExternalUserId;

    // #####################################

    presenceStatus?: UserPresenceStatus;

    presenceStatusText?: string;

    defaultPresenceStatus?: UserPresenceStatus;

    // #####################################

    settings?: IUserSettings;

    defaultRoom?: string;

    // #####################################

    customFields?: Record<string, any>;
}

export type IUserSummary = Pick<IUser, '_id' | 'username'>;

export type IUserSummaryWithName = IUserSummary & IHasName;

export interface IRegisterUser extends IUser {
    username: string;
    name: string;
}

export const isRegisterUser = (user: IUser): user is IRegisterUser =>
    user.username !== undefined && user.name !== undefined;

export type IUserInsertedEvent = IHasShortId & {
    type: 'inserted';
    data: IUser;
    diff?: never;
    unset?: never;
};

export type IUserUpdatedEvent = IHasShortId & {
    type: 'updated';
    data?: never;
    diff: Partial<IUser>;
    unset: Record<string, number>;
};

export type IUserRemovedEvent = IHasShortId & {
    type: 'removed';
    data?: never;
    diff?: never;
    unset?: never;
};

export type IUserDataEvent =
    | IUserInsertedEvent
    | IUserUpdatedEvent
    | IUserRemovedEvent;

export type IUserInRole = Pick<
    IUser,
    '_id' | 'updatedAt' | 'name' | 'username' | 'createdAt' | 'roles' | 'active'
>;
