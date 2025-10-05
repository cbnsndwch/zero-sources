import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Logger,
    Post,
    Query
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { CustomMutatorDefs, PushProcessor } from '@rocicorp/zero/server';
import type { Connection } from 'mongoose';

import type { Dict } from '@cbnsndwch/zero-contracts';

import { MongoTransaction } from '../push/index.js';
import { MongoDatabase } from '../push/mongodb-database.js';
import { createServerMutators } from '../push/server-mutators.js';
import { MessageService } from '../services/message.service.js';
import { RoomService } from '../services/room.service.js';

/**
 * Push processor endpoint for Zero custom mutators.
 * Handles mutation requests from zero-cache using the push protocol.
 */
@Controller('push')
export class PushController {
    private readonly logger = new Logger(PushController.name);
    private readonly processor: PushProcessor<
        MongoDatabase,
        ReturnType<typeof createServerMutators>
    >;

    private readonly mutators: CustomMutatorDefs<MongoTransaction>;

    constructor(
        @InjectConnection() private readonly connection: Connection,
        private readonly messageService: MessageService,
        private readonly roomService: RoomService
    ) {
        // Initialize push processor with MongoDB database adapter
        const database = new MongoDatabase(this.connection);
        this.processor = new PushProcessor(database, 'debug');

        // Create server mutators with injected services
        this.mutators = createServerMutators(
            this.messageService,
            this.roomService
        );
    }

    /**
     * Process push request from zero-cache.
     * This endpoint implements Zero's push protocol for custom mutators.
     *
     * Converts Express request to Web Request for PushProcessor.
     */
    @Post()
    @HttpCode(HttpStatus.OK)
    async processPush(@Query() query: Dict, @Body() body: Dict) {
        // Log the incoming push request for debugging
        this.logger.log('Received push request:', {
            clientID: body?.clientID,
            clientGroupID: body?.clientGroupID,
            mutationID: body?.mutationID,
            mutations: body?.mutations?.map((m: any) => ({
                id: m.id,
                name: m.name,
                args: m.args
            }))
        });

        try {
            // Process the push request
            const result = await this.processor.process(
                this.mutators,
                query,
                body
            );

            // Log the result details
            this.logger.log('Push request processed', {
                clientID: body?.clientID,
                mutationCount: body?.mutations?.length,
                resultKeys: Object.keys(result || {}),
                // Log if there are any mutation errors in the result
                hasMutationErrors: result && 'mutationErrors' in result
            });

            // PushProcessor returns HTTP 200 even when mutations fail
            // The errors are included in the result structure
            return result;
        } catch (error) {
            // This catch block should only fire for infrastructure errors
            // (DB connection issues, etc.) not business logic errors
            // Infrastructure errors should cause zero-cache to retry
            this.logger.error('Push processor infrastructure error:', {
                error: error.message,
                stack: error.stack,
                clientID: body?.clientID,
                mutationID: body?.mutationID
            });

            // Re-throw to let NestJS return 500
            // This tells zero-cache to retry (connection/DB issues)
            throw error;
        }
    }
}
