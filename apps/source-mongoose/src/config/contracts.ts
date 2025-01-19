/**
 * Describes the configuration for publishing data from a specific source.
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
     * One or more publications to configure for the application.
     *
     * Each publication describes a change stream against a specific collection.
     */
    publish: Publication[];
}

/**
 * Configuration for the application.
 */
export interface AppConfig {
    /**
     * config for the upstream MongoDB database
     */
    db: DbConfig;
}
