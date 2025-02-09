import { table, string, boolean, json, relationships } from '@rocicorp/zero';
import type { MessageSurfaceLayout } from '@rocket.chat/ui-kit';

import type { IMessageMention } from '../contracts/messages/index.js';
import type { IHasId, IHasName } from '../contracts/base.contracts.js';
import type { IUserSummary } from '../contracts/users/user.contract.js';

import { room } from './room.schema.js';
import { user } from './user.schema.js';

export const message = table('message')
    .from('messages')
    .columns({
        // Required fields
        id: string(),
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
        updatedAt: string().optional() // Date stored as ISO string
    })
    .primaryKey('id');

// Define relationships
export const messageRelationships = relationships(message, ({ one, many }) => ({
    room: one({
        sourceField: ['roomId'],
        destSchema: room,
        destField: ['id']
    }),
    replies: many({
        sourceField: ['id'],
        destSchema: message,
        destField: ['id']
    }),
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
}));
