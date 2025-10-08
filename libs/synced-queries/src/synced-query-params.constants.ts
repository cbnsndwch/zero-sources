/**
 * Constants for synced query parameter metadata.
 *
 * @remarks
 * These constants define the metadata keys used by parameter decorators
 * to store information about parameter injection.
 *
 * @module synced-query-params.constants
 */

/**
 * Metadata key for storing parameter decorator information.
 *
 * Used by @CurrentUser and other parameter decorators to mark
 * parameters for dependency injection.
 */
export const SYNCED_QUERY_PARAM_METADATA = 'zero:synced-query-param';

/**
 * Parameter types that can be injected into query handlers.
 */
export enum SyncedQueryParamType {
    /**
     * Inject a specific query argument by index.
     */
    QUERY_ARG = 'queryArg'
}
