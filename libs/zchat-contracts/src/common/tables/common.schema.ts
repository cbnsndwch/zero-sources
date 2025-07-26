import { string, type ColumnBuilder } from '@rocicorp/zero';

import type { IEntityBase } from '../base.contracts.js';

export const entityBaseColumns: Record<
    keyof IEntityBase,
    ColumnBuilder<any>
> = {
    _id: string(),
    updatedAt: string()
};
