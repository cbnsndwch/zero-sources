import { enumeration, table } from '@rocicorp/zero';

import { withTableMapping } from '@cbnsndwch/zero-contracts';

import { RoomType } from '../room-type.enum.js';

import { groupRoomBaseColumns } from './room-base.schema.js';

export const groupsTable = withTableMapping(
    table('groups')
        .columns({
            ...groupRoomBaseColumns,

            t: enumeration<RoomType.PrivateGroup>()
        })
        .primaryKey('_id'),
    {
        source: 'rooms',
        filter: {
            t: {
                $eq: RoomType.PrivateGroup
            }
        },
        projection: {
            _id: 1,
            updatedAt: 1,
            t: 1,
            name: 1,
            description: 1,
            topic: 1,
            memberIds: 1,
            usernames: 1,
            messageCount: 1,
            lastMessageAt: 1
        }
    }
);
