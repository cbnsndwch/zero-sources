import type { AuthConfig } from '../features/auth/config/auth-config.contracts.js';

/**
 * Configuration for zero-cache change source.
 */
export type ZeroConfig = {
    /**
     * Authentication configuration for zero-cache.
     */
    auth: {
        /**
         * An auth token zero-cache should send in the `k` query string parameter to
         * authenticate. Keep it secret. Include this in the URL you give zero-cache
         * in the `ZERO_UPSTREAM_DB` env variable.
         */
        token: string;
    };

    /**
     * Configuration for the KV service that stores mappings between Change Stream resume
     * tokens and Zero replication watermarks.
     */
    kv: {
        /**
         * Specify `zqlite` to use a @rocicorp/zero-sqlite3 backed KV store.
         */
        provider: 'zqlite';

        /**
         * Configuration for the zqlite KV store provider.
         */
        zqlite: {
            /**
             * The path to the SQLite database file.
             */
            file: string;
        };
    };
};

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
