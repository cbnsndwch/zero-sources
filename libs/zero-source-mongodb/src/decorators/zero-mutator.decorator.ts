import { SetMetadata } from '@nestjs/common';

import { ZERO_MUTATOR_WATERMARK } from './zero-mutation.constants.js';

/**
 * Decorator that marks a class as a container for Zero mutation handlers.
 * Optionally takes a namespace string which will be prefixed to all mutation
 * names defined within the class (e.g., "namespace|mutationName").
 *
 * @param namespace Optional namespace for the mutations in this class.
 *
 * @example
 * ```typescript
 * @ZeroMutator('issue')
 * export class IssueMutator {
 *   // ...handler methods
 * }
 * ```
 */
export const ZeroMutator = (namespace?: string): ClassDecorator =>
    SetMetadata(ZERO_MUTATOR_WATERMARK, { namespace: namespace ?? '' });
