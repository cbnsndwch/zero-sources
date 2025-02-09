import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

import { ILivechatAgent, LivechatAgentStatus } from '../contracts/livechat/livechat-agent.contracts.js';

import { User } from './user.entity.js';
import { Types } from 'mongoose';

@Schema()
export class LivechatAgent extends User implements ILivechatAgent {
    @Prop({
        type: String,
        enum: Object.values(LivechatAgentStatus),
        default: LivechatAgentStatus.NOT_AVAILABLE
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
