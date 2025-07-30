import { enumeration, table as defineTable } from '@rocicorp/zero';

import type { RowOf, TableMapping } from '@cbnsndwch/zero-contracts';

import { RoomType } from '../room-type.enum.js';

import { groupRoomBaseColumns } from './room-base.schema.js';

export const table = defineTable('groups')
    .columns({
        ...groupRoomBaseColumns,

        t: enumeration<RoomType.PrivateGroup>()
    })
    .primaryKey('_id');

const mapping: TableMapping<IPrivateGroup> = {
    source: 'rooms',
    filter: {
        t: {
            $eq: RoomType.PrivateGroup
        }
    },
    projection: {
        _id: 1,
        t: 1,
        name: 1,
        description: 1,
        topic: 1,
        memberIds: 1,
        usernames: 1,
        messageCount: 1,
        createdAt: 1,
        updatedAt: 1,
        archived: 1,
        systemMessageTypes: 1,
        lastMessageAt: 1,
        lastMessage: 1,
        readOnly: 1
    }
};

export type IPrivateGroup = RowOf<typeof table>;

export default {
    table,
    mapping
};
