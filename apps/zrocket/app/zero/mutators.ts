import { z } from 'zod';
import type { CustomMutatorDefs, CustomMutatorImpl } from '@rocicorp/zero';

import { ROOM_TYPES, type Schema } from '@cbnsndwch/zchat-contracts';

export const createRoomInputSchema = z.object({
    t: z.enum(ROOM_TYPES),
    name: z.string(),
    membersIds: z.array(z.string()).optional()
});

export type CreateRoomInput = z.infer<typeof createRoomInputSchema>;

async function noop() {}

export function createMutators() {
    return {
        /**
         * Direct Messages mutators
         */
        dm: {
            /**
             * Create a new direct messages room
             */
            create: noop as CustomMutatorImpl<Schema, CreateRoomInput>
        }
    } as const satisfies CustomMutatorDefs<Schema>;
}

export type Mutators = ReturnType<typeof createMutators>;
