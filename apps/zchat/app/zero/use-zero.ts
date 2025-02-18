import { createUseZero, type CustomMutatorDefs } from '@rocicorp/zero/react';

import type { Schema } from '@cbnsndwch/zchat-contracts';

export const useZero = createUseZero<Schema, CustomMutatorDefs<Schema>>();
