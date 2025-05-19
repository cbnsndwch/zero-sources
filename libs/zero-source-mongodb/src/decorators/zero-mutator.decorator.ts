/* eslint-disable @typescript-eslint/no-explicit-any */
import { SetMetadata } from '@nestjs/common';

import { ZERO_MUTATION_HANDLER_METADATA } from './zero-mutator.constants.js';

/**
 * Decorator that marks a method within a `@ZeroMutator()` class as a handler
 * for a specific Zero custom mutation.
 *
 * ```typescript
@ZeroMutator('issue')
export class IssueMutator {

  constructor(private readonly yourService: YourService) {}

  @Mutation('create')
  async createIssue(@MutationArgs() args: CreateIssueArgs) {
    // Handle issue creation
  }
}
 * ```
 * 
 * @param name The name of the custom mutation this method handles. If the class
 *             has a namespace, the final mutation name will be "namespace|name".
 */
export function Mutation(name: string, namespace?: string): any {
    return SetMetadata(ZERO_MUTATION_HANDLER_METADATA, { namespace, name });
}
