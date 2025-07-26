import { boolean, enumeration, table } from '@rocicorp/zero';

import { withTableMapping } from '@cbnsndwch/zero-contracts';

import { RoomType } from '../room-type.enum.js';

import { groupRoomBaseColumns } from './room-base.schema.js';

export const channelsTable = withTableMapping(
    table('channels')
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
        .primaryKey('_id'),
    {
        source: 'rooms',
        filter: {
            t: {
                $eq: RoomType.PublicChannel
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
            lastMessageAt: 1,
            default: 1,
            featured: 1
        }
    }
);
