import { enumeration, table } from '@rocicorp/zero';

import { withTableMapping } from '@cbnsndwch/zero-contracts';

import { RoomType } from '../room-type.enum.js';

import { roomBaseColumns } from './room-base.schema.js';

export const chatsTable = withTableMapping(
    table('chats')
        .columns({
            ...roomBaseColumns,

            t: enumeration<RoomType.DirectMessages>()
        })
        .primaryKey('_id'),
    {
        source: 'rooms',
        filter: {
            t: {
                $eq: RoomType.DirectMessages
            }
        },
        projection: {
            _id: 1,
            updatedAt: 1,
            t: 1,
            memberIds: 1,
            usernames: 1,
            messageCount: 1,
            lastMessageAt: 1
        }
    }
);
