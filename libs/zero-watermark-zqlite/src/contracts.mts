import type { FactoryProvider, ModuleMetadata } from '@nestjs/common';

/**
 * Injection token for the Zero-SQLite3 database client instance
 */
export const TOKEN_WATERMARK_ZQLITE_DB = Symbol.for('TOKEN_WATERMARK_ZQLITE_DB');

/**
 * Config for the Zero-SQLite3 KV provider
 */
export type ZqliteKvOptions = {
    /**
     * The path to the zero-sqlite3 database file
     */
    file: string;
};

export type ZqliteWatermarkModuleAsyncOptions = Pick<ModuleMetadata, 'imports'> &
    Pick<FactoryProvider<ZqliteKvOptions>, 'inject' | 'useFactory'>;
