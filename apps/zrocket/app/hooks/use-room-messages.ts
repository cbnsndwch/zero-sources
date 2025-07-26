import { useMemo } from 'react';

import type { ChannelWithMessages } from './use-channel';
import type { ChatWithMessages } from './use-chat';
import type { GroupWithMessages } from './use-group';

import type { IImageMessage, ITextMessage } from '@/zero/contracts';

export default function useRoomMessages(
    room: ChatWithMessages | ChannelWithMessages | GroupWithMessages
    // includeSystemMessages?: boolean
): Array<IImageMessage | ITextMessage> {
    const messages = useMemo(() => {
        if (!room) {
            return [];
        }

        return [
            ...room.textMessages.map(msg => ({
                ...msg,
                type: 'text' as const
            })),
            ...room.imageMessages.map(msg => ({
                ...msg,
                type: 'image' as const
            }))
            // ...(includeSystemMessages ? room.systemMessages : [])
        ].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
    }, [room]);

    return messages;
}
