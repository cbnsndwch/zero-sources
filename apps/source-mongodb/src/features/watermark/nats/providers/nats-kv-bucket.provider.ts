import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { KV, Kvm } from '@nats-io/kv';
import { connect } from '@nats-io/transport-node';

import { AppConfig, KvConfig } from '../../../../config/contracts.js';

export const TOKEN_NATS_KV_BUCKET = 'TOKEN_NATS_KV_BUCKET';

export const natsKvBucketProvider: FactoryProvider<KV> = {
    provide: TOKEN_NATS_KV_BUCKET,
    inject: [ConfigService],
    async useFactory(configService: ConfigService<AppConfig>) {
        const kvConfig = configService.get<KvConfig>('kv')!;

        if (kvConfig.provider !== 'nats') {
            throw new Error('Invalid KV provider, expected `nats`');
        }

        const { servers, auth } = kvConfig.nats;
        const nc = await connect({
            servers: servers,
            user: auth.user,
            pass: auth.pwd
        });

        const kvm = new Kvm(nc);
        const kv = await kvm.create(TOKEN_NATS_KV_BUCKET);

        return kv;
    }
};
