import type { FactoryProvider, ModuleMetadata } from '@nestjs/common';
import type { ConnectionOptions } from '@nats-io/transport-node';

/**
 * Injection token for the NATS KV bucket instance
 */
export const TOKEN_WATERMARK_NATS_KV_BUCKET = Symbol.for('TOKEN_WATERMARK_NATS_KV_BUCKET');

/**
 * Config for the NATS/JetStream KV provider
 */
export type NatsKvOptions = {
    /**
     * The name of the NATS KV bucket to create/use.
     */
    kvBucketName: string;

    /**
     * NATS connection options. See the `@nats-io/transport-node` package for more details.
     *
     * @see {@link https://www.npmjs.com/package/@nats-io/transport-node @nats-io/transport-node on NPM}
     */
    connection: ConnectionOptions;
};

export type NatsKvWatermarkModuleAsyncOptions = Pick<ModuleMetadata, 'imports'> &
    Pick<FactoryProvider<NatsKvOptions>, 'inject' | 'useFactory'>;
