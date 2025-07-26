import type { IHasShortId } from '../common/base.contracts.js';

import type { IUser } from './user.contract.js';

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
