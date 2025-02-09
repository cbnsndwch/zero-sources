import type { IEntityBase } from '../base.contracts.js';
import type { IUser } from '../users/user.contract.js';

export enum LivechatAgentStatus {
    AVAILABLE = 'AVAILABLE',
    NOT_AVAILABLE = 'NOT_AVAILABLE'
}

export interface ILivechatAgent extends IUser {
    statusLivechat: LivechatAgentStatus;

    livechatCount: number;

    lastRoutingTime: Date;

    livechatStatusSystemModified?: boolean;

    openBusinessHours?: string[];

    livechat?: {
        maxNumberSimultaneousChat: number;
    };
}

export interface ILivechatAgentActivity extends IEntityBase {
    agentId: string;
    date: Date;
    lastStartedAt: Date;
    availableTime: number;
    lastStoppedAt?: Date;
    serviceHistory: IServiceHistory[];
}

export interface IServiceHistory {
    startedAt: Date;
    stoppedAt: Date;
}

export interface ILivechatAgentSummary {
    username: string;
    agentId: string;
    ts: Date;
}
