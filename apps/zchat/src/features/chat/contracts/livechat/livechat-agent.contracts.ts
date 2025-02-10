import type { IEntityBase } from '../../../../common/contracts/index.js';
import type { IUser } from '../../../users/contracts/user.contract.js';

export const LIVECHAT_AGENT_STATUS_AVAILABLE = 'AVAILABLE ';
export const LIVECHAT_AGENT_STATUS_NOT_AVAILABLE = 'NOT_AVAILABLE ';

export const LIVECHAT_AGENT_STATUSES = [
    LIVECHAT_AGENT_STATUS_AVAILABLE,
    LIVECHAT_AGENT_STATUS_NOT_AVAILABLE
] as const;

export type LivechatAgentStatus = (typeof LIVECHAT_AGENT_STATUSES)[number];

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
