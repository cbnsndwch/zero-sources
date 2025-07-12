import type { ModelDefinition } from '@nestjs/mongoose';

import { Room, RoomSchema } from './room.entity.js';
import { Message, MessageSchema } from './message.entity.js';
import { Participant, ParticipantSchema } from './participant.entity.js';

export * from './room.entity.js';
export * from './message.entity.js';
export * from './participant.entity.js';

export const zrocketEntities: ModelDefinition[] = [
    {
        name: Room.name,
        schema: RoomSchema
    },
    {
        name: Message.name,
        schema: MessageSchema
    },
    {
        name: Participant.name,
        schema: ParticipantSchema
    }
];