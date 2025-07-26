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
    .columns(publicChannelColumns)
    .primaryKey('_id');
