import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsArray, IsEnum, IsString } from 'class-validator';

import {
    type IRoomBase,
    type IUserMessage,
    ROOM_TYPES,
    type RoomType,
    SYSTEM_MESSAGE_TYPES,
    type SystemMessageType
} from '@cbnsndwch/zrocket-contracts';

import { EntityBase } from '../../../../common/entities/base.entity.js';

import { MessageSchema } from '../message.entity.js';

export abstract class RoomBase<TType extends RoomType = RoomType>
    extends EntityBase
    implements IRoomBase<TType>
{
    t!: TType;
    createdAt!: Date;
    memberIds!: string[];
    usernames!: string[];
    messageCount!: number;
    lastMessage?: IUserMessage;
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
    declare lastMessage?: IUserMessage;

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
