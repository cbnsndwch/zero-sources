import { Schema, Prop, SchemaFactory, ModelDefinition } from '@nestjs/mongoose';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

import type { IRoomBase } from '../contracts/rooms/room.contracts.js';

import {
    ROOM_TYPE_DIRECT_MESSAGES,
    ROOM_TYPE_PRIVATE_GROUP,
    ROOM_TYPE_PUBLIC_GROUP,
    ROOM_TYPES,
    RoomType
} from '../contracts/rooms/room-type.contract.js';
import {
    SYSTEM_MESSAGE_TYPES,
    SystemMessageType
} from '../contracts/messages/message-type.contracts.js';

import { EntityBase } from './base.entity.js';
import { Message, MessageSchema } from './message.entity.js';
import { IDirectMessagesRoom } from '../contracts/rooms/direct-messages.js';
import { IGroupRoomBase } from '../contracts/rooms/group-room.contracts.js';
@Schema({ discriminatorKey: 't' })
export class Room extends EntityBase implements IRoomBase {
    @Prop({
        type: String,
        required: true,
        enum: ROOM_TYPES
    })
    @IsEnum(ROOM_TYPES)
    t!: RoomType;

    @Prop({
        type: [String],
        required: true,
        default: []
    })
    @IsArray()
    @IsString({ each: true })
    memberIds!: string[];

    @Prop({
        type: Number,
        required: true,
        default: 0
    })
    messageCount!: number;

    @Prop({
        type: MessageSchema
    })
    lastMessage?: Message;

    @Prop({
        type: Date
    })
    lastMessageAt?: Date;

    @Prop({
        type: [String],
        enum: SYSTEM_MESSAGE_TYPES
    })
    systemMessages?: SystemMessageType[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);

// ###############################################################

@Schema()
export class DirectMessagesRoom extends Room implements IDirectMessagesRoom {
    t: typeof ROOM_TYPE_DIRECT_MESSAGES = ROOM_TYPE_DIRECT_MESSAGES;

    @Prop({
        type: [String],
        required: true,
        default: []
    })
    @IsArray()
    @IsString({ each: true })
    usernames!: string[];
}

export const DirectMessagesRoomSchema = SchemaFactory.createForClass(DirectMessagesRoom);

// ###############################################################

@Schema({ discriminatorKey: 't' })
export class GroupRoom extends Room implements IGroupRoomBase {
    declare t: typeof ROOM_TYPE_PRIVATE_GROUP | typeof ROOM_TYPE_PUBLIC_GROUP;

    @IsString()
    name!: string;

    @IsOptional()
    @IsBoolean()
    readOnly?: boolean | undefined;

    @IsOptional()
    @IsBoolean()
    featured?: true | undefined;

    @IsOptional()
    @IsBoolean()
    default?: boolean | undefined;

    @IsOptional()
    @IsString()
    topic?: string | undefined;

    @IsOptional()
    @IsString()
    description?: string | undefined;

    @IsOptional()
    @IsBoolean()
    archived?: boolean | undefined;
}

export const GroupRoomSchema = SchemaFactory.createForClass(GroupRoom);

// ###############################################################

export const roomModelDefinition: ModelDefinition = {
    name: Room.name,
    schema: RoomSchema,
    collection: 'rooms',
    discriminators: [
        {
            name: DirectMessagesRoom.name,
            schema: DirectMessagesRoomSchema
        },
        {
            name: GroupRoom.name,
            schema: GroupRoomSchema
        }
    ]
};
