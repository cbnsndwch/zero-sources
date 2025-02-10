import { ModelDefinition } from '@nestjs/mongoose';

import { userModelDefinition } from './user.entity.js';

export * from './user.entity.js';

export const chatEntities: ModelDefinition[] = [userModelDefinition];
