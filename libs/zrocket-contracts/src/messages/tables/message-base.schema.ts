import { boolean, string, type ColumnBuilder } from '@rocicorp/zero';

import { entityBaseColumns } from '../../common/tables/common.schema.js';

import type { IMessageBase } from '../message-base.contract.js';

/**
 * Base zero table columns for message rows
 */
export const messageBaseColumns = {
    ...entityBaseColumns,

    /**
     * The room id this message belongs to
     */
    roomId: string(),

    /**
     * Whether to hide the message from the UI
     */
    hidden: boolean().optional()
} as const satisfies Record<keyof IMessageBase, ColumnBuilder<any>>;
