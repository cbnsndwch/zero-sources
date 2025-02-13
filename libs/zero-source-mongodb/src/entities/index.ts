import type { ModelDefinition } from '@nestjs/mongoose';

import { StreamerShard, StreamerShardSchema } from './streamer-shard.entity.js';

export * from './streamer-shard.entity.js';

export const zeroEntities: ModelDefinition[] = [
    {
        name: StreamerShard.name,
        schema: StreamerShardSchema
    }
];
