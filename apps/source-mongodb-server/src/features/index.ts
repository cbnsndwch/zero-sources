import { ConfigService } from '@nestjs/config';
import { invariant } from '@cbnsndwch/zero-contracts';
import { ZeroMongoModule } from '@cbnsndwch/zero-source-mongodb';
import { ZqliteWatermarkModule } from '@cbnsndwch/zero-watermark-zqlite';

import { AppConfig, KvConfig } from '../config/contracts.js';

import { globalModules } from './global-modules.js';

import { SchemaLoaderService } from './schema/schema-loader.service.js';

// infra
import { HealthzModule } from './healthz/healthz.module.js';
import { MetadataModule } from './metadata/metadata.module.js';
import { tables } from './table-specs.js';

export default [
    /**
     * Globals
     */
    ...globalModules,
    /**
     * Infra
     */
    HealthzModule,
    MetadataModule,
    /**
     * Application Feature
     */
    ZqliteWatermarkModule.forRootAsync({
        inject: [ConfigService],
        async useFactory(config: ConfigService<AppConfig>) {
            // const { token } = config.get<AuthConfig>('auth')!;
            const { kv } = config.get<{kv: KvConfig}>('zero')!;
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
        inject: [ConfigService, SchemaLoaderService],
        async useFactory(
            config: ConfigService<AppConfig>,
            schemaLoader: SchemaLoaderService
        ) {
            const { auth: zeroAuth } = config.get<{auth: {token: string}}>('zero')!;

            invariant(
                typeof zeroAuth === 'object' && typeof zeroAuth.token === 'string',
                'Invalid streamer auth config, expected object with token'
            );

            // Load schema dynamically
            let tablesToUse;
            try {
                const loadedSchema = await schemaLoader.loadSchema();
                tablesToUse = loadedSchema.tables;
            } catch (error) {
                console.warn(
                    'Failed to load schema from configuration, falling back to default tables:',
                    error
                );
                tablesToUse = tables; // fallback to hardcoded tables
            }

            return {
                streamerToken: zeroAuth.token,
                tables: tablesToUse
            };
        }
    })
    /**
     * Maybe: Spikes, POCs, etc.
     */
];
