import type { FactoryProvider, ModuleMetadata } from '@nestjs/common';

import type { TableSpec } from './change-maker.contracts.js';

/**
 * Options for the ZeroMongoModule.
 */
export type ZeroMongoModuleOptions = {
    /**
     * The token to authenticate the streamer with.
     */
    streamerToken?: string;

    /**
     * The schemas of the tables to stream changes for.
     */
    tables: TableSpec[];

    /**
     * (Optional) The source/filter/projection mappings for the schema tables,
     * if any.
     */
    tableMappings?: Record<string, string>;

    /**
     * The permissions configuration for the Zero application.
     */
    permissions?: any;
};

export type ZeroMongoModuleAsyncOptions = Pick<ModuleMetadata, 'imports'> &
    Pick<FactoryProvider<ZeroMongoModuleOptions>, 'inject' | 'useFactory'>;

export const TOKEN_MODULE_OPTIONS = Symbol.for('TOKEN_MODULE_OPTIONS');
