import { useMemo } from 'react';

import type { ChannelWithMessages } from './use-channel';
import type { ChatWithMessages } from './use-chat';
import type { GroupWithMessages } from './use-group';

export default function useRoomMessages(
    room?: ChatWithMessages | ChannelWithMessages | GroupWithMessages 
    // includeSystemMessages?: boolean
) {
    const messages = useMemo(() => {
        if (!room?.messages) {
            return [];
        }

        // ...(includeSystemMessages ? room.systemMessages : [])
        return room.messages.sort(
            (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
        );
    }, [room]);

    return messages;
}
