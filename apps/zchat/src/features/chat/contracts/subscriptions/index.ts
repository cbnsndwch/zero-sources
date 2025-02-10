import type { IEntityBase } from '../../../../common/contracts/index.js';
import type { RoomType } from '../rooms/room-type.contract.js';
import type { IUserSummaryWithName } from '../../../users/contracts/user.contract.js';

/**
 * Represents a subscription to a chat room or conversation.
 */
export interface ISubscription extends IEntityBase {
    /**
     * The type of the room.
     */
    t: RoomType;

    /**
     * Summary information about the user associated with the subscription.
     */
    u: IUserSummaryWithName;

    /**
     * The ID of the room.
     */
    roomId: string;

    /**
     * Indicates whether the room is open.
     */
    open: boolean;

    /**
     * The timestamp of the subscription.
     */
    ts: Date;

    /**
     * The name of the room.
     */
    name: string;

    /**
     * Indicates whether an alert is active.
     */
    alert?: boolean;

    /**
     * The number of unread messages.
     */
    unread: number;

    /**
     * The timestamp of the last seen message.
     */
    ls: Date;

    /**
     * A boolean flag (purpose unclear).
     */
    f?: boolean;

    /**
     * The timestamp of the last read message.
     */
    lr: Date;

    /**
     * Indicates whether to hide the unread status.
     */
    hideUnreadStatus?: true;

    /**
     * Indicates whether to hide the mention status.
     */
    hideMentionStatus?: true;

    /**
     * The number of user mentions.
     */
    userMentions: number;

    /**
     * The number of group mentions.
     */
    groupMentions: number;

    // tunread?: Array<string>;
    // tunreadGroup?: Array<string>;
    // tunreadUser?: Array<string>;

    /**
     * TODO: remove ???
     */
    roles?: string[];

    /**
     * An array of user highlight strings.
     */
    userHighlights?: string[];

    /**
     * Indicates whether notifications are disabled.
     */
    disableNotifications?: boolean;

    /**
     * The type of audio notifications.
     */
    audioNotifications?: string;

    /**
     * The type of unread alerts with a default value.
     */
    unreadAlerts?: NotificationTypeWithDefault;

    /**
     * The type of desktop notifications.
     */
    desktopNotifications?: NotificationType;

    /**
     * The type of mobile push notifications.
     */
    mobilePushNotifications?: NotificationType;

    /**
     * The type of email notifications.
     */
    emailNotifications?: NotificationType;

    /**
     * Indicates whether group mentions are muted.
     */
    muteGroupMentions?: boolean;

    /**
     * An array of user IDs to ignore.
     */
    ignoredUserIds?: string[];
}

//#region Notification Types

export const NOTIFICATION_TYPE_ALL = 'all';
export const NOTIFICATION_TYPE_MENTIONS = 'mentions';
export const NOTIFICATION_TYPE_NOTHING = 'nothing';

export const NOTIFICATION_TYPES = [
    NOTIFICATION_TYPE_ALL,
    NOTIFICATION_TYPE_MENTIONS,
    NOTIFICATION_TYPE_NOTHING
] as const;

/**
 * The types of notifications a user wants to receive for a given subscription.
 * Supported values are:
 *
 * - `all`: Receive all notifications.
 * - `mentions`: Receive notifications only for mentions.
 * - `nothing`: Receive no notifications.
 */
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_TYPE_DEFAULT = 'default';

export const NOTIFICATION_TYPES_WITH_DEFAULT = [
    ...NOTIFICATION_TYPES,
    NOTIFICATION_TYPE_DEFAULT
] as const;

/**
 * Extends the `NotificationType` type to include a default value.
 */
export type NotificationTypeWithDefault = (typeof NOTIFICATION_TYPES_WITH_DEFAULT)[number];
