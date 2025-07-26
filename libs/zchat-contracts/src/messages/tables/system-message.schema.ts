import { enumeration, json, table, string, boolean } from '@rocicorp/zero';

import type { Dict } from '@cbnsndwch/zero-contracts';

import { entityBaseColumns } from '../../common/tables/common.schema.js';
import type { SystemMessageType } from '../message-type.contract.js';

export const systemMessageColumns = {
    ...entityBaseColumns,

    roomId: string(),
    ts: string(), // Date stored as ISO string

    // System message specific fields
    t: enumeration<SystemMessageType>(),
    data: json<Dict>().optional(),

    hidden: boolean().optional()
} as const;

export const systemMessages = table('systemMessages')
    .columns(systemMessageColumns)
    .primaryKey('_id');
