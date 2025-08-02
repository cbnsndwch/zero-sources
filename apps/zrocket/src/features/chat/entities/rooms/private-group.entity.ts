import { SchemaFactory, Schema } from '@nestjs/mongoose';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

import type { RoomType } from '@cbnsndwch/zrocket-contracts';

import { RoomBase } from './room-base.entity.js';

@Schema()
export class PrivateGroupRoom extends RoomBase<RoomType.PrivateGroup> {
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
