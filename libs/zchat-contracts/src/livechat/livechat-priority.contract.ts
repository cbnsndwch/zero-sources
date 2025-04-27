import type { IEntityBase } from '../common/index.js';

export const LIVECHAT_PRIORITY_LOWEST = '5_LOWEST';
export const LIVECHAT_PRIORITY_LOW = '4_LOW';
export const LIVECHAT_PRIORITY_MEDIUM = '3_MEDIUM';
export const LIVECHAT_PRIORITY_HIGH = '2_HIGH';
export const LIVECHAT_PRIORITY_HIGHEST = '1_HIGHEST';
export const LIVECHAT_PRIORITY_NOT_SPECIFIED = '99_NOT_SPECIFIED';

export const LIVECHAT_PRIORITIES = [
    LIVECHAT_PRIORITY_LOWEST,
    LIVECHAT_PRIORITY_LOW,
    LIVECHAT_PRIORITY_MEDIUM,
    LIVECHAT_PRIORITY_HIGH,
    LIVECHAT_PRIORITY_HIGHEST,
    LIVECHAT_PRIORITY_NOT_SPECIFIED
];

export type LivechatPriority = (typeof LIVECHAT_PRIORITIES)[number];

/**
 * The priority settings for a livechat room or session.
 */
export interface ILivechatPrioritySettings extends IEntityBase {
    /**
     * The name of the livechat priority settings.
     */
    name?: string;

    /**
     * The i18n code of the livechat priority settings.
     */
    i18n: string;

    /**
     * The priority of the livechat.
     */
    priority: LivechatPriority;

    /**
     * Whether the priority has been modified by the user or not.
     */
    dirty: boolean;
}

export type ILivechatPrioritySummary = Omit<
    ILivechatPrioritySettings,
    '_id' | '_updatedAt'
>;
