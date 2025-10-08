/**
 * Constants for synced query metadata storage.
 *
 * @remarks
 * These constants define the metadata keys used by the synced query decorators
 * to store configuration on class methods. The keys are used by the registry
 * service during discovery to identify and register query handlers.
 *
 * @module synced-query.constants
 */

/**
 * Metadata key for synced query handlers.
 *
 * Used by @SyncedQuery decorator to mark methods as query handlers
 * and store their configuration.
 */
export const SYNCED_QUERY_METADATA = 'synced-query:metadata';
