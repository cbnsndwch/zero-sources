import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { zeroEntities } from './entities/index.js';
import { zeroGateways } from './gateways/index.js';
import { zeroServices } from './services/index.js';

@Module({
    imports: [
        // own
        MongooseModule.forFeature(zeroEntities)
    ],
    providers: [
        // WebSocket change source endpoints
        ...zeroGateways,
        // services
        ...zeroServices
    ]
})
export class ZeroModule {}
