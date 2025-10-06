import { createSchema, createBuilder, relationships } from '@rocicorp/zero';

import chats from '../rooms/tables/direct-message-room.schema.js';
import groups from '../rooms/tables/private-group.schema.js';
import channels from '../rooms/tables/public-channel.schema.js';

import userMessages from '../messages/tables/user-messages.schema.js';
import systemMessages from '../messages/tables/system-message.schema.js';

import users from '../users/tables/user.schema.js';

//#region Relationships

const chatRelationships = relationships(chats.table, ({ many }) => ({
    messages: many({
        sourceField: ['_id'],
        destSchema: userMessages.table,
        destField: ['roomId']
    }),
    systemMessages: many({
        sourceField: ['_id'],
        destSchema: systemMessages.table,
        destField: ['roomId']
    })
}));

const channelRelationships = relationships(channels.table, ({ many }) => ({
    messages: many({
        sourceField: ['_id'],
        destSchema: userMessages.table,
        destField: ['roomId']
    }),
    systemMessages: many({
        sourceField: ['_id'],
        destSchema: systemMessages.table,
        destField: ['roomId']
    })
}));

const groupRelationships = relationships(groups.table, ({ many }) => ({
    messages: many({
        sourceField: ['_id'],
        destSchema: userMessages.table,
        destField: ['roomId']
    }),
    systemMessages: many({
        sourceField: ['_id'],
        destSchema: systemMessages.table,
        destField: ['roomId']
    })
}));

const userMessageRelationships = relationships(
    userMessages.table,
    ({ many }) => ({
        replies: many({
            sourceField: ['_id'],
            destSchema: userMessages.table,
            destField: ['_id']
        })
        // TODO: Uncomment when Zero supports JSON field relationships
        // senderUser: one({
        //     sourceField: ['sender.id'],
        //     destSchema: usersTable,
        //     destField: ['_id']
        // }),
        // pinnedByUser: one({
        //     sourceField: ['pinnedBy.id'],
        //     destSchema: usersTable,
        //     destField: ['_id']
        // })
    })
);

const userRelationships = relationships(users.table, () => ({
    // chats: many({
    //     sourceField: ['_id'],
    //     destSchema: chatsTable,
    //     destField: ['memberIds']
    // }),
    // channels: many({
    //     sourceField: ['_id'],
    //     destSchema: chatsTable,
    //     destField: ['memberIds']
    // }),
    // groups: many({
    //     sourceField: ['_id'],
    //     destSchema: groupsTable,
    //     destField: ['memberIds']
    // })
}));

//#endregion Relationships

export const schema = createSchema({
    tables: [
        // Direct messages from 'rooms' collection (`t := 'd'`)
        chats.table,

        // Public channels from 'rooms' collection (`t := 'c'`)
        channels.table,

        // Private groups from 'rooms' collection (`t := 'p'`)
        groups.table,

        // User messages from 'messages' collection (`t := 'USER'`)
        userMessages.table,

        // System messages from 'messages' collection (`t != 'USER'`)
        systemMessages.table,

        // Users
        users.table
    ],
    relationships: [
        chatRelationships,
        channelRelationships,
        groupRelationships,
        userMessageRelationships,
        userRelationships
    ]
});

export type Schema = typeof schema;

export type TableName = keyof typeof schema.tables;

/**
 * Query builder for creating Zero queries.
 *
 * Use this builder in synced query definitions to construct type-safe queries
 * against the ZRocket schema.
 *
 * @example
 * ```typescript
 * import { builder } from '@cbnsndwch/zrocket-contracts/schema';
 *
 * const myQuery = syncedQueryWithContext<Schema, QueryContext>(
 *   'myQuery',
 *   z.tuple([]),
 *   (ctx) => {
 *     return builder.chats.where('memberIds', 'contains', ctx.sub);
 *   }
 * );
 * ```
 */
export const builder = createBuilder(schema);

export const mapping = {
    chats: chats.mapping,
    channels: channels.mapping,
    groups: groups.mapping,
    userMessages: userMessages.mapping,
    systemMessages: systemMessages.mapping
    // users: users.mapping,
} as const;
