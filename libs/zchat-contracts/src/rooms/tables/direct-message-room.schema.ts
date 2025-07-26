import { type ColumnBuilder, enumeration, table } from '@rocicorp/zero';

import type { IDirectMessagesRoom } from '../direct-messages.contracts.js';
import type { RoomType } from '../room-type.contract.js';

import { roomBaseColumns } from './room-base.schema.js';

export const directMessageRoomColumns = {
    ...roomBaseColumns,

    t: enumeration<RoomType.DirectMessages>()
} as const satisfies Record<keyof IDirectMessagesRoom, ColumnBuilder<any>>;

export const chatsTable = table('chats')
    .from(JSON.stringify({
        source: 'rooms',
        filter: { t: 'd' },
        projection: { 
            _id: 1, 
            updatedAt: 1, 
            t: 1, 
            memberIds: 1, 
            usernames: 1, 
            messageCount: 1, 
            lastMessageAt: 1 
        }
    }))
    .columns(directMessageRoomColumns)
    .primaryKey('_id');
