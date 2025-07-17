import {
    createSchema,
    definePermissions,
    NOBODY_CAN,
    ANYONE_CAN,
    table,
    string,
    boolean,
    json,
    enumeration,
    relationships,
    type ExpressionBuilder,
    type PermissionsConfig
} from '@rocicorp/zero';

import { JwtPayload } from './auth/index.js';

// Room tables using discriminated union configs
export const chats = table('chats')
    .from(JSON.stringify({
        source: 'rooms',
        filter: { t: 'd', archived: { $ne: true } },
        projection: { _id: 1, memberIds: 1, createdAt: 1, lastMessageAt: 1, usernames: 1 }
    }))
    .columns({
        _id: string(),
        memberIds: json<string[]>(),
        createdAt: string(),
        lastMessageAt: string().optional(),
        usernames: json<string[]>().optional()
    })
    .primaryKey('_id');

export const groups = table('groups')
    .from(JSON.stringify({
        source: 'rooms',
        filter: { t: 'p', archived: { $ne: true } },
        projection: { _id: 1, name: 1, memberIds: 1, createdAt: 1, lastMessageAt: 1, description: 1, topic: 1 }
    }))
    .columns({
        _id: string(),
        name: string(),
        memberIds: json<string[]>(),
        createdAt: string(),
        lastMessageAt: string().optional(),
        description: string().optional(),
        topic: string().optional()
    })
    .primaryKey('_id');

export const channels = table('channels')
    .from(JSON.stringify({
        source: 'rooms',
        filter: { t: 'c', archived: { $ne: true } },
        projection: { _id: 1, name: 1, description: 1, memberIds: 1, createdAt: 1, lastMessageAt: 1, topic: 1, featured: 1, default: 1 }
    }))
    .columns({
        _id: string(),
        name: string(),
        description: string().optional(),
        memberIds: json<string[]>(),
        createdAt: string(),
        lastMessageAt: string().optional(),
        topic: string().optional(),
        featured: boolean().optional(),
        default: boolean().optional()
    })
    .primaryKey('_id');

// Message tables using discriminated union configs
export const textMessages = table('textMessages')
    .from(JSON.stringify({
        source: 'messages',
        filter: { t: 'text', hidden: { $ne: true } },
        projection: { _id: 1, roomId: 1, 'sender.id': 1, 'sender.name': 1, 'sender.username': 1, contents: 1, ts: 1, md: 1 }
    }))
    .columns({
        _id: string(),
        roomId: string(),
        sender: json<{ id: string; name?: string; username?: string }>(),
        contents: json(),
        ts: string(),
        md: string().optional()
    })
    .primaryKey('_id');

export const imageMessages = table('imageMessages')
    .from(JSON.stringify({
        source: 'messages',
        filter: { t: 'image', hidden: { $ne: true } },
        projection: { _id: 1, roomId: 1, 'sender.id': 1, 'sender.name': 1, 'sender.username': 1, imageUrl: 1, caption: 1, imageMetadata: 1, ts: 1 }
    }))
    .columns({
        _id: string(),
        roomId: string(),
        sender: json<{ id: string; name?: string; username?: string }>(),
        imageUrl: string(),
        caption: string().optional(),
        imageMetadata: json<{
            width: number;
            height: number;
            fileSize: number;
            mimeType: string;
        }>(),
        ts: string()
    })
    .primaryKey('_id');

export const systemMessages = table('systemMessages')
    .from(JSON.stringify({
        source: 'messages',
        filter: { t: 'system' },
        projection: { _id: 1, roomId: 1, action: 1, targetUserId: 1, ts: 1, metadata: 1 }
    }))
    .columns({
        _id: string(),
        roomId: string(),
        action: string(),
        targetUserId: string().optional(),
        ts: string(),
        metadata: json<any>().optional()
    })
    .primaryKey('_id');

// Keep the original users table as-is for now
export const users = table('users')
    .columns({
        _id: string(),
        username: string(),
        name: string().optional(),
        email: string().optional(),
        active: boolean().optional(),
        type: string().optional()
    })
    .primaryKey('_id');

// Define relationships
export const chatRelationships = relationships(chats, ({ one, many }) => ({
    textMessages: many({
        sourceField: ['_id'],
        destSchema: textMessages,
        destField: ['roomId']
    }),
    imageMessages: many({
        sourceField: ['_id'],
        destSchema: imageMessages,
        destField: ['roomId']
    }),
    systemMessages: many({
        sourceField: ['_id'],
        destSchema: systemMessages,
        destField: ['roomId']
    })
}));

export const groupRelationships = relationships(groups, ({ one, many }) => ({
    textMessages: many({
        sourceField: ['_id'],
        destSchema: textMessages,
        destField: ['roomId']
    }),
    imageMessages: many({
        sourceField: ['_id'],
        destSchema: imageMessages,
        destField: ['roomId']
    }),
    systemMessages: many({
        sourceField: ['_id'],
        destSchema: systemMessages,
        destField: ['roomId']
    })
}));

export const channelRelationships = relationships(channels, ({ one, many }) => ({
    textMessages: many({
        sourceField: ['_id'],
        destSchema: textMessages,
        destField: ['roomId']
    }),
    imageMessages: many({
        sourceField: ['_id'],
        destSchema: imageMessages,
        destField: ['roomId']
    }),
    systemMessages: many({
        sourceField: ['_id'],
        destSchema: systemMessages,
        destField: ['roomId']
    })
}));

export const textMessageRelationships = relationships(textMessages, ({ one }) => ({
    chat: one({
        sourceField: ['roomId'],
        destSchema: chats,
        destField: ['_id']
    }),
    group: one({
        sourceField: ['roomId'],
        destSchema: groups,
        destField: ['_id']
    }),
    channel: one({
        sourceField: ['roomId'],
        destSchema: channels,
        destField: ['_id']
    })
}));

export const imageMessageRelationships = relationships(imageMessages, ({ one }) => ({
    chat: one({
        sourceField: ['roomId'],
        destSchema: chats,
        destField: ['_id']
    }),
    group: one({
        sourceField: ['roomId'],
        destSchema: groups,
        destField: ['_id']
    }),
    channel: one({
        sourceField: ['roomId'],
        destSchema: channels,
        destField: ['_id']
    })
}));

export const systemMessageRelationships = relationships(systemMessages, ({ one }) => ({
    chat: one({
        sourceField: ['roomId'],
        destSchema: chats,
        destField: ['_id']
    }),
    group: one({
        sourceField: ['roomId'],
        destSchema: groups,
        destField: ['_id']
    }),
    channel: one({
        sourceField: ['roomId'],
        destSchema: channels,
        destField: ['_id']
    })
}));

export const userRelationships = relationships(users, ({ many }) => ({}));

export type DiscriminatedSchema = typeof discriminatedSchema;

export const discriminatedSchema = createSchema({
    tables: [
        users,
        chats, groups, channels,
        textMessages, imageMessages, systemMessages
    ],
    relationships: [
        userRelationships,
        chatRelationships, groupRelationships, channelRelationships,
        textMessageRelationships, imageMessageRelationships, systemMessageRelationships
    ]
});

export const discriminatedPermissions = definePermissions<JwtPayload, DiscriminatedSchema>(discriminatedSchema, () => {
    const allowIfLoggedIn = (
        authData: JwtPayload,
        { cmpLit }: ExpressionBuilder<DiscriminatedSchema, 'users'>
    ) => cmpLit(authData.sub, 'IS NOT', null);

    const allowIfMessageSender = (
        authData: JwtPayload,
        { cmpLit }: ExpressionBuilder<DiscriminatedSchema, 'textMessages'>
    ) => cmpLit('sender.id', '=', authData.sub ?? '');

    return {
        // Room tables - read-only
        chats: {
            row: {
                select: ANYONE_CAN,
                insert: NOBODY_CAN,
                update: { preMutation: NOBODY_CAN },
                delete: NOBODY_CAN
            }
        },
        groups: {
            row: {
                select: ANYONE_CAN,
                insert: NOBODY_CAN,
                update: { preMutation: NOBODY_CAN },
                delete: NOBODY_CAN
            }
        },
        channels: {
            row: {
                select: ANYONE_CAN,
                insert: NOBODY_CAN,
                update: { preMutation: NOBODY_CAN },
                delete: NOBODY_CAN
            }
        },
        // Message tables
        textMessages: {
            row: {
                select: ANYONE_CAN,
                insert: ANYONE_CAN,
                update: { preMutation: [allowIfMessageSender] },
                delete: [allowIfLoggedIn]
            }
        },
        imageMessages: {
            row: {
                select: ANYONE_CAN,
                insert: ANYONE_CAN,
                update: { preMutation: [allowIfMessageSender] },
                delete: [allowIfLoggedIn]
            }
        },
        systemMessages: {
            row: {
                select: ANYONE_CAN,
                insert: NOBODY_CAN,
                update: { preMutation: NOBODY_CAN },
                delete: NOBODY_CAN
            }
        },
        // Users table
        users: {
            row: {
                select: ANYONE_CAN,
                insert: NOBODY_CAN,
                update: { preMutation: NOBODY_CAN },
                delete: NOBODY_CAN
            }
        }
    } satisfies PermissionsConfig<JwtPayload, DiscriminatedSchema>;
});