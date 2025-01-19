import type { Row } from '@cbnsndwch/zero';

import type { schema } from './schema.js';

export * from './schema.js';
export * from './permissions.js';

export type IPokemon = Row<typeof schema.tables.pokemon>;