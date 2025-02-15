/**
 * Claims contained in the JSON Web Token we issue to our authenticated users
 *
 * @see {@link https://en.wikipedia.org/wiki/JSON_Web_Token#Standard_fields}
 */
export type JwtPayload = {
    /**
     * Internal user ID.
     *
     * Matches the `Subject (subject)` claim from `RFC 7519`.
     *
     * @see {@link https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1.2}
     */
    sub: string;

    /**
     * The timestamp at which the JWT was issued, in Unix time format.
     *
     * Matches the `Issued At (iat)` claim from `RFC 7519`.
     *
     * @see {@link https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1.6}
     */
    iat?: number;

    /**
     * Identifies the expiration time on or after which the JWT MUST NOT be
     * accepted for processing. The processing of the "exp" claim requires that
     * the current date/time MUST be before the expiration date/time listed
     * in the "exp" claim.
     *
     * Implementers MAY provide for some small leeway, usually no more than
     * a few minutes, to account for clock skew.  Its value MUST be a number
     * containing a NumericDate value. Use of this claim is OPTIONAL.
     *
     * Matches the `Expiration Time (exp)` claim from `RFC 7519`.
     *
     * @see {@link https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1.4}
     */
    exp?: number;

    /**
     * End-User's full name in displayable form including all name parts,
     * possibly including titles and suffixes, ordered according to the
     * End-User's locale and preferences.
     *
     * Matches the `Name (name)` claim from `OIDC 1.0`.
     *
     * @see {@link https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims}
     */
    name?: string;

    /**
     * Shorthand name by which the End-User wishes to be referred to at the RP,
     * such as `jane_doe` or `j.doe`. This value MAY be any valid JSON string
     * including special characters such as `@`, `/`, or whitespace. 
     * 
     * Matches the `Preferred Username (preferred_username)` claim from `OIDC 1.0`.
     *
     * **NOTE:** The RP MUST NOT rely upon this value being unique, as discussed in
     * Section 5.7 of the `OIDC 1.0` spec.
     */
    preferred_username?: string;

    /**
     * End-User's preferred e-mail address. Its value MUST conform to the
     * `RFC 5322` `addr-spec` syntax.
     *
     * Matches the `Email` claim from `OIDC 1.0`.
     *
     * **NOTE:** The RP MUST NOT rely upon this value being unique, as discussed in
     * Section 5.7 of the `OIDC 1.0` spec.
     *
     * @see {@link https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1.2}
     */
    email: string;

    /**
     * URL of the End-User's profile picture. This URL MUST refer to an image
     * file (for example, a PNG, JPEG, or GIF image file), rather than to a Web
     * page containing an image. Note that this URL SHOULD specifically reference
     * a profile photo of the End-User suitable for displaying when describing
     * the End-User, rather than an arbitrary photo taken by the End-User.
     *
     * Matches the `Picture (picture)` claim from `OIDC 1.0`.
     *
     * @see {@link https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims}
     */
    picture?: string;

    /**
     * Global roles assigned to the user.
     */
    roles?: string[];
};
