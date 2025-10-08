import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from '../users/users.module.js';

import { MessagesController } from './controllers/messages.controller.js';
import { RoomsController } from './controllers/rooms.controller.js';
import { chatEntities } from './entities/index.js';
import { chatServices } from './services/index.js';

/**
 * Chat module using Zero for reads (queries) and REST for writes.
 *
 * @remarks
 * ## Controller-Based Architecture
 *
 * Following NestJS best practices, controllers handle ALL external requests:
 * - REST endpoints (`@Post`, `@Get`, etc.) - Write operations
 * - Zero synced queries (`@SyncedQuery`) - Read operations with filtering
 *
 * ### RoomsController
 * **REST Endpoints:**
 * - `POST /rooms` - Create room
 * - `POST /rooms/invite` - Invite users
 *
 * **Zero Synced Queries:**
 * - `myChats` - User's accessible chats
 * - `myGroups` - User's accessible groups
 * - `chatById` - Specific chat with messages
 * - `groupById` - Specific group with messages
 *
 * ### MessagesController
 * **REST Endpoints:**
 * - `POST /messages` - Send message
 *
 * **Zero Synced Queries:**
 * - `roomMessages` - Messages for a room
 * - `searchMessages` - Search across rooms
 */
@Module({
    imports: [
        // features
        UsersModule,
        // own
        MongooseModule.forFeature(chatEntities)
    ],
    controllers: [
        MessagesController, // REST + synced queries for messages
        RoomsController // REST + synced queries for rooms
    ],
    providers: [
        // services
        ...chatServices // Includes RoomAccessService, RoomService, MessageService
    ],
    exports: [
        // Export services that might be needed by other modules
        ...chatServices
    ]
})
export class ChatModule {}
