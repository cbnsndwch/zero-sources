import type { FactoryProvider, ModuleMetadata } from '@nestjs/common';

import type { TableSpec } from './change-maker.contracts.js';

/**
 * Options for the ZeroMySql.
 */
export type ZeroMySqlModuleOptions = {
    /**
     * The token to authenticate the streamer with.
     */
    streamerToken?: string;

    /**
     * The schemas of the tables to stream changes for.
     */
    tables: TableSpec[];
};

export type ZeroMySqlAsyncOptions = Pick<ModuleMetadata, 'imports'> &
    Pick<FactoryProvider<ZeroMySqlModuleOptions>, 'inject' | 'useFactory'>;

export const TOKEN_ZERO_MYSQL_MODULE_OPTIONS = Symbol.for(
    'TOKEN_ZERO_MYSQL_MODULE_OPTIONS'
);
