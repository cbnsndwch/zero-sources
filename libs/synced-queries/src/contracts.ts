/**
 * Constants and data types for synced query metadata storage.
 *
 * @remarks
 * These constants and data types define the metadata keys used by the synced query decorators
 * to store configuration on class methods. The keys are used by the registry
 * service during discovery to identify and register query handlers.
 *
 * @module synced-query.contracts
 */

import type z from 'zod';
import type { AST } from '@rocicorp/zero';

/**
 * Metadata key for synced query handlers.
 *
 * Used by @SyncedQuery decorator to mark methods as query handlers
 * and store their configuration.
 */
export const SYNCED_QUERY_METADATA = 'synced-query:metadata';

/**
 * Metadata key for storing parameter decorator information.
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

/**
 * Request item structure from Zero cache server.
 */
export interface TransformRequestItem {
    id: string;
    name: string;
    args: any[];
}

/**
 * Successful query transformation response.
 */
export interface TransformQuerySuccess {
    id: string;
    name: string;
    ast: AST;
}

/**
 * Error response for failed query transformation.
 */
export interface TransformQueryError {
    error: 'app';
    id: string;
    name: string;
    details: any;
}

/**
 * Union type for query transformation results.
 */
export type TransformQueryResult = TransformQuerySuccess | TransformQueryError;

/**
 * Request body type from Zero cache (array of query requests).
 */
export type TransformRequestBody = TransformRequestItem[];

/**
 * Metadata for a parameter decorator.
 */
export interface SyncedQueryParamMetadata {
    /**
     * The type of parameter injection.
     */
    type: SyncedQueryParamType;

    /**
     * The index of the parameter in the method signature.
     */
    parameterIndex: number;

    /**
     * Additional data for the parameter (e.g., argument index for QueryArg).
     */
    data?: any;
}

/**
 * Type definition for a query handler function.
 */
export type QueryHandler = (...args: any[]) => Promise<any>;

/**
 * Configuration for a synced query handler.
 */
export interface SyncedQueryMetadata {
    /**
     * The name of the query as registered with Zero.
     * Must match the query name used in client-side query definitions.
     */
    queryName: string;

    /**
     * Zod schema for validating query input arguments.
     * Should be a tuple schema matching the expected arguments.
     *
     * @example
     * ```typescript
     * z.tuple([z.string(), z.number()]) // For (id: string, limit: number)
     * z.tuple([]) // For no arguments
     * ```
     */
    inputSchema: z.ZodTypeAny;
}
