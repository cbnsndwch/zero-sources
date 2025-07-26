import { enumeration, table, type ColumnBuilder } from '@rocicorp/zero';

import type { IPrivateGroupRoom } from '../group.contracts.js';

import { groupRoomBaseColumns } from './room-base.schema.js';
import { RoomType } from '../room-type.enum.js';

const privateGroupColumns = {
    ...groupRoomBaseColumns,

    t: enumeration<RoomType.PrivateGroup>()
} as const satisfies Record<keyof IPrivateGroupRoom, ColumnBuilder<any>>;

export const groupsTable = table('groups')
    .from(JSON.stringify({
        source: 'rooms',
        filter: { t: 'p' },
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
    }))
    .columns(privateGroupColumns)
    .primaryKey('_id');
