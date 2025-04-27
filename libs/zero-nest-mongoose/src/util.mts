import { Type, LoggerService } from '@nestjs/common';

export function typedEntries<T extends object>(
    obj: T
): [keyof T, T[keyof T]][] {
    return Object.entries(obj) as [keyof T, T[keyof T]][];
}

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
    const _condition =
        typeof condition === 'function' ? condition() : condition;
    if (_condition) {
        return;
    }

    const _message = typeof message === 'function' ? message() : message;

    // if a logger service was passed in, log the error
    logger?.error(_message);

    const ErrorImpl = errorClass ?? Error;

    throw new ErrorImpl(_message);
}
