import { LexiVersion } from '../zero/utils/lexi-version.js';

export const TOKEN_WATERMARK_SERVICE = 'TOKEN_WATERMARK_SERVICE';

/**
 * Data contract for a Watermark-to-Resume-Token mapping service.
 *
 * Provides an simple API to convert MongoDB change stream resume tokens to
 * Zero watermark strings and vice versa.
 */
export interface IWatermarkService {
    /**
     * Retrieves the change stream resume token for a given shard and watermark.
     *
     * @param shardId - The identifier of the shard.
     * @param watermark - The watermark version.
     * @returns A promise that resolves to the resume token as a string, or `undefined` if one is not found.
     */
    getResumeToken(shardId: string, watermark: LexiVersion): Promise<string | undefined>;

    /**
     * Retrieves an existing watermark for the given shard ID and resume token,
     * or creates a new one if it does not exist.
     *
     * @param shardId - The identifier for the shard.
     * @param resumeToken - The token used to resume from a specific point.
     * @returns A promise that resolves to the watermark string.
     */
    getOrCreateWatermark(shardId: string, resumeToken: string): Promise<string>;
}
