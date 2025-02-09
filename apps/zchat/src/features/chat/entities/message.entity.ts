import { Schema, Prop, SchemaFactory, ModelDefinition } from '@nestjs/mongoose';
import {
    IsString,
    IsDate,
    IsOptional,
    IsBoolean,
    IsArray,
    ValidateNested,
    IsObject,
    IsDefined
} from 'class-validator';
import { Types } from 'mongoose';

import type { IMessage, IMessageMention } from '../contracts/messages/message.contracts.js';
import type { MessageSurfaceLayout } from '@rocket.chat/ui-kit';
import type { SerializedEditorState } from 'lexical';
import type { IHasId, IHasName } from '../contracts/base.contracts.js';
import type { MessageAttachment } from '../contracts/messages/index.js';
import type { IMessageReaction } from '../contracts/messages/message-reaction.contracts.js';
import type { IUserSummary } from '../contracts/users/user.contract.js';

import { EntityBase } from './base.entity.js';

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
