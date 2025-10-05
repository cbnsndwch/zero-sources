import type { Schema } from '@cbnsndwch/zrocket-contracts/schema';

import type { Zero } from './zero/contracts';

export declare global {
    interface Window {
        z: Zero;
        schema: Schema;
    }
}
