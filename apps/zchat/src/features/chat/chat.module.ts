import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { chatControllers } from './controllers/index.js';
import { chatEntities } from './entities/index.js';
import { chatServices } from './services/index.js';

@Module({
    imports: [
        // own
        MongooseModule.forFeature(chatEntities)
    ],
    controllers: [
        ...chatControllers 
    ],
    providers: [
        // services
        ...chatServices
    ]
})
export class ChatModule {}
