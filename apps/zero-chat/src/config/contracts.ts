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
     * config for the upstream MongoDB database
     */
    db: DbConfig;
}
