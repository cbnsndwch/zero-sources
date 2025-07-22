import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import {
    type ILivechatAgent,
    type LivechatAgentStatus,
    LIVECHAT_AGENT_STATUS_NOT_AVAILABLE,
    LIVECHAT_AGENT_STATUSES
} from '@cbnsndwch/zchat-contracts';
import { Types } from 'mongoose';

import { User } from '../../users/entities/user.entity.js';

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
