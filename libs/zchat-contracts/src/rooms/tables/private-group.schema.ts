import { enumeration, table, type ColumnBuilder } from '@rocicorp/zero';

import type { IPrivateGroupRoom } from '../group.contracts.js';

import { groupRoomBaseColumns } from './room-base.schema.js';
import { RoomType } from '../room-type.contract.js';

const privateGroupColumns = {
    ...groupRoomBaseColumns,

    t: enumeration<RoomType.PrivateGroup>()
} as const satisfies Record<keyof IPrivateGroupRoom, ColumnBuilder<any>>;

export const groupsTable = table('groups')
    .columns(privateGroupColumns)
    .primaryKey('_id');
