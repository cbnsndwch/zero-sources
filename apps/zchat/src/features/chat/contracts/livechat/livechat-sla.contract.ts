import type { IEntityBase } from '../../../../common/contracts/index.js';

export const DEFAULT_LIVECHAT_SLA = {
    ESTIMATED_WAITING_TIME_QUEUE: 9_999_999
};

export interface ILivechatSla extends IEntityBase {
    name: string;
    description?: string;
    dueTimeInMinutes: number;
}
