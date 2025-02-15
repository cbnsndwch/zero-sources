import { table, string, number, boolean, json, enumeration, relationships } from '@rocicorp/zero';

import { SYSTEM_MESSAGE_TYPES } from '../messages/index.js';

import { ROOM_TYPES } from './index.js';

export const rooms = table('rooms')
    .columns({
        // Base fields
        _id: string(),
        t: enumeration<(typeof ROOM_TYPES)[number]>(),
        memberIds: json<string[]>(),
        messageCount: number(),
        lastMessage: json().optional(), // json<Readonly<Serialized<IMessage>>>().optional(),
        lastMessageAt: string().optional(), // Date stored as ISO string
        systemMessages: json<(typeof SYSTEM_MESSAGE_TYPES)[number][]>().optional(),

        // DirectMessagesRoom fields
        usernames: json<string[]>().optional(),

        // GroupRoom fields
        name: string().optional(),
        readOnly: boolean().optional(),
        featured: boolean().optional(),
        default: boolean().optional(),
        topic: string().optional(),
        description: string().optional(),
        archived: boolean().optional(),

        // Common metadata
        createdAt: string(), // Date stored as ISO string
        updatedAt: string().optional(), // Date stored as ISO string

        // mongoose stuff
        __v: number().optional()
    })
    .primaryKey('_id');

// Define relationships
export const roomRelationships = relationships(rooms, () => ({
    // members: many(
    //     {
    //         sourceField: ['id'],
    //         destSchema: roomMember,
    //         destField: ['roomId']
    //     },
    //     {
    //         sourceField: ['userId'],
    //         destSchema: user,
    //         destField: ['id']
    //     }
    // ),
    // messages: many({
    //     sourceField: ['id'],
    //     destSchema: message,
    //     destField: ['roomId']
    // })
}));
