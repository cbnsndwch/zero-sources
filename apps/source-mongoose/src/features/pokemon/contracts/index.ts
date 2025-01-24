import type { Row } from '@rocicorp/zero';

import type { schema } from './schema.js';

export * from './schema.js';
export * from './permissions.js';

export type IPokemon = Row<typeof schema.tables.pokemon>;