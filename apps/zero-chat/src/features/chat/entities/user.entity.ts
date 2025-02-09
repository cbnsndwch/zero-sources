import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import type { IUser, IUserSettings } from '../contracts/users/user.contract.js';
import { UserStatus } from '../contracts/users/user-status.contract.js';

@Schema({ collection: 'users' })
export class User extends Document<string> implements IUser {
    @Prop()
    type!: string;

    @Prop({ required: true, type: [String] })
    roles!: string[];

    @Prop({ required: true })
    active!: boolean;

    @Prop()
    username?: string;

    @Prop()
    name?: string;

    @Prop()
    status?: UserStatus;

    @Prop()
    lastLogin?: Date;

    @Prop()
    language?: string;

    // #####################################

    @Prop()
    bio?: string;

    @Prop()
    avatarUrl?: string;

    @Prop()
    statusText?: string;

    @Prop()
    defaultStatus?: UserStatus;

    @Prop()
    presenceStatus?: string;

    @Prop()
    customFields?: Record<string, any>;

    @Prop()
    settings?: IUserSettings;

    @Prop()
    defaultRoom?: string;

    @Prop()
    inviteToken?: string;

    // #####################################

    @Prop({ required: true })
    createdAt!: Date;

    @Prop()
    updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

export const userModelDefinition: ModelDefinition = {
    name: User.name,
    schema: UserSchema,
    collection: 'users'
};
