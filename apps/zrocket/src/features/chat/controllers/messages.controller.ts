import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Logger,
    Post
} from '@nestjs/common';

import { MessageService } from '../services/message.service.js';

/**
 * REST controller for message operations.
 * Uses regular REST endpoints instead of Zero custom mutators.
 */
@Controller('messages')
export class MessagesController {
    private readonly logger = new Logger(MessagesController.name);

    constructor(private readonly messageService: MessageService) {}

    /**
     * Send a new message to a room
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async sendMessage(
        @Body()
        body: {
            roomId: string;
            content: string;
            userId: string;
            username: string;
        }
    ) {
        this.logger.log('Sending message:', {
            roomId: body.roomId,
            userId: body.userId,
            contentLength: body.content?.length
        });

        try {
            const message = await this.messageService.sendMessage({
                roomId: body.roomId,
                content: body.content,
                userId: body.userId,
                username: body.username
            });

            this.logger.log('Message sent successfully:', {
                messageId: message._id,
                roomId: body.roomId
            });

            return {
                success: true,
                messageId: message._id,
                message: 'Message sent successfully'
            };
        } catch (error) {
            this.logger.error('Failed to send message:', {
                error: error.message,
                roomId: body.roomId,
                userId: body.userId
            });

            throw error;
        }
    }
}
