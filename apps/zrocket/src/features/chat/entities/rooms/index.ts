import { ModelDefinition } from '@nestjs/mongoose';

import { Room, RoomSchema } from './room-base.entity.js';
import {
    DirectMessagesRoom,
    DirectMessagesRoomSchema
} from './direct-messages-room.entity.js';
import { PrivateGroupRoom, GroupRoomSchema } from './private-group.entity.js';
import {
    PublicChannelRoom,
    PublicChannelRoomSchema
} from './public-channel.entity.js';

// Re-export entities for external use
export { Room, DirectMessagesRoom, PrivateGroupRoom, PublicChannelRoom };
export {
    RoomSchema,
    DirectMessagesRoomSchema,
    GroupRoomSchema,
    PublicChannelRoomSchema
};

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
            name: PrivateGroupRoom.name,
            schema: GroupRoomSchema
        },
        {
            name: PublicChannelRoom.name,
            schema: PublicChannelRoomSchema
        }
    ]
};
