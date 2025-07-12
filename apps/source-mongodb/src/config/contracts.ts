/**
 * Describes the configuration for publishing data from a specific source.\\
 *
 * TODO: consider allowing the use of a unique aggregation pipeline per collection
 *
 * @remarks
 * This documentation provides insight into how the associated collection and pipeline
 * are used to define and process the data publication flow.
 *
 * @property collection -
 * @property pipeline - An array of operations describing how the data is transformed or filtered.
 */
export type Publication = {
    /**
     * The name of the MongoDB collection to publish changes from.
     */
    collection: string;

    /**
     * An aggregation pipeline to apply to the change stream.
     */
    pipeline?: any[];
};

/**
 * Configuration for mapping a Zero table to an upstream MongoDB collection
 * with optional filtering and projection.
 */
export interface UpstreamTableMapping {
    /**
     * Upstream MongoDB collection identifier
     */
    source: string;

    /**
     * Optional MongoDB query filter to determine which records belong to this Zero table
     */
    filter?: object;

    /**
     * Optional MongoDB projection to transform record structure before streaming to Zero
     */
    projection?: object;
}

/**
 * Configuration interface for MongoDB database connection.
 */
export interface DbConfig {
    /**
     * The URL of the MongoDB database
     */
    uri: string;

    /**
     * Configuration for Zero schema tables mapped to upstream MongoDB collections.
     * Each key is a Zero table name, each value defines the upstream mapping.
     */
    tables: {
        [zeroTableName: string]: UpstreamTableMapping;
    };

    /**
     * @deprecated Use `tables` instead. One or more collections to publish changes for to zero.
     * This field is kept for backward compatibility.
     */
    publish?: string[];
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
 * Config for the Zero-SQLite3 KV provider
 */
export type ZqliteKvOptions = {
    /**
     * The path to the zero-sqlite3 database file
     */
    file: string;
};

export type KvConfig =
    | { provider: 'nats'; nats: NatsKvOptions; zqlite: never }
    | { provider: 'zqlite'; zqlite: ZqliteKvOptions; nats: never };

/**
 * Configuration for the application.
 */
export interface AppConfig {
    /**
     * Auth config for zero-cache
     */
    auth: AuthConfig;

    /**
     * config for the upstream MongoDB database
     */
    db: DbConfig;

    /**
     * Config for the NATS KV server
     */
    kv: NatsKvOptions;
}
