import { Module } from '@nestjs/common';
import { MongooseModule, type ModelDefinition } from '@nestjs/mongoose';

import { BugsModule } from '../bugs/bugs.module.js';

import { zeroEntities } from './entities/index.js';
import { gateways } from './gateways/index.js';
import { zeroServices } from './services/index.js';

const dbModule = MongooseModule.forFeature(zeroEntities);

@Module({})
export class ZeroModule {
    /**
     * Configures the ZeroModule with the provided entities.
     *
     * @param models - A list of {@linkcode ModelDefinition} objects representing the entities to publish changes for.
     */
    static forEntities(models: ModelDefinition[]) {
        return {
            module: ZeroModule,
            imports: [
                // own
                dbModule,
                // features
                BugsModule
            ],
            providers: [
                // WebSocket change source endpoints
                ...gateways,
                // services
                ...zeroServices
            ]
        };
    }
}
