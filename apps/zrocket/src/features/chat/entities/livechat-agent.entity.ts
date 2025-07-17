import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

import {
    ILivechatAgent,
    LIVECHAT_AGENT_STATUS_NOT_AVAILABLE,
    LIVECHAT_AGENT_STATUSES,
    LivechatAgentStatus
} from '@cbnsndwch/zchat-contracts';

import { User } from '../../users/entities/user.entity.js';
import { Types } from 'mongoose';

@Schema()
export class LivechatAgent extends User implements ILivechatAgent {
    @Prop({
        type: String,
        enum: LIVECHAT_AGENT_STATUSES,
        default: LIVECHAT_AGENT_STATUS_NOT_AVAILABLE
    })
    statusLivechat!: LivechatAgentStatus;

    @Prop()
    livechatCount!: number;

    @Prop()
    lastRoutingTime!: Date;

    @Prop()
    livechatStatusSystemModified?: boolean;

    @Prop()
    openBusinessHours?: string[];

    @Prop({
        type: Types.Map
    })
    livechat?: { maxNumberSimultaneousChat: number };
}

export const LivechatAgentSchema = SchemaFactory.createForClass(LivechatAgent);
