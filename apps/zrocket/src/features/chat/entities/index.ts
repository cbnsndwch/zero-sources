import { ModelDefinition } from '@nestjs/mongoose';

import {
    ClientMutation,
    ClientMutationSchema
} from './client-mutation.entity.js';
import { messageModelDefinition } from './message.entity.js';
import {
    MutationResult,
    MutationResultSchema
} from './mutation-result.entity.js';
import { roomModelDefinition } from './rooms/index.js';
// import { subscriptionModelDefinition } from './subscription.entity.js';

export * from './client-mutation.entity.js';
export * from './message.entity.js';
export * from './mutation-result.entity.js';
export * from './rooms/index.js';
// export * from './livechat-agent.entity.js';
// export * from './subscription.entity.js';

export const chatEntities: ModelDefinition[] = [
    messageModelDefinition,
    roomModelDefinition,
    { name: ClientMutation.name, schema: ClientMutationSchema },
    { name: MutationResult.name, schema: MutationResultSchema }
    // subscriptionModelDefinition
];
