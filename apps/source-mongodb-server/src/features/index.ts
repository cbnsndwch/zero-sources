import { ConfigService } from '@nestjs/config';
import type { SchemaValue } from '@rocicorp/zero';

import {
    invariant,
    ZERO_VALUE_TYPE_TO_PG_TYPE
} from '@cbnsndwch/zero-contracts';
import {
    ZeroMongoModule,
    type TableSpec,
    type ZeroMongoModuleOptions
} from '@cbnsndwch/zero-source-mongodb';
import { ZqliteWatermarkModule } from '@cbnsndwch/zero-watermark-zqlite';

import {
    mapping,
    schema,
    permissions
} from '@cbnsndwch/zrocket-contracts/schema';

import type { AppConfig, KvConfig, ZeroConfig } from '../config/contracts.js';

import { globalModules } from './global-modules.js';
import { HealthzModule } from './healthz/healthz.module.js';

export default [
    /**
     * Globals
     */
    ...globalModules,
    /**
     * Infra
     */
    HealthzModule,
    /**
     * Application Feature
     */
    ZqliteWatermarkModule.forRootAsync({
        inject: [ConfigService],
        async useFactory(config: ConfigService<AppConfig>) {
            // const { token } = config.get<AuthConfig>('auth')!;
            const { kv } = config.get<{ kv: KvConfig }>('zero')!;
            const { provider, zqlite } = kv;

            invariant(provider === 'zqlite', 'KV provider must be zqlite');
            invariant(
                typeof zqlite === 'object' &&
                    typeof zqlite.file === 'string' &&
                    zqlite.file.length > 0,
                'Invalid zqlite KV config, expected { file: string }'
            );

            return { file: zqlite.file };
        }
    }),
    ZeroMongoModule.forRootAsync({
        inject: [ConfigService],
        async useFactory(config: ConfigService<AppConfig>) {
            const zeroConfig = config.get<ZeroConfig>('zero')!;

            invariant(
                typeof zeroConfig === 'object' &&
                    typeof zeroConfig.auth === 'object' &&
                    typeof zeroConfig.auth.token === 'string',
                'Invalid streamer auth config, expected object with token'
            );

            const tables: TableSpec[] = Object.values(schema.tables).map(
                table =>
                    ({
                        schema: 'public',
                        name: table.name,
                        columns: Object.fromEntries(
                            Object.entries(table.columns).map(
                                ([name, col]: [string, SchemaValue], pos) => [
                                    name,
                                    {
                                        pos,
                                        dataType:
                                            ZERO_VALUE_TYPE_TO_PG_TYPE[
                                                col.type
                                            ],
                                        notNull: !col.optional
                                    }
                                ]
                            )
                        ),
                        primaryKey: table.primaryKey
                    }) satisfies TableSpec
            );

            return {
                tables,
                mapping,
                permissions: await permissions,
                streamerToken: zeroConfig.auth.token
            } satisfies ZeroMongoModuleOptions;
        }
    })
    /**
     * Maybe: Spikes, POCs, etc.
     */
];
