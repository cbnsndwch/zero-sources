import { z } from 'zod';
import type { CustomMutatorDefs } from '@rocicorp/zero';

import { ROOM_TYPES, type RoomType } from '@cbnsndwch/zrocket-contracts';
import type { Schema } from '@cbnsndwch/zrocket-contracts/schema';

export const createRoomInputSchema = z.object({
    t: z.enum<RoomType, typeof ROOM_TYPES>(ROOM_TYPES),
    name: z.string(),
    membersIds: z.array(z.string()).optional()
});

export type CreateRoomInput = z.infer<typeof createRoomInputSchema>;

// async function noop() {}

export function createMutators() {
    return {
        /**
         * Direct Messages mutators
         */
        // dm: {
        //     /**
        //      * Create a new direct messages room
        //      */
        //     create: noop as CustomMutatorImpl<Schema, CreateRoomInput>
        // }
    } as const satisfies CustomMutatorDefs<Schema>;
}

export type Mutators = ReturnType<typeof createMutators>;
