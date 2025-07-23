import { createUseZero } from '@rocicorp/zero/react';
import type { Zero } from '@rocicorp/zero';

import type { Schema } from '@cbnsndwch/zchat-contracts';

import type { Mutators } from './mutators';

export const useZero: () => Zero<Schema, Mutators> = createUseZero<
    Schema,
    Mutators
>();
