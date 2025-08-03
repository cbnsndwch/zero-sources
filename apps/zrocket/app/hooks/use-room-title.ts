import { useMemo } from 'react';

import type {
    IPrivateGroupRoom,
    IPublicChannelRoom,
    IDirectMessagesRoom
} from '@cbnsndwch/zrocket-contracts';

import useCurrentUser from './use-current-user';

export default function useRoomTitle(
    room?: IPrivateGroupRoom | IPublicChannelRoom | IDirectMessagesRoom,
    roomType?: 'dm' | 'group' | 'channel'
): string {
    const currentUserId = useCurrentUser();

    return useMemo(() => {
        if (!room) {
            return 'N/A';
        }

        // Determine room type from room data if not provided
        const type =
            roomType ||
            (room.t === 'd' ? 'dm' : room.t === 'p' ? 'group' : 'channel');

        switch (type) {
            case 'dm':
                // For DMs, show list of usernames excluding current user
                if ('usernames' in room && Array.isArray(room.usernames)) {
                    const otherUsernames = room.usernames.filter(
                        username => username !== currentUserId
                    );
                    if (otherUsernames.length > 0) {
                        return otherUsernames.join(', ');
                    }
                }
                return 'Direct Message';

            case 'channel':
                // For public channels, show room name or 'N/A'
                if (
                    'name' in room &&
                    typeof room.name === 'string' &&
                    room.name
                ) {
                    return room.name;
                }
                return 'N/A';

            case 'group':
                // For private groups, show room name or 'N/A'
                if (
                    'name' in room &&
                    typeof room.name === 'string' &&
                    room.name
                ) {
                    return room.name;
                }
                return 'N/A';

            default:
                // Fallback logic
                if (
                    'name' in room &&
                    typeof room.name === 'string' &&
                    room.name
                ) {
                    return room.name;
                }
                if ('usernames' in room && Array.isArray(room.usernames)) {
                    const otherUsernames = room.usernames.filter(
                        username => username !== currentUserId
                    );
                    return otherUsernames.join(', ') || 'Direct Message';
                }
                return 'N/A';
        }
    }, [room, roomType, currentUserId]);
}
