import type { ModelDefinition } from '@nestjs/mongoose';
import { snakeCase } from 'change-case';

import { Pokemon, PokemonSchema } from './pokemon.entity.js';

export * from './pokemon.entity.js';

export const pokemonEntities: ModelDefinition[] = [
    {
        name: Pokemon.name,
        collection: snakeCase(Pokemon.name),
        schema: PokemonSchema
    }
];
