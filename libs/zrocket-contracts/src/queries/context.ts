/**
 * Query context available to all synced queries.
 *
 * This context is populated from JWT claims on the server side when processing
 * Zero synced query requests. It provides authenticated user information that
 * can be used to filter and secure query results based on user permissions.
 *
 * @remarks
 * The context is extracted from the JWT token's claims:
 * - `userID` is populated from the `sub` (subject) claim
 * - `role` can be used for role-based access control
 * - `username` is populated from the `name` claim for display purposes
 *
 * @see {@link https://rocicorp.dev/docs/zero/synced-queries Zero Synced Queries Documentation}
 */
export type QueryContext = {
    /**
     * The authenticated user's ID from the JWT `sub` (subject) claim.
     *
     * This is the primary identifier used to filter queries based on user ownership
     * and access permissions.
     *
     * @see {@link https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1.2 RFC 7519 Subject Claim}
     */
    userID: string;

    /**
     * Optional role for role-based access control and admin features.
     *
     * @remarks
     * Used to differentiate between regular users and administrators for
     * implementing role-based query filtering and permissions.
     */
    role?: 'admin' | 'user';

    /**
     * Username for display purposes.
     *
     * @remarks
     * Populated from the JWT `name` claim. This is typically used for
     * display purposes in the UI and should not be relied upon for
     * security decisions.
     *
     * @see {@link https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims OIDC Standard Claims}
     */
    username?: string;
};

/**
 * Type guard to check if the query context contains required authentication information.
 *
 * @param ctx - The query context to check, which may be undefined for anonymous requests
 * @returns `true` if the context is defined and contains a valid userID, `false` otherwise
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
 *     .where('ownerId', '=', ctx.userID)
 *     .all();
 * }
 * ```
 */
export function isAuthenticated(
    ctx: QueryContext | undefined
): ctx is QueryContext {
    return ctx !== undefined && !!ctx.userID;
}
