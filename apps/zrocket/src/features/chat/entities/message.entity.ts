import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
    IsArray,
    IsBoolean,
    IsDate,
    IsDefined,
    IsEnum,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested
} from 'class-validator';
import type { SerializedEditorState } from 'lexical';
import { Types } from 'mongoose';
import {
    MESSAGE_TYPES
} from '@cbnsndwch/zrocket-contracts';
import type {
    IHasName,
    IMessageReaction,
    ISystemMessage,
    IUserMessage,
    IUserSummary,
    MessageAttachment,
    MessageType
} from '@cbnsndwch/zrocket-contracts';
import type { Dict } from '@cbnsndwch/zero-contracts';

import { EntityBase } from '../../../common/entities/base.entity.js';

@Schema()
export class Message extends EntityBase {
    @IsString()
    @IsDefined()
    @Prop({ type: String, required: true })
    roomId!: string;

    @IsBoolean()
    @IsOptional()
    @Prop({ type: Boolean })
    hidden?: boolean;

    // Discriminator field - determines if this is a user message or system message
    @IsEnum(MESSAGE_TYPES)
    @IsDefined()
    @Prop({ type: String, required: true })
    t!: MessageType;

    // User Message Fields (only present when t === 'USER')
    @IsObject()
    @IsOptional()
    @Prop({ type: Types.Map })
    sender?: Required<IUserSummary> & Partial<IHasName>;

    @IsObject()
    @IsOptional()
    @Prop({ type: Types.Map })
    contents?: SerializedEditorState;

    @IsBoolean()
    @IsOptional()
    @Prop({ type: Boolean })
    groupable?: boolean;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @Prop({ type: [String] })
    repliedBy?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @Prop({ type: [String] })
    starredBy?: string[];

    @IsBoolean()
    @IsOptional()
    @Prop({ type: Boolean })
    pinned?: boolean;

    @IsDate()
    @IsOptional()
    @Prop({ type: Date })
    pinnedAt?: Date;

    @ValidateNested()
    @IsOptional()
    @Prop({ type: Types.Map })
    pinnedBy?: IUserSummary;

    @IsArray()
    @ValidateNested({ each: true })
    @IsOptional()
    @Prop({ type: [Types.Map] })
    attachments?: MessageAttachment[];

    @IsObject()
    @IsOptional()
    @Prop({ type: Types.Map })
    reactions?: Record<string, IMessageReaction>;

    // System Message Fields (only present when t !== 'USER')
    @IsObject()
    @IsOptional()
    @Prop({ type: Types.Map })
    data?: Dict;

    // Helper methods to check message type
    isUserMessage(): this is Message & IUserMessage {
        return this.t === 'USER';
    }

    isSystemMessage(): this is Message & ISystemMessage {
        return this.t !== 'USER';
    }
}

export const MessageSchema = SchemaFactory.createForClass(Message);

export const messageModelDefinition: ModelDefinition = {
    name: Message.name,
    schema: MessageSchema,
    collection: 'messages'
};
