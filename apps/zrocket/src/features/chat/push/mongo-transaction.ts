import type { ClientSession, Connection } from 'mongoose';

/**
 * MongoDB transaction wrapper for Zero's ServerTransaction API.
 * Provides access to Mongoose session and connection within a transaction.
 */
export interface MongoTransaction {
    readonly session: ClientSession;
    readonly connection: Connection;
    readonly clientID: string;
    readonly mutationID: number;
}
