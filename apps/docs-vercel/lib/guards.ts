import { clientError } from './responses';

/**
 * Asserts that the HTTP request method matches the expected method.
 *
 * @param request - The HTTP request object to validate
 * @param method - The expected HTTP method (e.g., 'GET', 'POST', 'PUT', 'DELETE')
 * @throws {Response} Throws a 405 Method Not Allowed response if the request method doesn't match
 *
 * @example
 * ```typescript
 * // Will throw if request method is not POST
 * assertRequestMethod(request, 'POST');
 * ```
 */
export function assertRequestMethod(request: Request, method: string): void {
    if (request.method.toLowerCase() === method.toLowerCase()) {
        return;
    }

    throw clientError('Method not allowed', 405);
}

/**
 * Throws an error if the condition is false.
 *
 * @param condition The condition to check.
 * @param message The error message to include if the condition is false.
 * @param status The HTTP status code to use in the response (default is 400).
 * @returns A Response object with the error message and status code if the condition is false; otherwise, does nothing.
 */
export function checkInvariant(
    condition: boolean,
    message: string,
    status = 400
) {
    if (condition) {
        return;
    }

    return clientError(message, status);
}
