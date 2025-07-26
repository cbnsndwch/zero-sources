import { table, string, boolean, json } from '@rocicorp/zero';
import type { SerializedEditorState } from 'lexical';

import { withTableMapping } from '@cbnsndwch/zero-contracts';

import type { IHasName } from '../../common/index.js';
import type { IUserSummary } from '../../users/user.contract.js';

import { USER_MESSAGE_TYPES } from '../message-type.enum.js';
import type { IMessageReaction } from '../message-reaction.contract.js';
import type { MessageAttachment } from '../attachments/index.js';

import { messageBaseColumns } from './message-base.schema.js';

export const userMessagesTable = withTableMapping(
    table('userMessages')
        .columns({
            ...messageBaseColumns,

            // Required fields
            sender: json<Required<IUserSummary> & Partial<IHasName>>(),

            // @ts-expect-error ReadonlyJSONValue is too strict
            contents: json<SerializedEditorState>(),

            // Optional fields
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
        .primaryKey('_id'),
    {
        source: 'messages',
        filter: {
            t: {
                $in: USER_MESSAGE_TYPES
            }
        },
        projection: {
            // base
            _id: 1,
            createdAt: 1,
            updatedAt: 1,
            roomId: 1,
            hidden: 1,

            // own
            sender: 1,
            contents: 1,
            groupable: 1,
            repliedBy: 1,
            starredBy: 1,
            pinned: 1,
            pinnedAt: 1,
            pinnedBy: 1,
            attachments: 1,
            reactions: 1
        }
    }
);
