import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsArray, IsString } from 'class-validator';

import type {
    IDirectMessagesRoom
} from '@cbnsndwch/zrocket-contracts';
import { RoomType } from '@cbnsndwch/zrocket-contracts';

import { RoomBase } from './room-base.entity.js';

@Schema()
export class DirectMessagesRoom
    extends RoomBase<RoomType.DirectMessages>
    implements IDirectMessagesRoom
{
    declare t: RoomType.DirectMessages;

    @Prop({
        type: [String],
        required: true,
        default: []
    })
    @IsArray()
    @IsString({ each: true })
    declare usernames: string[];
}

export const DirectMessagesRoomSchema =
    SchemaFactory.createForClass(DirectMessagesRoom);
