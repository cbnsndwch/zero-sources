import { boolean, enumeration, table as defineTable } from '@rocicorp/zero';

import type { RowOf, TableMapping } from '@cbnsndwch/zero-contracts';

import { RoomType } from '../room-type.enum.js';

import { groupRoomBaseColumns } from './room-base.schema.js';

export const table = defineTable('channels')
    .columns({
        ...groupRoomBaseColumns,

        t: enumeration<RoomType.PublicChannel>(),

        /**
         * Indicates whether new users should be automatically added to the room.
         */
        default: boolean().optional(),

        /**
         * Indicates the room should be publicly highlighted.
         */
        featured: boolean().optional()
    })
    .primaryKey('_id');

const mapping: TableMapping<IChannel> = {
    source: 'rooms',
    filter: {
        t: {
            $eq: RoomType.PublicChannel
        }
    },
    projection: {
        _id: 1,
        createdAt: 1,
        updatedAt: 1,
        t: 1,
        archived: 1,
        systemMessageTypes: 1,
        name: 1,
        description: 1,
        topic: 1,
        memberIds: 1,
        usernames: 1,
        messageCount: 1,
        lastMessageAt: 1,
        lastMessage: 1,
        default: 1,
        featured: 1,
        readOnly: 1
    }
};

export type IChannel = RowOf<typeof table>;

export default {
    table,
    mapping
};
