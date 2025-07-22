import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsOptional,
    IsString
} from 'class-validator';
import {
    type IDirectMessagesRoom,
    type IGroupRoomBase,
    type RoomType,
    type SystemMessageType,
    type IRoomBase,
    ROOM_TYPE_DIRECT_MESSAGES,
    ROOM_TYPE_PRIVATE_GROUP,
    ROOM_TYPE_PUBLIC_GROUP,
    ROOM_TYPES,
    SYSTEM_MESSAGE_TYPES
} from '@cbnsndwch/zchat-contracts';

import { EntityBase } from '../../../common/entities/base.entity.js';

import { Message, MessageSchema } from './message.entity.js';

abstract class RoomBase extends EntityBase implements Omit<IRoomBase, 't'> {
    t!: RoomType;
    memberIds!: string[];
    messageCount!: number;
    lastMessage?: Message;
    lastMessageAt?: Date;
    systemMessages?: SystemMessageType[];
}

@Schema({ discriminatorKey: 't' })
export class Room extends RoomBase implements IRoomBase {
    @Prop({
        type: String,
        required: true,
        enum: ROOM_TYPES
    })
    @IsEnum(ROOM_TYPES)
    declare t: RoomType;

    @Prop({
        type: [String],
        required: true,
        default: []
    })
    @IsArray()
    @IsString({ each: true })
    declare memberIds: string[];

    @Prop({
        type: Number,
        required: true,
        default: 0
    })
    declare messageCount: number;

    @Prop({
        type: MessageSchema
    })
    declare lastMessage?: Message;

    @Prop({
        type: Date
    })
    declare lastMessageAt?: Date;

    @Prop({
        type: [String],
        enum: SYSTEM_MESSAGE_TYPES
    })
    declare systemMessages?: SystemMessageType[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);

// ###############################################################

@Schema()
export class DirectMessagesRoom
    extends RoomBase
    implements IDirectMessagesRoom
{
    declare t: typeof ROOM_TYPE_DIRECT_MESSAGES;

    @Prop({
        type: [String],
        required: true,
        default: []
    })
    @IsArray()
    @IsString({ each: true })
    usernames!: string[];
}

export const DirectMessagesRoomSchema =
    SchemaFactory.createForClass(DirectMessagesRoom);

// ###############################################################

@Schema()
export class GroupRoom extends RoomBase implements IGroupRoomBase {
    declare t: typeof ROOM_TYPE_PRIVATE_GROUP | typeof ROOM_TYPE_PUBLIC_GROUP;

    @IsString()
    name!: string;

    @IsOptional()
    @IsBoolean()
    readOnly?: boolean;

    @IsOptional()
    @IsBoolean()
    featured?: true;

    @IsOptional()
    @IsBoolean()
    default?: boolean;

    @IsOptional()
    @IsString()
    topic?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    archived?: boolean;
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
