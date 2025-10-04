import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Tracks the last mutation ID processed for each client.
 * Used by Zero's push processor for idempotency.
 */
@Schema({ collection: 'clientMutations', timestamps: true })
export class ClientMutation extends Document {
    @Prop({ required: true, index: true })
    clientGroupID!: string;

    @Prop({ required: true, index: true })
    clientID!: string;

    @Prop({ required: true })
    lastMutationID!: number;

    @Prop({ required: true })
    upstreamSchema!: string;

    @Prop()
    createdAt!: Date;

    @Prop()
    updatedAt!: Date;
}

export const ClientMutationSchema =
    SchemaFactory.createForClass(ClientMutation);

// Compound index for client lookup
ClientMutationSchema.index({ clientGroupID: 1, clientID: 1 }, { unique: true });
