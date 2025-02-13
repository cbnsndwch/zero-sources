import type { LexiVersion } from '../lexi-version.mjs';

/**
 * Data contract for a Watermark-to-Resume-Token mapping service.
 *
 * Provides an simple API to convert MongoDB change stream resume tokens to
 * Zero watermark strings and vice versa.
 */

export interface IWatermarkService {
    /**
     * Retrieves the change source's native resume token for a given shard Id
     * and watermark value.
     *
     * @param shardId - The identifier of the shard.
     * @param watermark - The watermark version.
     * @returns A promise that resolves to the resume token as a string, or `undefined` if one is not found.
     */
    getResumeToken(shardId: string, watermark: LexiVersion): Promise<string | undefined>;

    /**
     * Retrieves an existing watermark for the given shard ID and a change
     * source's native resume token value, or creates a new one if one cannot be
     * retrieved.
     *
     * @param shardId - The identifier for the shard.
     * @param resumeToken - The resume token in teh change source's native format.
     * @returns A promise that resolves to the watermark string.
     */
    getOrCreateWatermark(shardId: string, resumeToken: string): Promise<string>;
}
