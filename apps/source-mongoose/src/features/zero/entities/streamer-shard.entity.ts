import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'streamer_shards' })
export class StreamerShard extends Document<string> {
    /**
     * The Shard ID
     */
    @Prop({ type: String, required: true })
    declare id: string;

    /**
     * The latest watermark known to have been sent downstream
     */
    @Prop({ type: String })
    lastPendingWatermark?: string;
    
    /**
     * The latest watermark known to have been acknowledged from the downstream
     */
    @Prop({ type: String })
    lastAcknowledgedWatermark?: string;
}

export const StreamerShardSchema = SchemaFactory.createForClass(StreamerShard);

// Indices
StreamerShardSchema.index(
    { _id: 1, lastWatermark: -1 },
    { name: 'idx_streamer_shard__id_lastWatermark' }
);
