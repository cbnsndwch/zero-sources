import { mysqlTable, text } from 'drizzle-orm/mysql-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const streamerShards = mysqlTable('__zero__streamer_shards', {
    id: text('id').primaryKey().notNull(),
    lastWatermark: text('last_watermark'),
    lastPendingWatermark: text('last_pending_watermark')
});

export interface StreamerShard extends InferSelectModel<typeof streamerShards> {
    /**
     * The Shard ID
     */
    id: string;

    /**
     * The latest watermark known to have been sent downstream
     */
    lastPendingWatermark: string | null;

    /**
     * The latest watermark known to have been acknowledged from the downstream
     */
    lastAcknowledgedWatermark: string | null;
}

export interface CreateStreamerShardInput
    extends InferInsertModel<typeof streamerShards> {
    /**
     * The Shard ID
     */
    id: string;

    /**
     * The latest watermark known to have been sent downstream
     */
    lastWatermark?: string | null | undefined;

    /**
     * The latest watermark known to have been acknowledged from the downstream
     */
    lastPendingWatermark?: string | null | undefined;
}
