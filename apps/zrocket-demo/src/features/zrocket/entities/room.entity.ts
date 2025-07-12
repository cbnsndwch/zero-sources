import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type RoomType = 'd' | 'p' | 'c'; // direct, private, channel/public

@Schema({ collection: 'rooms', timestamps: true })
export class Room extends Document<string> {
    /**
     * Room Type: 'd' (direct), 'p' (private group), 'c' (public channel)
     */
    @Prop({ type: String, enum: ['d', 'p', 'c'], required: true, index: true })
    type!: RoomType;

    /**
     * Room name (only for private/public rooms)
     */
    @Prop({ type: String })
    name?: string;

    /**
     * Room description (only for public channels)
     */
    @Prop({ type: String })
    description?: string;

    /**
     * Participant user IDs
     */
    @Prop({ type: [String], required: true, index: true })
    participantIds!: string[];

    /**
     * Timestamp of the last message in this room
     */
    @Prop({ type: Date })
    lastMessageAt?: Date;

    /**
     * Whether the room is archived
     */
    @Prop({ type: Boolean, default: false, index: true })
    isArchived!: boolean;

    // Timestamps from schema options
    createdAt!: Date;
    updatedAt!: Date;
}

export const RoomSchema = SchemaFactory.createForClass(Room);

// Compound indices for efficient queries
RoomSchema.index({ type: 1, isArchived: 1 });
RoomSchema.index({ participantIds: 1, lastMessageAt: -1 });
RoomSchema.index({ type: 1, name: 1 }, { unique: true, sparse: true });