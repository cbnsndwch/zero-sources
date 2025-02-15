import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { MessageSurfaceLayout } from '@rocket.chat/ui-kit';
import {
    IsArray,
    IsBoolean,
    IsDate,
    IsDefined,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested
} from 'class-validator';
import type { SerializedEditorState } from 'lexical';
import { Types } from 'mongoose';

import {
    IHasId,
    IHasName,
    IMessage,
    IMessageMention,
    IMessageReaction,
    IUserSummary,
    MessageAttachment
} from '@cbnsndwch/zchat-contracts';

import { EntityBase } from '../../../common/entities/base.entity.js';

@Schema()
export class Message extends EntityBase implements IMessage {
    @IsString()
    @IsDefined()
    @Prop({ type: String, required: true })
    roomId!: string;

    @IsDate()
    @IsDefined()
    @Prop({ type: Date, required: true })
    ts!: Date;

    @IsObject()
    @IsDefined()
    @Prop({ type: Types.Map, required: true })
    contents!: SerializedEditorState;

    @IsString()
    @IsOptional()
    @Prop({ type: String })
    md?: string;

    @IsString()
    @IsOptional()
    @Prop({ type: String })
    html?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @IsOptional()
    @Prop({ type: [Types.Map] })
    mentions?: IMessageMention[];

    @IsObject()
    @IsDefined()
    @Prop({ type: Types.Map, required: true })
    sender!: Required<IUserSummary> & Partial<IHasName>;

    @IsBoolean()
    @IsOptional()
    @Prop({ type: Boolean })
    groupable?: boolean;

    @IsObject()
    @IsOptional()
    @Prop({ type: Types.Map })
    blocks?: MessageSurfaceLayout;

    @IsBoolean()
    @IsOptional()
    @Prop({ type: Boolean })
    hidden?: boolean;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @Prop({ type: [String] })
    repliedBy?: string[];

    @IsArray()
    @ValidateNested({ each: true })
    @IsOptional()
    @Prop({ type: Types.Map })
    starred?: IHasId[];

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

    @IsBoolean()
    @IsOptional()
    @Prop({ type: Boolean })
    unread?: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @IsOptional()
    @Prop({ type: [Types.Map] })
    attachments?: MessageAttachment[];

    @IsObject()
    @IsOptional()
    @Prop({ type: Types.Map })
    reactions?: Record<string, IMessageReaction>;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

export const messageModelDefinition: ModelDefinition = {
    name: Message.name,
    schema: MessageSchema,
    collection: 'messages'
};
