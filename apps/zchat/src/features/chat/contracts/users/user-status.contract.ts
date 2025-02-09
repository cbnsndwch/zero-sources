export const USER_STATUS_ONLINE = 'ONLINE';
export const USER_STATUS_AWAY = 'AWAY';
export const USER_STATUS_OFFLINE = 'OFFLINE';
export const USER_STATUS_BUSY = 'BUSY';
export const USER_STATUS_DISABLED = 'DISABLED';

export const USER_STATUSES = [
    USER_STATUS_ONLINE,
    USER_STATUS_AWAY,
    USER_STATUS_OFFLINE,
    USER_STATUS_BUSY,
    USER_STATUS_DISABLED
] as const;

export type UserStatus = (typeof USER_STATUSES)[number];
