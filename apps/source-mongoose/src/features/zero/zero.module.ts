import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BugsModule } from '../bugs/bugs.module.js';

import { zeroEntities } from './entities/index.js';
import { gateways } from './gateways/index.js';

const dbModule = MongooseModule.forFeature(zeroEntities);

@Module({
    imports: [
        // own
        dbModule,
        // features
        BugsModule
    ],
    providers: [
        // WebSocket change source endpoints
        ...gateways
    ]
})
export class ZeroModule {}
