/* eslint-disable @typescript-eslint/no-explicit-any */
import { SetMetadata } from '@nestjs/common';

import { ZERO_MUTATION_HANDLER_METADATA } from './zero-mutation.constants.js';

/**
 * Decorator that marks a method within a @ZeroMutator() class as a handler
 * for a specific Zero custom mutation.
 *
 * @param name The name of the custom mutation this method handles. If the class
 *             has a namespace, the final mutation name will be "namespace|name".
 *
 * @example
 * ```typescript
 * @ZeroMutator('issue')
 * export class IssueMutator {
 *   @ZeroMutationHandler('create')
 *   async createIssue(@MutationArgs() args: CreateIssueArgs) {
 *     // Handle issue creation
 *   }
 * }
 * ```
 */
export const ZeroMutation = (name: string): any =>
    SetMetadata(ZERO_MUTATION_HANDLER_METADATA, { name });
