import { Injectable, Logger, Inject } from '@nestjs/common';

import type { Database } from '@rocicorp/zero-sqlite3';

import {
    type LexiVersion,
    versionFromLexi,
    versionToLexi
} from '../../../zero/utils/lexi-version.js';

import type { IWatermarkService } from '../../contracts.js';

import { TOKEN_ZQLITE_DB } from '../providers/zqlite-client.provider.js';

export type KVPair = {
    key: string;
    value: string;
};

@Injectable()
export class ZqliteWatermarkService implements IWatermarkService {
    #logger = new Logger(ZqliteWatermarkService.name);

    #db: Database;

    constructor(@Inject(TOKEN_ZQLITE_DB) db: Database) {
        this.#db = db;
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
        const entry = this.#db
            .prepare<[string], KVPair>('SELECT key, value FROM zero_kv WHERE key = ?')
            .get(key);

        return entry?.value;
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
        const entry = await this.#db
            .prepare<[string], { value: string }>('SELECT key, value FROM zero_kv WHERE key = ?')
            .get(key);

        // if the watermark already exists, return it
        if (entry?.value) {
            return entry.value;
        }

        // could not find a watermark for the resume token, create a new one
        const watermark = await this.#nextWatermark(shardId);
        this.#db
            .prepare<[string, string], KVPair>('INSERT INTO zero_kv (key, value) VALUES (?, ?)')
            .run(key, watermark);

        // and also save a reverse mapping from the watermark to the resume
        // token to support resuming from a client-provided watermark
        this.#db
            .prepare('INSERT INTO zero_kv (key, value) VALUES (?, ?)')
            .run(`zero_${shardId}.${watermark}`, resumeToken);

        return watermark;
    }

    async #nextWatermark(shardId: string) {
        const shardLsnKey = `zero_${shardId}.lsn`;

        // a Compare-And-Swap loop to increment the LSN for the shard
        // NATS 2.11 is supposed to have a better API for this, keep an eye on it
        let watermark = versionToLexi(1);
        while (true) {
            const shardLsnEntry = this.#db
                .prepare<[string], KVPair>('SELECT key, value FROM zero_kv WHERE key = ?')
                .get(shardLsnKey);

            if (!shardLsnEntry) {
                this.#db
                    .prepare('INSERT INTO zero_kv (key, value) VALUES (?, ?)')
                    .run(shardLsnKey, watermark);
                break;
            }

            const previous = versionFromLexi(shardLsnEntry.value);
            watermark = versionToLexi(previous + 1n);

            try {
                this.#db
                    .prepare('UPDATE zero_kv SET value = ? WHERE key = ?')
                    .run(watermark, shardLsnKey);
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
