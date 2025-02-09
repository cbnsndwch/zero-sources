import { string, boolean, enumeration, relationships, table, json } from '@rocicorp/zero';

import { USER_STATUSES, IUserSettings } from '../contracts/index.js';
import { room } from './room.schema.js';

export const user = table('user')
    .from('users')
    .columns({
        // Required fields
        id: string(),
        type: string(),
        roles: json<string[]>(),
        active: boolean(),
        createdAt: string(), // Date stored as ISO string

        // Optional fields
        username: string().optional(),
        name: string().optional(),
        status: enumeration<(typeof USER_STATUSES)[number]>().optional(),
        lastLogin: string().optional(), // Date stored as ISO string
        language: string().optional(),
        bio: string().optional(),
        avatarUrl: string().optional(),
        statusText: string().optional(),
        defaultStatus: enumeration<(typeof USER_STATUSES)[number]>().optional(),
        presenceStatus: string().optional(),
        customFields: json<Record<string, any>>().optional(),
        settings: json<Readonly<IUserSettings>>().optional(),
        defaultRoom: string().optional(),
        inviteToken: string().optional(),
        updatedAt: string().optional() // Date stored as ISO string
    })
    .primaryKey('id');

export const userRelationships = relationships(user, ({ many }) => ({
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
