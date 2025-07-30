import { createUseZero } from '@rocicorp/zero/react';
import type { Zero } from '@rocicorp/zero';

import type { Schema } from '@cbnsndwch/zrocket-contracts/schema';

import type { Mutators } from './mutators';

export const useZero: () => Zero<Schema, Mutators> = createUseZero<
    Schema,
    Mutators
>();
