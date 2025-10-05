import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from '../users/users.module.js';

import { MessagesController } from './controllers/messages.controller.js';
import { RoomsController } from './controllers/rooms.controller.js';
import { chatEntities } from './entities/index.js';
import { chatServices } from './services/index.js';

/**
 * Chat module using Zero for reads (queries) and REST for writes.
 * This is simpler than using Zero custom mutators and works well for most use cases.
 */
@Module({
    imports: [
        // features
        UsersModule,
        // own
        MongooseModule.forFeature(chatEntities)
    ],
    controllers: [MessagesController, RoomsController],
    providers: [
        // services
        ...chatServices
    ]
})
export class ChatModule {}
