import { invariant } from '../invariant.mjs';

/**
 * Truncates a UTF-8 encoded string to a specified maximum number of bytes.
 * Ensures that the truncation does not cut off a multibyte character.
 *
 * @param msg - The string to be truncated.
 * @param maxBytes - The maximum number of bytes the truncated string should have. Defaults to 123.
 * @returns The truncated string if its byte length exceeds the specified limit, otherwise the original string.
 * @throws Will throw an error if `msg` is not a string or `maxBytes` is not a number or is less than 1.
 */
export function truncateBytes(msg: string, maxBytes = 123) {
    invariant(typeof msg === 'string', 'Expected `msg`` to be a string');
    invariant(typeof maxBytes === 'number', 'Expected `maxBytes` to be a number');
    invariant(maxBytes > 0, 'Expected `maxBytes` to be a positive number');

    const buffer = Buffer.from(msg, 'utf8');

    if (buffer.length <= maxBytes) {
        // If the string's byte length is within the limit, return it as is
        return msg;
    }

    // Otherwise, we need to truncate it
    const truncatedBuffer = buffer.subarray(0, maxBytes);
    let result = truncatedBuffer.toString('utf8');

    // Ensure the truncation does not cut a multibyte character
    while (result.length !== Buffer.from(result, 'utf8').length) {
        result = truncatedBuffer.subarray(0, -1).toString('utf8');
    }

    return result;
}
