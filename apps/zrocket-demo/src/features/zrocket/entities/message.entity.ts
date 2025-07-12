import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MessageType = 'text' | 'image' | 'system';

interface ImageMetadata {
    width: number;
    height: number;
    fileSize: number;
    mimeType: string;
}

@Schema({ collection: 'messages', timestamps: true })
export class Message extends Document<string> {
    /**
     * Message Type: 'text', 'image', 'system'
     */
    @Prop({ type: String, enum: ['text', 'image', 'system'], required: true, index: true })
    type!: MessageType;

    /**
     * Room ID this message belongs to
     */
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, index: true })
    roomId!: string;

    /**
     * User ID of the sender (not present for system messages)
     */
    @Prop({ type: String, index: true })
    senderId?: string;

    /**
     * Text content (for text messages)
     */
    @Prop({ type: String })
    content?: string;

    /**
     * Image URL (for image messages)
     */
    @Prop({ type: String })
    imageUrl?: string;

    /**
     * Image caption (for image messages)
     */
    @Prop({ type: String })
    caption?: string;

    /**
     * Image metadata (for image messages)
     */
    @Prop({ type: Object })
    imageMetadata?: ImageMetadata;

    /**
     * System action type (for system messages)
     */
    @Prop({ type: String })
    action?: string;

    /**
     * Target user ID (for system messages)
     */
    @Prop({ type: String })
    targetUserId?: string;

    /**
     * Additional metadata (for system messages)
     */
    @Prop({ type: Object })
    metadata?: any;

    /**
     * Whether the message is deleted
     */
    @Prop({ type: Boolean, default: false, index: true })
    isDeleted!: boolean;

    // Timestamps from schema options
    createdAt!: Date;
    updatedAt!: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Compound indices for efficient queries
MessageSchema.index({ roomId: 1, createdAt: -1 });
MessageSchema.index({ type: 1, isDeleted: 1 });
MessageSchema.index({ senderId: 1, createdAt: -1 });
MessageSchema.index({ type: 1, roomId: 1, isDeleted: 1 });