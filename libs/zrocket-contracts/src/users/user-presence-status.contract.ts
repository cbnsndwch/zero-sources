export enum UserPresenceStatus {
    ONLINE = 'ONLINE',
    AWAY = 'AWAY',
    OFFLINE = 'OFFLINE',
    BUSY = 'BUSY',
    DISABLED = 'DISABLED'
}

export const USER_PRESENCE_STATUSES = [
    ...Object.values(UserPresenceStatus)
] as const;
