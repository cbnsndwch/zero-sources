import type { JwtPayload } from '../auth/index.js';

/**
 * Query context available to all synced queries.
 *
 * This is simply an alias for {@link JwtPayload} - we use the JWT payload directly
 * as the query context to avoid duplication and unnecessary transformations.
 *
 * @remarks
 * By using JwtPayload directly:
 * - No magic field name translations
 * - Single source of truth for user claims
 * - Authentication helper just passes through the verified JWT
 * - All JWT fields available for query filtering (including iat, exp if needed)
 *
 * @see {@link https://rocicorp.dev/docs/zero/synced-queries Zero Synced Queries Documentation}
 * @see {@link JwtPayload} for field definitions and documentation
 */
export type QueryContext = JwtPayload;

/**
 * Type guard to check if the query context contains required authentication information.
 *
 * @param ctx - The query context to check, which may be undefined for anonymous requests
 * @returns `true` if the context is defined and contains a valid sub (user ID), `false` otherwise
 *
 * @remarks
 * This type guard can be used to narrow the type of the context from
 * `QueryContext | undefined` to `QueryContext`, enabling TypeScript to
 * provide proper type checking for authenticated-only code paths.
 *
 * @example
 * ```typescript
 * function myQuery(builder, ctx) {
 *   if (!isAuthenticated(ctx)) {
 *     // Handle anonymous user case
 *     return builder.publicChannels.all();
 *   }
 *
 *   // ctx is now typed as QueryContext (not undefined)
 *   return builder.rooms
 *     .where('ownerId', '=', ctx.sub)
 *     .all();
 * }
 * ```
 */
export function isAuthenticated(
    ctx: QueryContext | undefined
): ctx is QueryContext {
    return ctx !== undefined && !!ctx.sub;
}
