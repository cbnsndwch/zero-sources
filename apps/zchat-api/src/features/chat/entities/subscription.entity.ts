import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import {
    IUserSummaryWithName,
    NOTIFICATION_TYPES,
    NOTIFICATION_TYPES_WITH_DEFAULT,
    NotificationType,
    RoomType,
    type ISubscription,
    type NotificationTypeWithDefault
} from '@cbnsndwch/zchat-contracts';

import { EntityBase } from '../../../common/entities/base.entity.js';

@Schema()
export class Subscription extends EntityBase implements ISubscription {
    @Prop({
        type: String,
        required: true
    })
    @IsString()
    t!: RoomType;

    @Prop({
        type: Object,
        required: true
    })
    u!: IUserSummaryWithName;

    @Prop({
        type: String,
        required: true
    })
    @IsString()
    roomId!: string;

    @Prop({
        type: Boolean,
        default: true,
        required: true
    })
    @IsBoolean()
    open!: boolean;

    @Prop({
        type: Date,
        default: Date.now,
        required: true
    })
    @IsDate()
    ts!: Date;

    @Prop({
        type: String,
        required: true
    })
    @IsString()
    name!: string;

    @Prop({
        type: Boolean
    })
    @IsOptional()
    @IsBoolean()
    alert?: boolean;

    @Prop({
        type: Number,
        default: 0,
        required: true
    })
    @IsNumber()
    unread!: number;

    @Prop({
        type: Date,
        default: Date.now,
        required: true
    })
    @IsDate()
    ls!: Date;

    @Prop({
        type: Boolean
    })
    @IsOptional()
    @IsBoolean()
    f?: boolean;

    @Prop({
        type: Date,
        default: Date.now,
        required: true
    })
    @IsDate()
    lr!: Date;

    @Prop({
        type: Boolean
    })
    @IsOptional()
    @IsBoolean()
    hideUnreadStatus?: true;

    @Prop({
        type: Boolean
    })
    @IsOptional()
    @IsBoolean()
    hideMentionStatus?: true;

    @Prop({
        type: Number,
        default: 0,
        required: true
    })
    @IsNumber()
    userMentions!: number;

    @Prop({
        type: Number,
        default: 0,
        required: true
    })
    @IsNumber()
    groupMentions!: number;

    @Prop({
        type: [String]
    })
    @IsOptional()
    @IsString({ each: true })
    roles?: string[];

    @Prop({
        type: [String]
    })
    @IsOptional()
    @IsString({ each: true })
    userHighlights?: string[];

    @Prop({
        type: String,
        enum: NOTIFICATION_TYPES_WITH_DEFAULT
    })
    @IsOptional()
    @IsEnum([NOTIFICATION_TYPES_WITH_DEFAULT])
    unreadAlerts?: NotificationTypeWithDefault;

    @Prop({
        type: Boolean
    })
    @IsOptional()
    @IsBoolean()
    disableNotifications?: boolean;

    @Prop({
        type: String
    })
    @IsOptional()
    @IsString()
    audioNotifications?: string;

    @Prop({
        type: String,
        enum: NOTIFICATION_TYPES
    })
    @IsOptional()
    @IsEnum(NOTIFICATION_TYPES)
    desktopNotifications?: NotificationType;

    @Prop({
        type: String,
        enum: NOTIFICATION_TYPES
    })
    @IsOptional()
    @IsEnum(NOTIFICATION_TYPES)
    mobilePushNotifications?: NotificationType;

    @Prop({
        type: String,
        enum: NOTIFICATION_TYPES
    })
    @IsOptional()
    @IsEnum(NOTIFICATION_TYPES)
    emailNotifications?: NotificationType;

    @Prop({
        type: Boolean
    })
    @IsOptional()
    @IsBoolean()
    muteGroupMentions?: boolean;

    @Prop({
        type: [String]
    })
    @IsOptional()
    @IsString({ each: true })
    ignoredUserIds?: string[];
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

SubscriptionSchema.index({ rid: 1, open: 1 });

export const subscriptionModelDefinition: ModelDefinition = {
    name: Subscription.name,
    schema: SubscriptionSchema,
    collection: 'subscriptions'
};
