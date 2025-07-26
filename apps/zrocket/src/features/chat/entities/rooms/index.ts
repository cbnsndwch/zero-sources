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

import { EntityBase } from '../../../../common/entities/base.entity.js';

import { Message, MessageSchema } from '../message.entity.js';
import { Room, RoomSchema } from './room-base.entity.js';
import { DirectMessagesRoom, DirectMessagesRoomSchema } from './direct-messages-room.entity.js';

// ###############################################################

// ###############################################################

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
