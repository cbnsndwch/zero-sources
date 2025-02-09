import { ModelDefinition } from '@nestjs/mongoose';

import { messageModelDefinition } from './message.entity.js';
import { roomModelDefinition } from './room.entity.js';
import { subscriptionModelDefinition } from './subscription.entity.js';
import { userModelDefinition } from './user.entity.js';

export * from './message.entity.js';
export * from './room.entity.js';
export * from './subscription.entity.js';
export * from './user.entity.js';
export * from './livechat-agent.entity.js';

export const chatEntities: ModelDefinition[] = [
    messageModelDefinition,
    roomModelDefinition,
    subscriptionModelDefinition,
    userModelDefinition
];
