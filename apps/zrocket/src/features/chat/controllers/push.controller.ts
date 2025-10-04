import {
    Controller,
    Post,
    HttpCode,
    HttpStatus,
    Req,
    Res
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Request as ExpressRequest, Response } from 'express';
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
     * 
     * Converts Express request to Web Request for PushProcessor.
     */
    @Post()
    @HttpCode(HttpStatus.OK)
    async processPush(@Req() req: ExpressRequest, @Res() res: Response) {
        // Create server mutators with injected services
        const mutators = createServerMutators(
            this.messageService,
            this.roomService
        );

        // Convert Express request to Web Request
        const protocol = req.protocol || 'http';
        const host = req.get('host') || 'localhost';
        const url = `${protocol}://${host}${req.url}`;
        
        const webRequest = new Request(url, {
            method: req.method,
            headers: req.headers as HeadersInit,
            body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
        });

        // Process the push request
        const result = await this.processor.process(mutators, webRequest);
        
        return res.json(result);
    }
}
