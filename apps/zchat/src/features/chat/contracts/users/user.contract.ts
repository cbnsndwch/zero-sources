import type { IHasCreatedAt, IHasShortId, IEntityBase, IHasName } from '../base.contracts.js';
import type { Serialized } from '../serialized.contract.js';
import type { UserStatus } from './user-status.contract.js';

export interface IUserSettings {
    profile: Record<string, any>;
    preferences?: Record<string, any>;
}

export interface IGetRoomRoles {
    _id: string;
    rid: string;
    u: {
        _id: string;
        username: string;
    };
    roles: string[];
}

export interface IUser extends IEntityBase, IHasCreatedAt {
    type: string;
    name?: string;
    username?: string;

    active: boolean;
    roles: string[];

    bio?: string;

    avatarUrl?: string;

    status?: UserStatus;
    statusText?: string;
    defaultStatus?: UserStatus;
    presenceStatus?: string;

    customFields?: Record<string, any>;

    settings?: IUserSettings;

    defaultRoom?: string;

    inviteToken?: string;
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

export type IUserDataEvent = IUserInsertedEvent | IUserUpdatedEvent | IUserRemovedEvent;

export type IUserInRole = Pick<
    IUser,
    '_id' | 'updatedAt' | 'name' | 'username' | 'createdAt' | 'roles' | 'type' | 'active'
>;
