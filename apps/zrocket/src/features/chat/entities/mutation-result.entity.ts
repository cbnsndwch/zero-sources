import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

/**
 * Stores mutation results for idempotency and debugging.
 * Zero's push processor can use this to avoid re-processing mutations.
 */
@Schema({ collection: 'mutationResults', timestamps: true })
export class MutationResult extends Document {
    @Prop({ required: true, index: true })
    clientGroupID!: string;

    @Prop({ required: true, index: true })
    clientID!: string;

    @Prop({ required: true })
    mutationID!: number;

    @Prop({ required: true })
    upstreamSchema!: string;

    @Prop({ type: MongooseSchema.Types.Mixed, required: true })
    result!: Record<string, any>;

    @Prop()
    createdAt!: Date;
}

export const MutationResultSchema =
    SchemaFactory.createForClass(MutationResult);

// Compound index for mutation lookup
MutationResultSchema.index(
    { clientGroupID: 1, clientID: 1, mutationID: 1 },
    { unique: true }
);
