import fs from 'node:fs';

import { Module, type DynamicModule, type FactoryProvider } from '@nestjs/common';
import Zqlite from '@rocicorp/zero-sqlite3';

import { invariant, IWatermarkService, TOKEN_WATERMARK_SERVICE } from '@cbnsndwch/zero-contracts';

import {
    TOKEN_WATERMARK_ZQLITE_DB,
    ZqliteKvOptions,
    type ZqliteWatermarkModuleAsyncOptions
} from './contracts.mjs';
import { ZqliteWatermarkService } from './zqlite-watermark.service.mjs';
import { ConfigModule } from '@nestjs/config';

/**
 * The DDL statement to initialize the KV table in the ZQLite database
 */
const DDL_INIT = 'CREATE TABLE IF NOT EXISTS zero_kv (key TEXT PRIMARY KEY, value TEXT)';

/**
 * Injection token for the Zero-SQLite3 database options
 */
const TOKEN_ZQLITE_DB_OPTIONS = Symbol.for('TOKEN_ZQLITE_DB_OPTIONS');

@Module({})
export class ZqliteWatermarkModule {
    /**
     * Use this method to configure and register the ZQLite-based watermark
     * service.
     *
     * **NOTE:** This is a global module, import a *single* instance in your
     * app's top-level module.
     *
     * @param options - The options to configure the ZQLite database.
     */
    static forRootAsync(options: ZqliteWatermarkModuleAsyncOptions): DynamicModule {
        const optionsProvider: FactoryProvider<ZqliteKvOptions> = {
            provide: TOKEN_ZQLITE_DB_OPTIONS,
            inject: options.inject ?? [],
            useFactory: options.useFactory
        };

        const zqliteDbProvider: FactoryProvider<Zqlite.Database> = {
            provide: TOKEN_WATERMARK_ZQLITE_DB,
            inject: [TOKEN_ZQLITE_DB_OPTIONS],
            async useFactory(config: ZqliteKvOptions) {
                invariant(Boolean(config.file), 'ZqliteKvOptions.file must be defined');

                let stat: fs.Stats | undefined;
                try {
                    stat = fs.statSync(config.file);
                } catch {
                    // ignore if file does not exist
                }

                // file path must point to a file or not exist
                invariant(
                    !stat || !stat.isDirectory(),
                    'ZqliteKvOptions.file must not point to a directory'
                );

                // open the database (will create it if it doesn't exist)
                const db = new Zqlite(config.file, { fileMustExist: false });

                // init the KV table if needed
                db.prepare(DDL_INIT).run();

                return db;
            }
        };

        const watermarkServiceProvider: FactoryProvider<IWatermarkService> = {
            provide: TOKEN_WATERMARK_SERVICE,
            inject: [TOKEN_WATERMARK_ZQLITE_DB],
            useFactory(db: Zqlite.Database) {
                return new ZqliteWatermarkService(db);
            }
        };

        return {
            global: true,
            module: ZqliteWatermarkModule,
            imports: [ConfigModule, ...options.imports ?? []],
            providers: [optionsProvider, zqliteDbProvider, watermarkServiceProvider],
            exports: [watermarkServiceProvider]
        };
    }
}
