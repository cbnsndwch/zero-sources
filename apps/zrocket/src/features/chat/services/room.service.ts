import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import type { RoomType } from '@cbnsndwch/zrocket-contracts';

import { Room } from '../entities/rooms/room-base.entity.js';
import { DirectMessagesRoom } from '../entities/rooms/direct-messages-room.entity.js';
import { PrivateGroupRoom } from '../entities/rooms/private-group.entity.js';
import { PublicChannelRoom } from '../entities/rooms/public-channel.entity.js';

export interface CreateRoomInput {
    type: RoomType;
    memberIds: string[];
    usernames: string[];
    name?: string;
    topic?: string;
    description?: string;
    readOnly?: boolean;
}

export interface InviteToRoomInput {
    roomId: string;
    userIds: string[];
    usernames: string[];
}

@Injectable()
export class RoomService {
    constructor(
        @InjectModel(Room.name)
        private readonly roomModel: Model<Room>,
        @InjectModel(DirectMessagesRoom.name)
        private readonly directMessageModel: Model<DirectMessagesRoom>,
        @InjectModel(PrivateGroupRoom.name)
        private readonly privateGroupModel: Model<PrivateGroupRoom>,
        @InjectModel(PublicChannelRoom.name)
        private readonly publicChannelModel: Model<PublicChannelRoom>
    ) {}

    /**
     * Create a new room based on type
     */
    async createRoom(
        input: CreateRoomInput,
        _createdBy: string,
        session?: ClientSession
    ): Promise<Room> {
        const baseData = {
            memberIds: input.memberIds,
            usernames: input.usernames,
            messageCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const createOptions = session ? { session } : {};
        let room: Room;

        switch (input.type) {
            case 'd': {
                // Direct message room
                const [created] = await this.directMessageModel.create(
                    [
                        {
                            ...baseData,
                            t: 'd'
                        }
                    ],
                    createOptions
                );
                room = created;
                break;
            }
            case 'p': {
                // Private group
                if (!input.name) {
                    throw new Error('Private groups require a name');
                }
                const [created] = await this.privateGroupModel.create(
                    [
                        {
                            ...baseData,
                            t: 'p',
                            name: input.name,
                            topic: input.topic,
                            description: input.description,
                            readOnly: input.readOnly ?? false,
                            archived: false
                        }
                    ],
                    createOptions
                );
                room = created;
                break;
            }
            case 'c': {
                // Public channel
                if (!input.name) {
                    throw new Error('Public channels require a name');
                }
                const [created] = await this.publicChannelModel.create(
                    [
                        {
                            ...baseData,
                            t: 'c',
                            name: input.name,
                            topic: input.topic,
                            description: input.description,
                            readOnly: input.readOnly ?? false,
                            archived: false
                        }
                    ],
                    createOptions
                );
                room = created;
                break;
            }
            default:
                throw new Error(`Unknown room type: ${input.type}`);
        }

        return room;
    }

    /**
     * Invite users to an existing room
     */
    async inviteToRoom(
        input: InviteToRoomInput,
        session?: ClientSession
    ): Promise<Room> {
        const room = await this.roomModel
            .findById(input.roomId)
            .session(session ?? null);

        if (!room) {
            throw new NotFoundException(`Room ${input.roomId} not found`);
        }

        // Add new members (avoid duplicates)
        const newMemberIds = input.userIds.filter(
            id => !room.memberIds.includes(id)
        );
        const newUsernames = input.usernames.filter(
            name => !room.usernames.includes(name)
        );

        if (newMemberIds.length === 0) {
            return room; // No new members to add
        }

        room.memberIds.push(...newMemberIds);
        room.usernames.push(...newUsernames);
        room.updatedAt = new Date();

        if (session) {
            await room.save({ session });
        } else {
            await room.save();
        }

        return room;
    }

    /**
     * Get a room by ID
     */
    async findById(roomId: string): Promise<Room | null> {
        return this.roomModel.findById(roomId).exec();
    }

    /**
     * Get all rooms for a user
     */
    async findByMemberId(userId: string): Promise<Room[]> {
        return this.roomModel.find({ memberIds: userId }).exec();
    }
}
