import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ParticipantType = 'user' | 'bot';

interface NotificationSettings {
    muted: boolean;
    muteUntil?: Date;
}

interface BotConfig {
    autoRespond: boolean;
    triggers: string[];
}

@Schema({ collection: 'participants', timestamps: true })
export class Participant extends Document<string> {
    /**
     * Participant Type: 'user' or 'bot'
     */
    @Prop({ type: String, enum: ['user', 'bot'], required: true, index: true })
    type!: ParticipantType;

    /**
     * User ID (for user participants)
     */
    @Prop({ type: String, index: true })
    userId?: string;

    /**
     * Bot ID (for bot participants)
     */
    @Prop({ type: String, index: true })
    botId?: string;

    /**
     * Room ID this participant belongs to
     */
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, index: true })
    roomId!: string;

    /**
     * Role in the room: 'owner', 'admin', 'member', 'bot'
     */
    @Prop({ type: String, enum: ['owner', 'admin', 'member', 'bot'], required: true })
    role!: string;

    /**
     * When the participant joined the room
     */
    @Prop({ type: Date, required: true })
    joinedAt!: Date;

    /**
     * When the participant last read messages (for users)
     */
    @Prop({ type: Date })
    lastReadAt?: Date;

    /**
     * Notification settings (for users)
     */
    @Prop({ type: Object })
    notificationSettings?: NotificationSettings;

    /**
     * Bot configuration (for bots)
     */
    @Prop({ type: Object })
    config?: BotConfig;

    // Timestamps from schema options
    createdAt!: Date;
    updatedAt!: Date;
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);

// Compound indices for efficient queries
ParticipantSchema.index({ roomId: 1, type: 1 });
ParticipantSchema.index({ userId: 1, roomId: 1 }, { unique: true, sparse: true });
ParticipantSchema.index({ botId: 1, roomId: 1 }, { unique: true, sparse: true });
ParticipantSchema.index({ type: 1, role: 1 });