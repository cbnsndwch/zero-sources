import { enumeration, json, table } from '@rocicorp/zero';

import type { Dict } from '@cbnsndwch/zero-contracts';

import { messageBaseColumns } from './message-base.schema.js';
import type { SystemMessageType } from '../message-type.enum.js';

export const systemMessages = table('systemMessages')
    .from(
        JSON.stringify({
            source: 'messages',
            filter: { t: { $exists: true } }, // System messages have 't' field
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
        })
    )
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
