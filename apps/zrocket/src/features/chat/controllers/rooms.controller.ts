import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Logger,
    Post
} from '@nestjs/common';
import type { RoomType } from '@cbnsndwch/zrocket-contracts';

import { RoomService } from '../services/room.service.js';

/**
 * REST controller for room operations.
 * Uses regular REST endpoints instead of Zero custom mutators.
 */
@Controller('rooms')
export class RoomsController {
    private readonly logger = new Logger(RoomsController.name);

    constructor(private readonly roomService: RoomService) {}

    /**
     * Create a new room
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createRoom(
        @Body()
        body: {
            type: RoomType;
            memberIds: string[];
            usernames: string[];
            name?: string;
            topic?: string;
            description?: string;
            readOnly?: boolean;
            createdBy: string;
        }
    ) {
        this.logger.log('Creating room:', {
            type: body.type,
            memberCount: body.memberIds?.length,
            createdBy: body.createdBy
        });

        try {
            const room = await this.roomService.createRoom(
                {
                    type: body.type,
                    memberIds: body.memberIds,
                    usernames: body.usernames,
                    name: body.name,
                    topic: body.topic,
                    description: body.description,
                    readOnly: body.readOnly
                },
                body.createdBy
            );

            this.logger.log('Room created successfully:', {
                roomId: room._id,
                type: body.type
            });

            return {
                success: true,
                roomId: room._id,
                message: 'Room created successfully'
            };
        } catch (error) {
            this.logger.error('Failed to create room:', {
                error: error.message,
                type: body.type,
                createdBy: body.createdBy
            });

            throw error;
        }
    }

    /**
     * Invite users to a room
     */
    @Post('invite')
    @HttpCode(HttpStatus.OK)
    async inviteToRoom(
        @Body()
        body: {
            roomId: string;
            userIds: string[];
            usernames: string[];
        }
    ) {
        this.logger.log('Inviting users to room:', {
            roomId: body.roomId,
            userCount: body.userIds?.length
        });

        try {
            await this.roomService.inviteToRoom({
                roomId: body.roomId,
                userIds: body.userIds,
                usernames: body.usernames
            });

            this.logger.log('Users invited successfully:', {
                roomId: body.roomId,
                userCount: body.userIds?.length
            });

            return {
                success: true,
                message: 'Users invited successfully'
            };
        } catch (error) {
            this.logger.error('Failed to invite users:', {
                error: error.message,
                roomId: body.roomId
            });

            throw error;
        }
    }
}
