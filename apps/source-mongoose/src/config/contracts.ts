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
 * Configuration interface for MongoDB database connection.
 */
export interface DbConfig {
    /**
     * The URL of the MongoDB database
     */
    uri: string;

    /**
     * One or more collection to publish changes for to zero.
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
}
