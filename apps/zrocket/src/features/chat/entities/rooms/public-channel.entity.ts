import { SchemaFactory, Schema } from '@nestjs/mongoose';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

import type { RoomType } from '@cbnsndwch/zrocket-contracts';

import { RoomBase } from './room-base.entity.js';

@Schema()
export class PublicChannelRoom extends RoomBase<RoomType.PublicChannel> {
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

export const PublicChannelRoomSchema =
    SchemaFactory.createForClass(PublicChannelRoom);
