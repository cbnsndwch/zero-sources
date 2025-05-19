 
import {
    string,
    boolean,
    enumeration,
    relationships,
    table,
    json,
    number
} from '@rocicorp/zero';

import type { IUserSettings } from './user.contract.js';
import type { USER_PRESENCE_STATUSES } from './user-status.contract.js';

export const users = table('users')
    .columns({
        // Required fields
        _id: string(),
        type: string(),
        roles: json<string[]>(),
        active: boolean(),
        createdAt: string(), // Date stored as ISO string

        // Optional fields
        username: string().optional(),
        name: string().optional(),
        status: enumeration<
            (typeof USER_PRESENCE_STATUSES)[number]
        >().optional(),
        lastLogin: string().optional(), // Date stored as ISO string
        language: string().optional(),
        bio: string().optional(),
        avatarUrl: string().optional(),
        statusText: string().optional(),
        defaultStatus:
            enumeration<(typeof USER_PRESENCE_STATUSES)[number]>().optional(),
        presenceStatus: string().optional(),
        customFields: json<Record<string, any>>().optional(),
        settings: json<Readonly<IUserSettings>>().optional(),
        defaultRoom: string().optional(),
        inviteToken: string().optional(),
        updatedAt: string().optional(), // Date stored as ISO string

        // mongoose stuff
        __v: number().optional()
    })
    .primaryKey('_id');

export const userRelationships = relationships(users, () => ({
    // rooms: many(
    //     {
    //         sourceField: ['id'],
    //         destSchema: roomMember,
    //         destField: ['userId']
    //     },
    //     {
    //         sourceField: ['roomId'],
    //         destSchema: room,
    //         destField: ['id']
    //     }
    // )
}));
