import { Injectable, Logger, FactoryProvider, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { KV, Kvm } from '@nats-io/kv';
import { connect } from '@nats-io/transport-node';

import type { AppConfig, NatsKvConfig } from '../../../config/contracts.js';
import { LexiVersion, versionFromLexi, versionToLexi } from '../utils/lexi-version.js';

const BUCKET_CHANGE_SEQUENCE = 'zero_change_sequence';

@Injectable()
export class WatermarkService {
    #logger = new Logger(WatermarkService.name);

    #kv: KV;

    constructor(@Inject(BUCKET_CHANGE_SEQUENCE) kv: KV) {
        this.#kv = kv;
    }

    async getResumeToken(shardId: string, watermark: LexiVersion) {
        const key = `zero_${shardId}.${watermark}`;
        const entry = await this.#kv.get(key);

        return entry?.string();
    }

    async getOrCreateWatermark(shardId: string, resumeToken: string) {
        const key = `zero_${shardId}.${resumeToken}`;
        const entry = await this.#kv.get(key);

        // if the watermark already exists, return it
        if (entry) {
            return entry.string();
        }

        // could not find a watermark for the resume token, create a new one
        const watermark = await this.#nextWatermark(shardId);
        await this.#kv.put(key, watermark);

        // and also save a reverse mapping from the watermark to the resume
        // token to support resuming from a client-provided watermark
        await this.#kv.put(`zero_${shardId}.${watermark}`, resumeToken);

        return watermark;
    }

    async #nextWatermark(shardId: string) {
        const shardLsnKey = `zero_${shardId}.lsn`;

        // a Compare-And-Swap loop to increment the LSN for the shard
        // NATS 2.11 is supposed to have a better API for this, keep an eye on it
        let watermark = versionToLexi(1);
        while (true) {
            const shardLsnEntry = await this.#kv.get(shardLsnKey);

            if (!shardLsnEntry) {
                await this.#kv.put(shardLsnKey, watermark);
                break;
            }

            const previous = versionFromLexi(shardLsnEntry.string());
            watermark = versionToLexi(previous + 1n);

            try {
                await this.#kv.put(shardLsnKey, watermark, { previousSeq: shardLsnEntry.revision });
                break;
            } catch (err) {
                this.#logger.error(
                    `Race condition while updating watermark for shard ${shardId}, retrying`,
                    err
                );
            }
        }

        return watermark;
    }
}

export const changeSequenceKvProvider: FactoryProvider<KV> = {
    provide: BUCKET_CHANGE_SEQUENCE,
    inject: [ConfigService],
    async useFactory(configService: ConfigService<AppConfig>) {
        const natsConfig = configService.get<NatsKvConfig>('kv')!;

        // TODO: move the NATS connection to a separate provider
        const nc = await connect({
            servers: natsConfig.servers,
            user: natsConfig.auth.user,
            pass: natsConfig.auth.pwd
        });

        const kvm = new Kvm(nc);
        const kv = await kvm.create(BUCKET_CHANGE_SEQUENCE);

        return kv;
    }
};
