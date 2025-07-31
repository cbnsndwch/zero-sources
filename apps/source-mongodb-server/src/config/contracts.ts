import type { ZqliteKvOptions } from '@cbnsndwch/zero-watermark-zqlite';

/**
 * Configuration interface for MongoDB database connection.
 */
export interface DbConfig {
    /**
     * The URL of the MongoDB database
     */
    uri: string;

    /**
     * One or more collections to publish changes for to zero.
     */
    publish: string[];
}

/**
 * Auth config for zero-cache
 */
export type AuthConfig = {
    /**
     * An auth token zero-cache should send in the `k` query string parameter to authenticate
     */
    token: string;
};

/**
 * Config for the NATS/JetStream KV provider
 */
export type NatsKvOptions = {
    /**
     * the list of NATS servers to connect to, specify multiple servers for HA.
     */
    servers: string[];

    /**
     * NATS auth credentials
     */
    auth: {
        /**
         * NATS user. Must be specified together with `pwd`
         */
        user: string;

        /**
         * NATS pwd. Must be specified together with `user`
         */
        pwd: string;
    };
};

/**
 * Configuration interface for schema loading.
 */
export interface SchemaConfig {
    /**
     * Source type for schema loading
     */
    source: 'file' | 'url' | 'inline';
    
    /**
     * Path to schema file (when source = 'file')
     */
    schemaFile?: string;
    
    /**
     * Path to table mappings file (when source = 'file')
     */
    tableMappingsFile?: string;
    
    /**
     * URL to fetch schema from (when source = 'url')
     */
    schemaUrl?: string;
    
    /**
     * URL to fetch table mappings from (when source = 'url')
     */
    tableMappingsUrl?: string;
    
    /**
     * Inline schema configuration (when source = 'inline')
     */
    inlineSchema?: any;
    
    /**
     * Inline table mappings (when source = 'inline')
     */
    inlineTableMappings?: Record<string, any>;
}

export type KvConfig =
    | { provider: 'nats'; nats: NatsKvOptions; zqlite: never }
    | { provider: 'zqlite'; zqlite: ZqliteKvOptions; nats: never };

/**
 * Configuration for zero-cache and related services
 */
export interface ZeroConfig {
    /**
     * Auth config for zero-cache
     */
    auth: AuthConfig;

    /**
     * Config for the KV server (NATS or Zqlite)
     */
    kv: KvConfig;
}

/**
 * Configuration for the application.
 */
export interface AppConfig {
    /**
     * Auth config for the application
     */
    auth: {
        jwt: {
            secret: string;
            tokenLifetime: number;
        };
        github: {
            clientId: string;
            clientSecret: string;
            callbackUrl: string;
        };
    };

    /**
     * config for the upstream MongoDB database
     */
    db: DbConfig;

    /**
     * Configuration for zero-cache and related services
     */
    zero: ZeroConfig;

    /**
     * Configuration for schema and table mappings loading
     */
    schema: SchemaConfig;
}
