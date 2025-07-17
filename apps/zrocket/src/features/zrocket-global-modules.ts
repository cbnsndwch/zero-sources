import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';

import { discriminatedSchema } from '@cbnsndwch/zchat-contracts';
import { invariant } from '@cbnsndwch/zero-contracts';
import {
    ZeroMongoModule,
    ZeroMongoModuleOptions
} from '@cbnsndwch/zero-source-mongodb';
import { ZqliteWatermarkModule } from '@cbnsndwch/zero-watermark-zqlite';

import type { AppConfig, DbConfig, ZeroConfig } from '../config/contracts.js';
import loadYamlConfig from '../config/load-yaml-config.js';
import { tableSpecsFromSchema } from './utils.js';

const isLocalhost = (uri: string) =>
    ['localhost', '127.0.0.1'].some(localhost => uri.includes(localhost));

const dbModule = MongooseModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    async useFactory(config: ConfigService<AppConfig>) {
        const { uri } = config.get<DbConfig>('db')!;

        // force IPv4 if DB URI is localhost
        const family = isLocalhost(uri) ? 4 : undefined;

        return {
            uri,
            family
        } satisfies MongooseModuleFactoryOptions;
    }
});

const configModule = ConfigModule.forRoot({
    isGlobal: true,
    load: [loadYamlConfig]
});

const zqliteWatermarkModule = ZqliteWatermarkModule.forRootAsync({
    inject: [ConfigService],
    async useFactory(config: ConfigService<AppConfig>) {
        const zeroConfig = config.get<ZeroConfig>('zero');
        invariant(
            typeof zeroConfig === 'object',
            'Invalid zero config, expected object'
        );

        const { kv } = zeroConfig;
        invariant(
            typeof kv === 'object',
            'Invalid zero.kv config, expected object'
        );

        const { provider, zqlite } = kv;
        invariant(
            provider === 'zqlite',
            'Invalid KV provider, expected `zqlite`'
        );
        invariant(
            typeof zqlite === 'object' &&
                typeof zqlite.file === 'string' &&
                zqlite.file.length > 0,
            'Invalid zqlite KV config, expected { file: string }'
        );

        return { file: zqlite.file };
    }
});

// ZRocket discriminated union change source module
const zrocketChangeSourceModule = ZeroMongoModule.forRootAsync({
    inject: [ConfigService],
    async useFactory(config: ConfigService<AppConfig>) {
        const zeroConfig = config.get<ZeroConfig>('zero');
        invariant(
            typeof zeroConfig === 'object',
            'Invalid zero config, expected object'
        );

        const { auth } = zeroConfig;
        invariant(
            typeof auth === 'object',
            'Invalid zero.auth config, expected object'
        );

        // Use discriminated schema instead of regular schema
        const tables = tableSpecsFromSchema(discriminatedSchema);

        return {
            streamerToken: zeroConfig.auth.token,
            tables
        } satisfies ZeroMongoModuleOptions;
    }
});

export const zrocketGlobalModules = [
    configModule,
    dbModule,
    zqliteWatermarkModule,
    zrocketChangeSourceModule
];