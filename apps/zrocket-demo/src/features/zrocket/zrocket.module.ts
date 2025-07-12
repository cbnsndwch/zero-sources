import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { zrocketEntities } from './entities/index.js';
import { DataSeedingService } from './services/index.js';
import { ZRocketController } from './controllers/index.js';

@Module({
    imports: [
        MongooseModule.forFeature(zrocketEntities)
    ],
    controllers: [
        ZRocketController
    ],
    providers: [
        DataSeedingService
    ],
    exports: [
        DataSeedingService
    ]
})
export class ZRocketModule {}