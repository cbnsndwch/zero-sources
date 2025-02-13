import { ConfigService } from '@nestjs/config';

import { invariant } from '@cbnsndwch/zero-contracts';
import { ZeroMongoModule } from '@cbnsndwch/zero-source-mongodb';
import { ZqliteWatermarkModule } from '@cbnsndwch/zero-watermark-zqlite';

import { AppConfig, AuthConfig, KvConfig } from '../config/contracts.js';

import { globalModules } from './global-modules.js';

// infra
import { HealthzModule } from './healthz/healthz.module.js';
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
    /**
     * Application Feature
     */
    ZqliteWatermarkModule.forRootAsync({
        inject: [ConfigService],
        async useFactory(config: ConfigService<AppConfig>) {
            // const { token } = config.get<AuthConfig>('auth')!;
            const { provider, zqlite } = config.get<KvConfig>('kv')!;

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
            const authConfig = config.get<AuthConfig>('auth');

            invariant(
                typeof authConfig === 'object',
                'Invalid streamer auth config, expected object'
            );

            return {
                streamerToken: authConfig.token,
                tables
            };
        }
    })
    /**
     * Maybe: Spikes, POCs, etc.
     */
];
