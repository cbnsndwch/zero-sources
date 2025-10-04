import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';

import { Message } from '../entities/message.entity.js';
import { Room } from '../entities/rooms/room-base.entity.js';

export interface SendMessageInput {
    roomId: string;
    content: string;
    userId: string;
    username: string;
}

@Injectable()
export class MessageService {
    constructor(
        @InjectModel(Message.name)
        private readonly messageModel: Model<Message>,
        @InjectModel(Room.name)
        private readonly roomModel: Model<Room>
    ) {}

    /**
     * Send a new message to a room
     */
    async sendMessage(
        input: SendMessageInput,
        session?: ClientSession
    ): Promise<Message> {
        // Verify room exists and user is a member
        const room = await this.roomModel
            .findById(input.roomId)
            .session(session ?? null);

        if (!room) {
            throw new NotFoundException(`Room ${input.roomId} not found`);
        }

        if (!room.memberIds.includes(input.userId)) {
            throw new Error('You must be a room member to send messages');
        }

        // Create the message
        const [message] = await this.messageModel.create(
            [
                {
                    roomId: input.roomId,
                    t: 'USER', // User message type
                    sender: {
                        _id: input.userId,
                        username: input.username
                    },
                    contents: {
                        root: {
                            children: [
                                {
                                    children: [
                                        {
                                            detail: 0,
                                            format: 0,
                                            mode: 'normal',
                                            style: '',
                                            text: input.content,
                                            type: 'text',
                                            version: 1
                                        }
                                    ],
                                    direction: 'ltr',
                                    format: '',
                                    indent: 0,
                                    type: 'paragraph',
                                    version: 1
                                }
                            ],
                            direction: 'ltr',
                            format: '',
                            indent: 0,
                            type: 'root',
                            version: 1
                        }
                    },
                    groupable: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ],
            { session: session ?? undefined }
        );

        // Update room message count and last message
        room.messageCount += 1;
        const now = new Date();
        room.lastMessage = {
            _id: message._id.toString(),
            roomId: message.roomId,
            sender: message.sender!,
            contents: message.contents!,
            groupable: message.groupable,
            createdAt: now,
            updatedAt: now
        };
        room.lastMessageAt = now;
        room.updatedAt = now;

        if (session) {
            await room.save({ session });
        } else {
            await room.save();
        }

        return message;
    }

    /**
     * Get messages for a room
     */
    async findByRoomId(roomId: string, limit = 50): Promise<Message[]> {
        return this.messageModel
            .find({ roomId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();
    }
}
