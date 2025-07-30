import { ModelDefinition } from '@nestjs/mongoose';

import { messageModelDefinition } from './message.entity.js';
import { roomModelDefinition } from './rooms/index.js';
// import { subscriptionModelDefinition } from './subscription.entity.js';

export * from './message.entity.js';
export * from './rooms/index.js';
// export * from './livechat-agent.entity.js';
// export * from './subscription.entity.js';

export const chatEntities: ModelDefinition[] = [
    messageModelDefinition,
    roomModelDefinition
    // subscriptionModelDefinition
];
