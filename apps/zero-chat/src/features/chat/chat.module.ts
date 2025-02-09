import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { chatEntities } from './entities/index.js';
import { chatServices } from './services/index.js';

@Module({
    imports: [
        // own
        MongooseModule.forFeature(chatEntities)
    ],
    providers: [
        // services
        ...chatServices
    ]
})
export class ChatModule {}
