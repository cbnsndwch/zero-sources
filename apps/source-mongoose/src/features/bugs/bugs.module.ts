import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { bugsEntities } from './entities/index.js';

const dbModule = MongooseModule.forFeature(bugsEntities);

@Module({
    imports: [dbModule],
    exports: [dbModule],
    providers: [
        // TODO: services, models, etc
    ]
})
export class BugsModule {}
