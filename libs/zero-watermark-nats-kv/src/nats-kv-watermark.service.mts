import { Injectable, Logger } from '@nestjs/common';

import { KV } from '@nats-io/kv';

import {
    versionFromLexi,
    versionToLexi,
    type LexiVersion,
    type IWatermarkService
} from '@cbnsndwch/zero-contracts';

@Injectable()
export class NatsKvWatermarkService implements IWatermarkService {
    #logger = new Logger(NatsKvWatermarkService.name);

    #kv: KV;

    constructor(kv: KV) {
        this.#kv = kv;
    }

    /**
     * Retrieves the change stream resume token for a given shard and watermark.
     *
     * @param shardId - The identifier of the shard.
     * @param watermark - The watermark version.
     * @returns A promise that resolves to the resume token as a string, or `undefined` if one is not found.
     */
    async getResumeToken(shardId: string, watermark: LexiVersion) {
        const key = `zero_${shardId}.${watermark}`;
        const entry = await this.#kv.get(key);

        return entry?.string();
    }

    /**
     * Retrieves an existing watermark for the given shard ID and resume token,
     * or creates a new one if it does not exist.
     *
     * @param shardId - The identifier for the shard.
     * @param resumeToken - The token used to resume from a specific point.
     * @returns A promise that resolves to the watermark string.
     */
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
                await this.#kv.put(shardLsnKey, watermark, {
                    previousSeq: shardLsnEntry.revision
                });
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
