import { KV, Kvm } from '@nats-io/kv';
import { connect } from '@nats-io/transport-node';
import { Module, type DynamicModule, type FactoryProvider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { invariant, IWatermarkService, TOKEN_WATERMARK_SERVICE } from '@cbnsndwch/zero-contracts';

import {
    NatsKvOptions,
    TOKEN_WATERMARK_NATS_KV_BUCKET,
    type NatsKvWatermarkModuleAsyncOptions
} from './contracts.mjs';
import { NatsKvWatermarkService } from './nats-kv-watermark.service.mjs';

/**
 * Injection token for the NATS KV bucket options
 */
const TOKEN_NATS_KV_BUCKET_OPTIONS = Symbol.for('TOKEN_NATS_KV_BUCKET_OPTIONS');

@Module({})
export class NatsKvWatermarkModule {
    /**
     * Use this method to configure and register the ZQLite-based watermark
     * service.
     *
     * **NOTE:** This is a global module, import a *single* instance in your
     * app's top-level module.
     *
     * @param options - The options to configure the ZQLite database.
     */
    static forRootAsync(options: NatsKvWatermarkModuleAsyncOptions): DynamicModule {
        const optionsProvider: FactoryProvider<NatsKvOptions> = {
            provide: TOKEN_NATS_KV_BUCKET_OPTIONS,
            inject: options.inject ?? [],
            useFactory: options.useFactory
        };

        const bucketProvider: FactoryProvider<KV> = {
            provide: TOKEN_WATERMARK_NATS_KV_BUCKET,
            inject: [TOKEN_NATS_KV_BUCKET_OPTIONS],
            async useFactory(options: NatsKvOptions) {
                invariant(
                    typeof options === 'object' && options !== null,
                    'Invalid NATS KV options, expected an object'
                );

                invariant(
                    typeof options.kvBucketName === 'string' && options.kvBucketName.length > 0,
                    'NATS KV bucket name invalid or missing'
                );

                invariant(
                    typeof options.connection.servers === 'string' ||
                        (Array.isArray(options.connection.servers) &&
                            options.connection.servers.length > 0),
                    'At least one NATS/JS server must be specified'
                );

                const nc = await connect(options.connection);

                const kvm = new Kvm(nc);
                const kv = await kvm.create(options.kvBucketName);

                return kv;
            }
        };

        const watermarkServiceProvider: FactoryProvider<IWatermarkService> = {
            provide: TOKEN_WATERMARK_SERVICE,
            inject: [TOKEN_WATERMARK_NATS_KV_BUCKET],
            useFactory(kv: KV) {
                return new NatsKvWatermarkService(kv);
            }
        };

        return {
            global: true,
            imports: [ConfigModule, ...(options.imports ?? [])],
            module: NatsKvWatermarkModule,
            providers: [optionsProvider, bucketProvider, watermarkServiceProvider],
            exports: [watermarkServiceProvider]
        };
    }
}
