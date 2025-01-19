// import { createSchema, relationships } from '@cbnsndwch/zero';

import { pokemonZeroSchema } from '../entities';

//#region Relationships

//#endregion Relationships

export const schema = {
    version: 5,
    tables: {
        pokemon: pokemonZeroSchema
    },
    relationships: {
        // TODO
    }
};

export type Schema = typeof schema;

export type TableName = keyof Schema['tables'];
