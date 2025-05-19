/**
 * Re-export the ZeroParamData type from the parameter decorators
 */
export type { ZeroParamData } from './zero-mutation-params.decorator.js';

/**
 * Metadata key for classes containing Zero mutation handlers.
 */
export const ZERO_MUTATOR_WATERMARK = Symbol.for('__zeroMutator__');

/**
 * Metadata key for Zero mutation handler methods. Stores the mutation name.
 */
export const ZERO_MUTATION_HANDLER_METADATA = Symbol.for(
    '__zeroMutationHandler__'
);

/**
 * Metadata key used internally by parameter decorators in Zero mutation handlers.
 */
export const ZERO_MUTATION_PARAMS_METADATA = Symbol.for(
    '__zeroMutationParams__'
);

/**
 * Metadata key for storing the index of the parameter designated for transaction injection.
 */
export const ZERO_TRANSACTION_PARAM_METADATA = Symbol.for(
    '__zeroTransactionParam__'
);
