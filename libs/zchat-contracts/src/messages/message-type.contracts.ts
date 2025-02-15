//#region Ream Messages

export const MSG_REMOVED_USER_FROM_TEAM = 'REMOVED_USER_FROM_TEAM';
export const MSG_ADDED_USER_TO_TEAM = 'ADDED_USER_TO_TEAM';
export const MSG_USER_CONVERTED_TO_TEAM = 'USER_CONVERTED_TO_TEAM';
export const MSG_USER_CONVERTED_TO_CHANNEL = 'USER_CONVERTED_TO_CHANNEL';
export const MSG_USER_REMOVED_ROOM_FROM_TEAM = 'USER_REMOVED_ROOM_FROM_TEAM';
export const MSG_USER_DELETED_ROOM_FROM_TEAM = 'USER_DELETED_ROOM_FROM_TEAM';
export const MSG_USER_ADDED_ROOM_TO_TEAM = 'USER_ADDED_ROOM_TO_TEAM';
export const MSG_USER_LEFT_TEAM = 'USER_LEFT_TEAM';
export const MSG_USER_JOINED_TEAM = 'USER_JOINED_TEAM';

export const TEAM_MESSAGE_TYPES = [
    MSG_REMOVED_USER_FROM_TEAM,
    MSG_ADDED_USER_TO_TEAM,
    MSG_USER_CONVERTED_TO_TEAM,
    MSG_USER_CONVERTED_TO_CHANNEL,
    MSG_USER_REMOVED_ROOM_FROM_TEAM,
    MSG_USER_DELETED_ROOM_FROM_TEAM,
    MSG_USER_ADDED_ROOM_TO_TEAM,
    MSG_USER_LEFT_TEAM,
    MSG_USER_JOINED_TEAM
] as const;

export type TeamMessageType = (typeof TEAM_MESSAGE_TYPES)[number];

//#endregion Ream Messages

//#region Livechat Messages

export const MSG_LIVECHAT_NAVIGATION_HISTORY = 'LIVECHAT_NAVIGATION_HISTORY';
export const MSG_LIVECHAT_TRANSFER_HISTORY = 'LIVECHAT_TRANSFER_HISTORY';
export const MSG_LIVECHAT_TRANSCRIPT_HISTORY = 'LIVECHAT_TRANSCRIPT_HISTORY';
export const MSG_LIVECHAT_TRANSFER_HISTORY_FALLBACK = 'LIVECHAT_TRANSFER_HISTORY_FALLBACK';
export const MSG_LIVECHAT_CLOSED = 'LIVECHAT_CLOSED';
export const MSG_LIVECHAT_STARTED = 'LIVECHAT_STARTED';

export const LIVECHAT_MESSAGE_TYPES = [
    MSG_LIVECHAT_NAVIGATION_HISTORY,
    MSG_LIVECHAT_TRANSFER_HISTORY,
    MSG_LIVECHAT_TRANSCRIPT_HISTORY,
    MSG_LIVECHAT_TRANSFER_HISTORY_FALLBACK,
    MSG_LIVECHAT_CLOSED,
    MSG_LIVECHAT_STARTED
] as const;

export type LivechatMessageType = (typeof LIVECHAT_MESSAGE_TYPES)[number];

//#endregion Livechat Messages

//#region Omnichannel Messages

export const MSG_OMNICHANNEL_PRIORITY_CHANGE_HISTORY = 'OMNICHANNEL_PRIORITY_CHANGE_HISTORY';
export const MSG_OMNICHANNEL_SLA_CHANGE_HISTORY = 'OMNICHANNEL_SLA_CHANGE_HISTORY';
export const MSG_OMNICHANNEL_PLACED_CHAT_ON_HOLD = 'OMNICHANNEL_PLACED_CHAT_ON_HOLD';
export const MSG_OMNICHANNEL_ON_HOLD_CHAT_RESUMED = 'OMNICHANNEL_ON_HOLD_CHAT_RESUMED';

export const OMNICHANNEL_MESSAGE_TYPES = [
    MSG_OMNICHANNEL_PRIORITY_CHANGE_HISTORY,
    MSG_OMNICHANNEL_SLA_CHANGE_HISTORY,
    MSG_OMNICHANNEL_PLACED_CHAT_ON_HOLD,
    MSG_OMNICHANNEL_ON_HOLD_CHAT_RESUMED
] as const;

export type OmnichannelMessageType = (typeof OMNICHANNEL_MESSAGE_TYPES)[number];

//#endregion Omnichannel Messages

//#region User System Messages

export const MSG_USER_JOINED = 'USER_JOINED';

export const MSG_USER_LEFT = 'USER_LEFT';

/**
 * RC: `ru`
 */
export const MSG_USER_REMOVED = 'USER_REMOVED';

/**
 * RC: `au`
 */
export const MSG_USER_ADDED = 'USER_ADDED';

/**
 * RC: `ut`
 */
export const MSG_USER_JOINED_DISCUSSION = 'USER_JOINED_DISCUSSION';

/**
 * RC: `wm`
 */
export const MSG_USER_WELCOME_MESSAGE = 'USER_WELCOME_MESSAGE';

export const USER_ROOM_CHANGE_MESSAGE_TYPES = [
    MSG_USER_JOINED,
    MSG_USER_LEFT,
    MSG_USER_REMOVED,
    MSG_USER_ADDED,
    MSG_USER_JOINED_DISCUSSION,
    MSG_USER_WELCOME_MESSAGE
] as const;

export type UserRoomChangeMessageType = (typeof USER_ROOM_CHANGE_MESSAGE_TYPES)[number];

//#endregion User System Messages

//#region Message Status Changes

/**
 * RC: `rm`
 */
export const MSG_MESSAGE_DELETED = 'MESSAGE_DELETED';
export const MSG_MESSAGE_PINNED = 'MESSAGE_PINNED';

export const MESSAGE_CHANGE_MESSAGE_TYPES = [MSG_MESSAGE_DELETED, MSG_MESSAGE_PINNED] as const;

export type MessageChangeMessageType = (typeof MESSAGE_CHANGE_MESSAGE_TYPES)[number];

//#endregion Message Status Changes

//#region Subscription Role Changes

export const MSG_SUBSCRIPTION_ROLE_ADDED = 'SUBSCRIPTION_ROLE_ADDED';
export const MSG_SUBSCRIPTION_ROLE_REMOVED = 'SUBSCRIPTION_ROLE_REMOVED';

export const SUBSCRIPTION_ROLE_CHANGE_MESSAGE_TYPES = [
    MSG_SUBSCRIPTION_ROLE_ADDED,
    MSG_SUBSCRIPTION_ROLE_REMOVED
] as const;

export type SubscriptionRoleChangeMessageType =
    (typeof SUBSCRIPTION_ROLE_CHANGE_MESSAGE_TYPES)[number];

//#endregion Subscription Role Changes

//#region Room Changes

/**
 * RC: `r`
 */
export const MSG_ROOM_RENAMED = 'ROOM_RENAMED';
export const MSG_ROOM_ARCHIVED = 'ROOM_ARCHIVED';
export const MSG_ROOM_UNARCHIVED = 'ROOM_UNARCHIVED';
export const MSG_ROOM_CHANGED_PRIVACY = 'ROOM_CHANGED_PRIVACY';
export const MSG_ROOM_CHANGED_DESCRIPTION = 'ROOM_CHANGED_DESCRIPTION';
export const MSG_ROOM_CHANGED_ANNOUNCEMENT = 'ROOM_CHANGED_ANNOUNCEMENT';
export const MSG_ROOM_CHANGED_AVATAR = 'ROOM_CHANGED_AVATAR';
export const MSG_ROOM_CHANGED_TOPIC = 'ROOM_CHANGED_TOPIC';
export const MSG_ROOM_REMOVED_READ_ONLY = 'ROOM_REMOVED_READ_ONLY';
export const MSG_ROOM_SET_READ_ONLY = 'ROOM_SET_READ_ONLY';
export const MSG_ROOM_ALLOWED_REACTING = 'ROOM_ALLOWED_REACTING';
export const MSG_ROOM_DISALLOWED_REACTING = 'ROOM_DISALLOWED_REACTING';
export const MSG_ROOM_MODERATOR_ADDED = 'ROOM_MODERATOR_ADDED';
export const MSG_ROOM_MODERATOR_REMOVED = 'ROOM_MODERATOR_REMOVED';
export const MSG_ROOM_OWNER_ADDED = 'ROOM_OWNER_ADDED';
export const MSG_ROOM_OWNER_REMOVED = 'ROOM_OWNER_REMOVED';
export const MSG_ROOM_LEADER_ADDED = 'ROOM_LEADER_ADDED';
export const MSG_ROOM_LEADER_REMOVED = 'ROOM_LEADER_REMOVED';

export const ROOM_CHANGE_MESSAGE_TYPES = [
    MSG_ROOM_RENAMED,
    MSG_ROOM_ARCHIVED,
    MSG_ROOM_UNARCHIVED,
    MSG_ROOM_CHANGED_PRIVACY,
    MSG_ROOM_CHANGED_DESCRIPTION,
    MSG_ROOM_CHANGED_ANNOUNCEMENT,
    MSG_ROOM_CHANGED_AVATAR,
    MSG_ROOM_CHANGED_TOPIC,
    MSG_ROOM_REMOVED_READ_ONLY,
    MSG_ROOM_SET_READ_ONLY,
    MSG_ROOM_ALLOWED_REACTING,
    MSG_ROOM_DISALLOWED_REACTING,
    MSG_ROOM_MODERATOR_ADDED,
    MSG_ROOM_MODERATOR_REMOVED,
    MSG_ROOM_OWNER_ADDED,
    MSG_ROOM_OWNER_REMOVED,
    MSG_ROOM_LEADER_ADDED,
    MSG_ROOM_LEADER_REMOVED
] as const;

export type RoomChangeMessageType = (typeof ROOM_CHANGE_MESSAGE_TYPES)[number];

//#endregion Room Changes

//#region Other Messages

export const MSG_MUTE_UNMUTE = 'MUTE_UNMUTE';
export const MSG_USER_MUTED = 'USER_MUTED';
export const MSG_USER_UNMUTED = 'USER_UNMUTED';
export const MSG_COMMAND = 'COMMAND';

const OTHER_MESSAGE_TYPES = [
    MSG_MUTE_UNMUTE,
    MSG_USER_MUTED,
    MSG_USER_UNMUTED,
    MSG_COMMAND
] as const;

export type OtherMessageType = (typeof OTHER_MESSAGE_TYPES)[number];

//#endregion Other Messages

export const SYSTEM_MESSAGE_TYPES = [
    ...TEAM_MESSAGE_TYPES,
    ...LIVECHAT_MESSAGE_TYPES,
    ...OMNICHANNEL_MESSAGE_TYPES,
    ...USER_ROOM_CHANGE_MESSAGE_TYPES,
    ...MESSAGE_CHANGE_MESSAGE_TYPES,
    ...SUBSCRIPTION_ROLE_CHANGE_MESSAGE_TYPES,
    ...ROOM_CHANGE_MESSAGE_TYPES,
    ...OTHER_MESSAGE_TYPES
] as const;

export type SystemMessageType = (typeof SYSTEM_MESSAGE_TYPES)[number];
