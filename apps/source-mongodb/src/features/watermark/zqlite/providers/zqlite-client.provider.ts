import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import Zqlite from '@rocicorp/zero-sqlite3';

import { AppConfig, KvConfig } from '../../../../config/contracts.js';

export const TOKEN_ZQLITE_DB = 'TOKEN_ZQLITE_DB';

export const zqliteDbProvider: FactoryProvider<Zqlite.Database> = {
    provide: TOKEN_ZQLITE_DB,
    inject: [ConfigService],
    async useFactory(configService: ConfigService<AppConfig>) {
        const kvConfig = configService.get<KvConfig>('kv')!;

        if (kvConfig.provider !== 'zqlite') {
            throw new Error('Invalid KV provider, expected `zqlite`');
        }

        const db = new Zqlite(kvConfig.zqlite.file, { fileMustExist: false });

        // init the KV table
        db.prepare('CREATE TABLE IF NOT EXISTS zero_kv (key TEXT PRIMARY KEY, value TEXT)').run();

        return db;
    }
};
