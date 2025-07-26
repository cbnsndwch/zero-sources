import { SchemaFactory, Schema } from '@nestjs/mongoose';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

import type {
    IGroupRoomBase,
    IRoomBase,
    ROOM_TYPE_CHANNEL,
    ROOM_TYPE_GROUP
} from '@cbnsndwch/zrocket-contracts';

import { PrivateGroupRoom } from './private-group.entity.js';
import { RoomBase } from './room-base.entity.js';

@Schema()
export class PrivateGroupRoom
    extends RoomBase<typeof ROOM_TYPE_GROUP>
    implements IRoomBase<typeof ROOM_TYPE_GROUP>
{
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

export const GroupRoomSchema = SchemaFactory.createForClass(PrivateGroupRoom);
