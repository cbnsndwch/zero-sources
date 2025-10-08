import { Controller, Post, Body, Req, Inject } from '@nestjs/common';

import { SyncedQueryTransformService } from './synced-query-transform.service.js';
import type { TransformRequestBody } from './synced-query-transform.service.js';

/**
 * Factory function to create a controller with a dynamic route path.
 *
 * This allows the library to create a controller at a user-specified path
 * without requiring the user to create their own controller.
 *
 * @param path - The path where the controller should be mounted
 * @param getUserFromRequest - Function to extract user from request
 * @returns A controller class with the configured path
 *
 * @internal
 * This is used by SyncedQueriesModule.forRoot() to create the controller.
 */
export function createSyncedQueriesController(
    path: string,
    getUserFromRequest: (req: any) => any
) {
    /**
     * Controller that handles Zero synced query transformation requests.
     *
     * This controller is automatically configured by `SyncedQueriesModule.forRoot()`
     * and mounted at the specified path.
     *
     * @remarks
     * This is internal plumbing - users don't need to know about this controller.
     * It's automatically included when you import `SyncedQueriesModule.forRoot()`.
     *
     * ## Request/Response Format
     *
     * **Request**: POST to configured path with JSON body
     * ```json
     * [
     *   { "id": "q1", "name": "myChats", "args": [] },
     *   { "id": "q2", "name": "chatById", "args": ["chat-123"] }
     * ]
     * ```
     *
     * **Response**: Array of query results
     * ```json
     * [
     *   { "id": "q1", "name": "myChats", "ast": { ... } },
     *   { "id": "q2", "name": "chatById", "ast": { ... } }
     * ]
     * ```
     */
    @Controller(path)
    class SyncedQueriesController {
        constructor(
            public readonly transformService: SyncedQueryTransformService
        ) {}

        /**
         * Handle incoming synced query transformation requests from Zero cache.
         *
         * @param request - HTTP request (used to extract authenticated user)
         * @param body - Array of query requests from Zero cache
         * @returns Array of query responses (success or error)
         */
        @Post()
        async handleQueries(
            @Req() request: any,
            @Body() body: TransformRequestBody
        ) {
            const user = getUserFromRequest(request);
            return await this.transformService.transformQueries(user, body);
        }
    }

    // Set a display name for debugging
    Object.defineProperty(SyncedQueriesController, 'name', {
        value: `SyncedQueriesController(${path})`,
        writable: false
    });

    return SyncedQueriesController;
}
