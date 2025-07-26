import { string, type ColumnBuilder } from '@rocicorp/zero';

import type { IEntityBase } from '../base.contracts.js';

export const entityBaseColumns = {
    _id: string(),
    createdAt: string(),
    updatedAt: string()
} as const satisfies Record<keyof IEntityBase, ColumnBuilder<any>>;
