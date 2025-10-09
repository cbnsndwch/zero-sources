import type { Type, LoggerService } from '@nestjs/common';

/**
 * Throws an error of the specified type with the given message if the condition
 * is not met.
 *
 * @param condition - The condition to check or a function that return the condition.
 * @param message - The error message to throw if the condition is false.
 * @param errorClass - An optional error class to throw if the item is undefined. Defaults to `Error`
 * @param logger - An optional logger service to log the error message if the condition is false.
 */
export function invariant<TError extends Error = Error>(
    condition: boolean | (() => boolean),
    message: string | (() => string),
    errorClass?: Type<TError>,
    logger?: LoggerService
): asserts condition {
    // expand the condition if it's a function
    const expandedCondition =
        typeof condition === 'function' ? condition() : condition;

    // if the condition is met, early return
    if (expandedCondition) {
        return;
    }

    // expand the message if it's a function
    const msg = typeof message === 'function' ? message() : message;

    // if a logger service was passed in, log the error
    logger?.error(msg);

    // use the specified error class or fallback to the default Error class
    const ErrorImpl = errorClass ?? Error;

    // throw!
    throw new ErrorImpl(msg);
}
