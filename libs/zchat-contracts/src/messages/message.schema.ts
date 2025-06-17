import {
    table,
    string,
    boolean,
    json,
    relationships,
    number
} from '@rocicorp/zero';
import type { MessageSurfaceLayout } from '@rocket.chat/ui-kit';

import type { IMessageMention } from './message.contracts.js';

import type { IHasId, IHasName } from '../common/index.js';
import type { IUserSummary } from '../users/user.contract.js';

import { rooms } from '../rooms/room.schema.js';
// import { user } from './user.schema.js';

export const messages = table('messages')
    .columns({
        // Required fields
        _id: string(),
        roomId: string(),
        ts: string(), // Date stored as ISO string
        contents: json(), // SerializedEditorState
        sender: json<Required<IUserSummary> & Partial<IHasName>>(),

        // Optional fields
        md: string().optional(),
        html: string().optional(),
        mentions: json<IMessageMention[]>().optional(),
        groupable: boolean().optional(),
        blocks: json<MessageSurfaceLayout>().optional(),
        hidden: boolean().optional(),
        repliedBy: json<string[]>().optional(),
        starred: json<IHasId[]>().optional(),
        pinned: boolean().optional(),
        pinnedAt: string().optional(), // Date stored as ISO string
        pinnedBy: json<IUserSummary>().optional(),
        unread: boolean().optional(),
        attachments: json<any[]>().optional(), // MessageAttachment[]
        reactions: json().optional(), // Record<string, IMessageReaction>

        // Common metadata
        createdAt: string(), // Date stored as ISO string
        updatedAt: string().optional(), // Date stored as ISO string

        // mongoose stuff
        __v: number().optional()
    })
    .primaryKey('_id');

// Define relationships
export const messageRelationships = relationships(
    messages,
    ({ one, many }) => ({
        room: one({
            sourceField: ['roomId'],
            destSchema: rooms,
            destField: ['_id']
        }),
        replies: many({
            sourceField: ['_id'],
            destSchema: messages,
            destField: ['_id']
        })
        // senderUser: one({
        //     sourceField: ['sender.id'],
        //     destSchema: user,
        //     destField: ['id']
        // }),
        // pinnedByUser: one({
        //     sourceField: ['pinnedBy.id'],
        //     destSchema: user,
        //     destField: ['id']
        // })
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
