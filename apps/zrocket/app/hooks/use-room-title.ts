import { useMemo } from 'react';

import type { ChannelWithMessages } from './use-channel';
import type { ChatWithMessages } from './use-chat';
import type { GroupWithMessages } from './use-group';

export default function useRoomTitle(
    room: ChatWithMessages | ChannelWithMessages | GroupWithMessages
): string {
    return useMemo(() => {
        if (!room) {
            return '';
        }

        let title = '';

        if ('title' in room && typeof room.title === 'string') {
            title = room.title;
        } else if ('name' in room && typeof room.name === 'string') {
            title = room.name;
        } else if ('usernames' in room && Array.isArray(room.usernames)) {
            title = room.usernames.join(', ');
        }

        return title || 'Untitled Room';
    }, [room]);
}
