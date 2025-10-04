import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from '../users/users.module.js';

import { PushController } from './controllers/push.controller.js';
import { chatEntities } from './entities/index.js';
import { chatServices } from './services/index.js';

@Module({
    imports: [
        // features
        UsersModule,
        // own
        MongooseModule.forFeature(chatEntities)
    ],
    controllers: [PushController],
    providers: [
        // services
        ...chatServices
    ]
})
export class ChatModule {}
