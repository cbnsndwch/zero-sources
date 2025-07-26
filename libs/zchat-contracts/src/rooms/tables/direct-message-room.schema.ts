import { type ColumnBuilder, enumeration, table } from '@rocicorp/zero';

import type { IDirectMessagesRoom } from '../direct-messages.contracts.js';
import type { RoomType } from '../room-type.contract.js';

import { roomBaseColumns } from './room-base.schema.js';

export const directMessageRoomColumns = {
    ...roomBaseColumns,

    t: enumeration<RoomType.DirectMessages>()
} as const satisfies Record<keyof IDirectMessagesRoom, ColumnBuilder<any>>;

export const chatsTable = table('chats')
    .columns(directMessageRoomColumns)
    .primaryKey('_id');
