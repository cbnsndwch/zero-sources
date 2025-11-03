/**
 * Creates an HTTP 500 Internal Server Error response with JSON error details.
 *
 * @param error - The main error message to include in the response
 * @param details - Optional additional error details. If an Error object is provided,
 *                 its message will be extracted; otherwise defaults to 'Unknown error'
 * @returns A Response object with status 500 and JSON content type containing
 *          the error message and details
 */
export function internalServerError(
    error: string,
    details?: unknown,
    status = 500
) {
    return new Response(
        JSON.stringify({
            error,
            details:
                details instanceof Error ? details.message : 'Unknown error'
        }),
        {
            status,
            headers: { 'Content-Type': 'application/json' }
        }
    );
}

/**
 * Creates an HTTP error response with JSON content for client errors.
 *
 * @param error - The error message to include in the response body
 * @param status - The HTTP status code to return (defaults to 400)
 * @returns A Response object with the error message as JSON and appropriate headers
 *
 * @example
 * ```typescript
 * // Returns a 400 Bad Request with error message
 * return clientError("Invalid input provided");
 *
 * // Returns a 404 Not Found with custom message
 * return clientError("Resource not found", 404);
 * ```
 */
export function clientError(error: string, status = 400) {
    return new Response(
        JSON.stringify({
            error
        }),
        {
            status,
            headers: { 'Content-Type': 'application/json' }
        }
    );
}
