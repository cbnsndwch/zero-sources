import { Module } from '@nestjs/common';
import { MongooseModule, type ModelDefinition } from '@nestjs/mongoose';

import { BugsModule } from '../bugs/bugs.module.js';

import { zeroEntities } from './entities/index.js';
import { gateways } from './gateways/index.js';
import { providePublishedCollections } from './providers/index.js';

const dbModule = MongooseModule.forFeature(zeroEntities);

@Module({})
export class ZeroModule {
    /**
     * Configures the ZeroModule with the provided entities.
     *
     * @param models - A list of {@linkcode ModelDefinition} objects representing the entities to publish changes for.
     */
    static forEntities(models: ModelDefinition[]) {
        const publishedCollectionsProvider = providePublishedCollections(models);

        return {
            module: ZeroModule,
            imports: [
                // own
                dbModule,
                // features
                BugsModule
            ],
            providers: [
                // the list of entities to publish changes for
                publishedCollectionsProvider,
                // WebSocket change source endpoints
                ...gateways
            ],
            exports: [
                // in case we want to use them other modules
                publishedCollectionsProvider
            ]
        };
    }
}
