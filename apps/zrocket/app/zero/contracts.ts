import type { Zero as ZeroConstructor } from '@rocicorp/zero';

import type { Schema } from '@cbnsndwch/zchat-contracts';

import type { Mutators } from './mutators';

export type Zero = ZeroConstructor<Schema, Mutators>;
