import { table, string, boolean, json, relationships } from '@rocicorp/zero';
import type { SerializedEditorState } from 'lexical';

import type { IHasName } from '../../common/index.js';
import type { IUserSummary } from '../../users/user.contract.js';

import { IMessageReaction } from '../message-reaction.contract.js';
import { MessageAttachment } from '../attachments/index.js';

// Export system messages
export * from './system-message.schema.js';

export const messages = table('messages')
    .columns({
        // Required fields
        _id: string(),
        roomId: string(),
        ts: string(), // Date stored as ISO string
        sender: json<Required<IUserSummary> & Partial<IHasName>>(),

        // Common metadata
        createdAt: string(), // Date stored as ISO string
        updatedAt: string().optional(), // Date stored as ISO string

        // @ts-expect-error ReadonlyJSONValue is too strict
        contents: json<SerializedEditorState>(),

        // Optional fields
        hidden: boolean().optional(),
        groupable: boolean().optional(),

        repliedBy: json<string[]>().optional(),
        starredBy: json<string[]>().optional(),

        pinned: boolean().optional(),
        pinnedAt: string().optional(), // Date stored as ISO string
        pinnedBy: json<IUserSummary>().optional(),

        // @ts-expect-error ReadonlyJSONValue is too strict
        attachments: json<ReadonlyArray<MessageAttachment>>().optional(),

        reactions:
            // @ts-expect-error ReadonlyJSONValue is too strict
            json<Readonly<Record<string, IMessageReaction>>>().optional()
    })
    .primaryKey('_id');

// Define relationships
export const messageRelationships = relationships(messages, ({ many }) => ({
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
}));
