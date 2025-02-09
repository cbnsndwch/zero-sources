import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import type { IUser, IUserSettings } from '../contracts/users/user.contract.js';
import { USER_STATUSES, type UserStatus } from '../contracts/users/user-status.contract.js';

@Schema({ collection: 'users' })
export class User extends Document<string> implements IUser {
    @Prop({ type: String })
    type!: string;

    @Prop({ required: true, type: [String] })
    roles!: string[];

    @Prop({ required: true, type: Boolean })
    active!: boolean;

    @Prop({ type: String })
    username?: string;

    @Prop({ type: String })
    name?: string;

    @Prop({ type: String, enum: USER_STATUSES })
    status?: UserStatus;

    @Prop({ type: Date })
    lastLogin?: Date;

    @Prop({ type: String })
    language?: string;

    // #####################################

    @Prop({ type: String })
    bio?: string;

    @Prop({ type: String })
    avatarUrl?: string;

    @Prop({ type: String })
    statusText?: string;

    @Prop({ type: String, enum: USER_STATUSES })
    defaultStatus?: UserStatus;

    @Prop({ type: String })
    presenceStatus?: string;

    @Prop({ type: Types.Map })
    customFields?: Record<string, any>;

    @Prop({ type: Types.Map })
    settings?: IUserSettings;

    @Prop({ type: String })
    defaultRoom?: string;

    @Prop({ type: String })
    inviteToken?: string;

    // #####################################

    @Prop({ required: true, type: Date })
    createdAt!: Date;

    @Prop({ type: Date })
    updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

export const userModelDefinition: ModelDefinition = {
    name: User.name,
    schema: UserSchema,
    collection: 'users'
};
