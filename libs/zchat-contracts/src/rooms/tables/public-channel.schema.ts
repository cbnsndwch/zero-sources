import { boolean, enumeration, table } from '@rocicorp/zero';

import type { RoomType } from '../room-type.contract.js';

import { groupRoomBaseColumns } from './room-base.schema.js';

const publicChannelColumns = {
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
} as const;

export const channelsTable = table('channels')
    .from(JSON.stringify({
        source: 'rooms',
        filter: { t: 'c' },
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
    }))
    .columns(publicChannelColumns)
    .primaryKey('_id');
