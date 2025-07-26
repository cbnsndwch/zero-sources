import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import type { Dict } from '@cbnsndwch/zero-contracts';
import {
    USER_PRESENCE_STATUSES,
    type ExternalUserId,
    type IUser,
    type IUserSettings,
    type UserPresenceStatus
} from '@cbnsndwch/zrocket-contracts';

import { EntityBase } from '../../../common/entities/index.js';

@Schema({ collection: 'users' })
export class User extends EntityBase implements IUser {
    @Prop({ type: String })
    name?: string;

    @Prop({ type: String, required: true })
    email!: string;

    @Prop({ type: [String], default: [] })
    additionalEmails?: string[];

    @Prop({ type: String })
    username?: string;

    @Prop({ required: true, type: [String], default: [] })
    roles!: string[];

    @Prop({ required: true, type: Boolean, default: true })
    active!: boolean;

    @Prop({ type: String })
    bio?: string;

    @Prop({ type: String })
    avatarUrl?: string;

    @Prop({ type: String })
    providerId?: ExternalUserId;

    // #####################################

    @Prop({ type: String, enum: USER_PRESENCE_STATUSES })
    presenceStatus?: UserPresenceStatus;

    @Prop({ type: String })
    presenceStatusText?: string;

    @Prop({ type: String, enum: USER_PRESENCE_STATUSES })
    defaultPresenceStatus?: UserPresenceStatus;

    // #####################################

    @Prop({ type: String })
    language?: string;

    @Prop({ type: Types.Map })
    settings?: IUserSettings;

    @Prop({ type: String })
    defaultRoom?: string;

    // #####################################

    @Prop({ type: Date })
    lastLogin?: Date;

    @Prop({ type: String })
    inviteToken?: string;

    // #####################################

    @Prop({ type: Date, required: true, default: () => new Date() })
    createdAt!: Date;

    // #####################################

    @Prop({ type: Types.Map })
    customFields?: Dict;
}

export const UserSchema = SchemaFactory.createForClass(User);

export const userModelDefinition: ModelDefinition = {
    name: User.name,
    schema: UserSchema,
    collection: 'users'
};
