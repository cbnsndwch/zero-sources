import { table, string, boolean, json } from '@rocicorp/zero';
import type { SerializedEditorState } from 'lexical';

import type { IHasName } from '../../common/index.js';
import type { IUserSummary } from '../../users/user.contract.js';

import { IMessageReaction } from '../message-reaction.contract.js';
import { MessageAttachment } from '../attachments/index.js';


export const messages = table('messages')
    .from(
        JSON.stringify({
            source: 'messages',
            filter: { t: { $exists: false } }, // User messages don't have 't' field
            projection: {
                _id: 1,
                roomId: 1,
                ts: 1,
                sender: 1,
                createdAt: 1,
                updatedAt: 1,
                contents: 1,
                hidden: 1,
                groupable: 1,
                repliedBy: 1,
                starredBy: 1,
                pinned: 1,
                pinnedAt: 1,
                pinnedBy: 1,
                attachments: 1,
                reactions: 1
            }
        })
    )
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
