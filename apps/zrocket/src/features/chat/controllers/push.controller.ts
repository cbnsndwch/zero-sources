import {
    Body,
    Controller,
    Post,
    HttpCode,
    HttpStatus,
    Req
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { PushProcessor } from '@rocicorp/zero/server';

import { MessageService } from '../services/message.service.js';
import { RoomService } from '../services/room.service.js';
import { MongoDatabase } from '../push/mongodb-database.js';
import { createServerMutators } from '../push/server-mutators.js';

/**
 * Push processor endpoint for Zero custom mutators.
 * Handles mutation requests from zero-cache using the push protocol.
 */
@Controller('push')
export class PushController {
    private readonly processor: PushProcessor<
        MongoDatabase,
        ReturnType<typeof createServerMutators>
    >;

    constructor(
        @InjectConnection() private readonly connection: Connection,
        private readonly messageService: MessageService,
        private readonly roomService: RoomService
    ) {
        // Initialize push processor with MongoDB database adapter
        const database = new MongoDatabase(this.connection);
        this.processor = new PushProcessor(database, 'debug');
    }

    /**
     * Process push request from zero-cache.
     * This endpoint implements Zero's push protocol for custom mutators.
     */
    @Post()
    @HttpCode(HttpStatus.OK)
    async processPush(@Req() request: Request, @Body() _body: unknown) {
        // Create server mutators with injected services
        const mutators = createServerMutators(
            this.messageService,
            this.roomService
        );

        // Process the push request
        return await this.processor.process(mutators, request);
    }
}
