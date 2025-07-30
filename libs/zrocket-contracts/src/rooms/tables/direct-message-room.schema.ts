import { enumeration, table as defineTable } from '@rocicorp/zero';

import type { RowOf, TableMapping } from '@cbnsndwch/zero-contracts';

import { RoomType } from '../room-type.enum.js';

import { roomBaseColumns } from './room-base.schema.js';

const table = defineTable('chats')
    .columns({
        ...roomBaseColumns,

        t: enumeration<RoomType.DirectMessages>()
    })
    .primaryKey('_id');

const mapping: TableMapping<IDirectMessageRoom> = {
    source: 'rooms',
    filter: {
        t: {
            $eq: RoomType.DirectMessages
        }
    },
    projection: {
        _id: 1,
        createdAt: 1,
        updatedAt: 1,
        t: 1,
        systemMessageTypes: 1,
        memberIds: 1,
        usernames: 1,
        messageCount: 1,
        lastMessage: 1,
        lastMessageAt: 1
    }
};

export type IDirectMessageRoom = RowOf<typeof table>;

export default {
    table,
    mapping
};
