import { Controller, Post, Body, Req } from '@nestjs/common';

import type { TransformRequestBody } from './contracts.js';
import { SyncedQueryTransformService } from './services/index.js';
import { TransformResponseMessage } from '@rocicorp/zero';

/**
 * Factory function to create a controller with a dynamic route path.
 *
 * This allows the library to create a controller at a user-specified path
 * without requiring the user to create their own controller.
 *
 * @param path - The path where the controller should be mounted
 * @returns A controller class with the configured path
 *
 * @internal
 * This is used by SyncedQueriesModule.forRoot() to create the controller.
 */
export function createSyncedQueriesController(path: string) {
    /**
     * Controller that handles Zero synced query transformation requests.
     *
     * This controller is automatically configured by `SyncedQueriesModule.forRoot()`
     * and mounted at the specified path.
     *
     * @remarks
     * This is internal plumbing - users don't need to know about this controller.
     * It's automatically included when you import `SyncedQueriesModule.forRoot()`.
     */
    @Controller(path)
    class SyncedQueriesController {
        constructor(
            public readonly transformService: SyncedQueryTransformService
        ) {}

        /**
         * Handle incoming synced query transformation requests from Zero cache.
         *
         * @param request - Full HTTP request object (passed to guards and handlers)
         * @param message - Array of query requests from Zero cache
         * @returns Array of query responses (success or error)
         *
         * @remarks
         * This controller acts as a bridge between the Express HTTP request/response
         * cycle and the internal query name-based routing system. It extracts the
         * authenticated user using the configured `getUserFromRequest` function and
         * attaches it to the request object before passing the full request through
         * to the transform service.
         */
        @Post()
        async handleQueries(
            @Req() request: any,
            @Body() [_transform, input]: ['transform', TransformRequestBody]
        ): Promise<TransformResponseMessage> {
            // Pass the full request object through the chain
            // This allows guards to access headers, cookies, and other request
            // properties
            const response = await this.transformService.transformQueries(
                request,
                input
            );

            // response format should match zero's {@link TransformResponseMessage} contract
            return ['transformed', response];
        }
    }

    // Set a display name for debugging
    Object.defineProperty(SyncedQueriesController, 'name', {
        value: `SyncedQueriesController(${path})`,
        writable: false
    });

    return SyncedQueriesController;
}
