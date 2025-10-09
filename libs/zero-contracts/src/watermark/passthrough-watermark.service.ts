import type { LexiVersion } from '../lexi-version.js';

import type { IWatermarkService } from './watermark-service.contract.js';

/**
 * A watermark service that simply passes through the watermark and resume token
 * values it receives. Useful for testing or when no special mapping is needed
 * between zero-cache watermarks and teh change source's native resume token
 * format.
 */

export class PassthroughWatermarkService implements IWatermarkService {
    async getResumeToken(_shardId: string, watermark: LexiVersion) {
        return watermark;
    }

    async getOrCreateWatermark(_shardId: string, resumeToken: string) {
        return resumeToken;
    }
}
