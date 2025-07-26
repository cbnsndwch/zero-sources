import type { ZeroConfig } from '@cbnsndwch/zero-contracts';

import type { AuthConfig } from '../features/auth/config/auth-config.contracts.js';

/**
 * Configuration interface for MongoDB database connection.
 */
export interface DbConfig {
    /**
     * The URL of the MongoDB database
     */
    uri: string;
}

/**
 * Configuration for the application.
 */
export interface AppConfig {
    /**
     * Config for the auth provider
     */
    auth: AuthConfig;

    /**
     * config for the upstream MongoDB database
     */
    db: DbConfig;

    /**
     * Configuration for the zero-cache change source module
     */
    zero: ZeroConfig;
}
