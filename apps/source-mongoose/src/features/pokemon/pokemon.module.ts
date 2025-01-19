import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { pokemonEntities } from './entities/index.js';

const mongooseModule = MongooseModule.forFeature(pokemonEntities);

@Module({
    imports: [mongooseModule],
    exports: [mongooseModule],
    providers: [
        // TODO: services, models, etc
    ]
})
export class PokemonModule {}