import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { JwtPayload, QueryContext } from '@cbnsndwch/zrocket-contracts';

/**
 * Authentication helper for Zero synced query requests.
 *
 * Extracts and validates JWT tokens from Authorization headers,
 * providing a consistent QueryContext for server-side query filtering.
 *
 * @remarks
 * This helper bridges the gap between HTTP authentication and Zero's
 * query context system. It handles:
 * - JWT extraction from Authorization headers
 * - Token validation and verification
 * - Anonymous access (no auth header)
 * - Error handling for invalid/expired tokens
 *
 * @example
 * ```typescript
 * const auth = new ZeroQueryAuth(jwtService);
 * const ctx = await auth.authenticateRequest(request);
 *
 * if (ctx) {
 *   // Authenticated - apply user-specific filters
 *   query.where('ownerId', '=', ctx.sub);
 * } else {
 *   // Anonymous - show only public data
 *   query.where('isPublic', '=', true);
 * }
 * ```
 */
@Injectable()
export class ZeroQueryAuth {
    private readonly logger = new Logger(ZeroQueryAuth.name);

    constructor(private readonly jwtService: JwtService) {}

    /**
     * Extract and validate JWT from request Authorization header.
     *
     * @param request - The incoming HTTP request
     * @returns QueryContext for authenticated requests, undefined for anonymous access
     *
     * @throws {UnauthorizedException} When authorization header is malformed
     * @throws {UnauthorizedException} When JWT token is invalid or expired
     *
     * @remarks
     * Since QueryContext is an alias for JwtPayload, we simply return the
     * verified JWT payload directly without any transformation. This approach:
     * - Eliminates unnecessary field mapping
     * - Maintains single source of truth
     * - Preserves all JWT claims for query filtering
     *
     * @see {@link QueryContext} - Alias for JwtPayload
     * @see {@link JwtPayload} - Standard JWT claims structure
     */
    async authenticateRequest(
        request: Request
    ): Promise<QueryContext | undefined> {
        const authHeader = request.headers.get('Authorization');

        // No auth header means anonymous access - this is allowed
        if (!authHeader) {
            this.logger.verbose('No Authorization header - anonymous access');
            return undefined;
        }

        // Validate Bearer token format
        if (!authHeader.startsWith('Bearer ')) {
            this.logger.warn(
                `Malformed Authorization header: expected "Bearer <token>", got "${authHeader.substring(0, 20)}..."`
            );
            throw new UnauthorizedException(
                'Invalid authorization header format. Expected "Bearer <token>"'
            );
        }

        // Extract token (remove "Bearer " prefix)
        const token = authHeader.substring(7).trim();

        if (!token) {
            this.logger.warn('Authorization header contains empty token');
            throw new UnauthorizedException(
                'Authorization header contains empty token'
            );
        }

        try {
            // Verify and decode JWT
            // JwtService.verifyAsync throws on invalid/expired tokens
            const payload =
                await this.jwtService.verifyAsync<JwtPayload>(token);

            this.logger.verbose(
                `Successfully authenticated user: ${payload.sub} (${payload.email})`
            );

            // QueryContext is an alias for JwtPayload, so we return it directly
            // No transformation needed!
            return payload;
        } catch (error) {
            // JWT verification failed
            const errorMessage =
                error instanceof Error ? error.message : 'Unknown error';
            this.logger.warn(
                `JWT verification failed: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined
            );

            throw new UnauthorizedException(
                'Invalid or expired authentication token'
            );
        }
    }
}
