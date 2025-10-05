import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Tracks the last mutation ID processed for each client.
 * Used by Zero's push processor for idempotency.
 */
@Schema({ collection: 'clientMutations', timestamps: true })
export class ClientMutation extends Document {
    @Prop({ type: String, required: true, index: true })
    clientGroupID!: string;

    @Prop({ type: String, required: true, index: true })
    clientID!: string;

    @Prop({ type: Number, required: true })
    lastMutationID!: number;

    @Prop({ type: String, required: true })
    upstreamSchema!: string;

    @Prop({ type: Date })
    createdAt!: Date;

    @Prop({ type: Date })
    updatedAt!: Date;
}

export const ClientMutationSchema =
    SchemaFactory.createForClass(ClientMutation);

// Compound index for client lookup
ClientMutationSchema.index({ clientGroupID: 1, clientID: 1 }, { unique: true });
