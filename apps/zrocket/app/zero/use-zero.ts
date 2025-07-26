import { createUseZero } from '@rocicorp/zero/react';
import type { Zero } from '@rocicorp/zero';

import type { DiscriminatedSchema as Schema } from '@cbnsndwch/zrocket-contracts';

import type { Mutators } from './mutators';

export const useZero: () => Zero<Schema, Mutators> = createUseZero<
    Schema,
    Mutators
>();
