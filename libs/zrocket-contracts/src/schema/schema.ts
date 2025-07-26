import { createSchema, relationships } from '@rocicorp/zero';

import {
    chatsTable,
    channelsTable,
    groupsTable
} from '../rooms/tables/index.js';
import {
    userMessagesTable,
    systemMessagesTable
} from '../messages/tables/index.js';
import { usersTable } from '../users/tables/index.js';

//#region Relationships

const chatRelationships = relationships(chatsTable, ({ many }) => ({
    messages: many({
        sourceField: ['_id'],
        destSchema: userMessagesTable,
        destField: ['roomId']
    }),
    systemMessages: many({
        sourceField: ['_id'],
        destSchema: systemMessagesTable,
        destField: ['roomId']
    })
}));

const channelRelationships = relationships(channelsTable, ({ many }) => ({
    messages: many({
        sourceField: ['_id'],
        destSchema: userMessagesTable,
        destField: ['roomId']
    }),
    systemMessages: many({
        sourceField: ['_id'],
        destSchema: systemMessagesTable,
        destField: ['roomId']
    })
}));

const groupRelationships = relationships(groupsTable, ({ many }) => ({
    messages: many({
        sourceField: ['_id'],
        destSchema: userMessagesTable,
        destField: ['roomId']
    }),
    systemMessages: many({
        sourceField: ['_id'],
        destSchema: systemMessagesTable,
        destField: ['roomId']
    })
}));

const userMessageRelationships = relationships(
    userMessagesTable,
    ({ one, many }) => ({
        replies: many({
            sourceField: ['_id'],
            destSchema: userMessagesTable,
            destField: ['_id']
        }),
        senderUser: one({
            sourceField: ['sender.id'],
            destSchema: usersTable,
            destField: ['_id']
        }),
        pinnedByUser: one({
            sourceField: ['pinnedBy.id'],
            destSchema: usersTable,
            destField: ['_id']
        })
        // starredBy: many(
        //     {
        //         sourceField: ['id'],
        //         destSchema: messageStarred,
        //         destField: ['messageId']
        //     },
        //     {
        //         sourceField: ['userId'],
        //         destSchema: user,
        //         destField: ['id']
        //     }
        // ),
        // mentionedUsers: many(
        //     {
        //         sourceField: ['id'],
        //         destSchema: messageMention,
        //         destField: ['messageId']
        //     },
        //     {
        //         sourceField: ['userId'],
        //         destSchema: user,
        //         destField: ['id']
        //     }
        // )
    })
);

const userRelationships = relationships(usersTable, () => ({
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
        chatsTable,

        // Public channels from 'rooms' collection (`t := 'c'`)
        channelsTable,

        // Private groups from 'rooms' collection (`t := 'p'`)
        groupsTable,

        // User messages from 'messages' collection (`t := 'USER'`)
        userMessagesTable,

        // System messages from 'messages' collection (`t != 'USER'`)
        systemMessagesTable,

        // Users
        usersTable
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
