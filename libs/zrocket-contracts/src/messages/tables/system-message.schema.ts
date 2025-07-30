import { enumeration, json, table as defineTable } from '@rocicorp/zero';

import type { Dict, TableMapping, RowOf } from '@cbnsndwch/zero-contracts';

import { messageBaseColumns } from './message-base.schema.js';
import {
    SYSTEM_MESSAGE_TYPES,
    type SystemMessageType
} from '../message-type.enum.js';

export const table = defineTable('systemMessages')
    .columns({
        ...messageBaseColumns,

        // own
        /**
         * The type of system message
         */
        t: enumeration<SystemMessageType>(),

        /**
         * (Optional) Data associated with the system message. Schema depends on
         * the type of system message and is not yet strictly enforced. This may
         * change later one
         */
        data: json<Dict>().optional()
    })
    .primaryKey('_id');

const mapping: TableMapping<ISystemMessage> = {
    source: 'messages',
    filter: {
        t: {
            $in: SYSTEM_MESSAGE_TYPES
        }
    },
    projection: {
        // base
        _id: 1,
        createdAt: 1,
        updatedAt: 1,
        roomId: 1,
        hidden: 1,

        // own
        t: 1,
        data: 1
    }
};

export type ISystemMessage = RowOf<typeof table>;

export default {
    table,
    mapping
};
