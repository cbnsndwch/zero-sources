import { Injectable } from '@nestjs/common';

import { ZERO_MUTATOR_WATERMARK } from './zero-mutator.constants.js';

/**
 * Decorator that marks a class as a namespace for Zero custom mutators.
 * Optionally takes a namespace string which will be prefixed to all mutator
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
export function ZeroMutator(namespace = ''): ClassDecorator {
    const makeInjectable = Injectable();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    return function <TFunction extends Function>(target: TFunction) {
        // make the class injectable
        makeInjectable(target);

        // apply the metadata to the class
        Reflect.defineMetadata(ZERO_MUTATOR_WATERMARK, { namespace }, target);

        return target;
    };
}
