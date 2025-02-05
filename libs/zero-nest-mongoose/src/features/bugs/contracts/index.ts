import type { Row } from '@rocicorp/zero';

import type { schema } from './schema.js';

export * from './schema.js';
export * from './permissions.js';

export type IIssue = Row<typeof schema.tables.issue>;
export type IComment = Row<typeof schema.tables.comment>;
export type IUser = Row<typeof schema.tables.user>;
