/**
 * Configuration for JWT authentication.
 */
export type JwtAuthConfig = {
    /**
     * The secret key used to sign the JWT tokens.
     */
    secret: string;

    /**
     * The lifetime of the JWT token in seconds.
     */
    tokenLifetime: number;
};

/**
 * Setting for authenticating with a GitHub OAuth application.
 */
export type GithubOAuthConfig = {
    /**
     * The client ID for the GitHub OAuth application.
     */
    clientId: string;

    /**
     * The client secret for the GitHub OAuth application.
     */
    clientSecret: string;

    /**
     * The callback URL for the GitHub OAuth application. If using a reverse
     * proxy make sure to specify the externally facing URL.
     */
    callbackUrl: string;
};

export type AuthConfig = {
    /**
     * Settings for the built-in JWT auth provider
     */
    jwt: JwtAuthConfig;

    /**
     * Settings for the Github OAuth provider
     */
    github: GithubOAuthConfig;
};

export type AuthProvider = keyof Omit<AuthConfig, 'provider'>;
