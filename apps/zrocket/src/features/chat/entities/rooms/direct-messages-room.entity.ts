import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsArray, IsString } from 'class-validator';

import type {
    IDirectMessagesRoom,
    ROOM_TYPE_DIRECT_MESSAGES
} from '@cbnsndwch/zrocket-contracts';

import { RoomBase } from './room-base.entity.js';

@Schema()
export class DirectMessagesRoom
    extends RoomBase<typeof ROOM_TYPE_DIRECT_MESSAGES>
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
