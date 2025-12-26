import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model, ClientSession } from 'mongoose';
import type { SerializedEditorState } from 'lexical';

import { UserMessageType } from '@cbnsndwch/zrocket-contracts';

import { Message, type MessageDocument } from '../entities/message.entity.js';
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
        private readonly messageModel: Model<MessageDocument>,
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

        const now = new Date();

        // Create the message
        const [message] = await this.messageModel.create(
            [
                {
                    roomId: input.roomId,
                    t: UserMessageType.USER,
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
                    } as SerializedEditorState<any>,
                    groupable: true,
                    createdAt: now,
                    updatedAt: now
                }
            ],
            { session: session ?? undefined }
        );

        // Update room message count and last message
        await this.roomModel.updateOne(
            { _id: room._id },
            {
                $set: {
                    lastMessage: {
                        _id: message._id.toString(),
                        roomId: message.roomId,
                        sender: message.sender!,
                        contents: message.contents!,
                        groupable: message.groupable,
                        createdAt: now,
                        updatedAt: now
                    },
                    lastMessageAt: now,
                    updatedAt: now
                },
                $inc: { messageCount: 1 }
            },
            { session: session ?? undefined }
        );

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
