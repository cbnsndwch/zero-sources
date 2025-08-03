import { useParams } from 'react-router';

import { ChannelDetails } from './room-details/ChannelDetails';
import { GroupDetails } from './room-details/GroupDetails';
import { ChatDetails } from './room-details/ChatDetails';

export function RoomDetails() {
    const params = useParams();
    const roomId = params.chatId || params.groupId || params.channelId;
    const roomType = params.chatId
        ? 'dm'
        : params.groupId
          ? 'group'
          : 'channel';

    if (!roomId) {
        return (
            <div className="h-full bg-background border-l border-border flex items-center justify-center">
                <div className="text-muted-foreground">No room selected</div>
            </div>
        );
    }

    switch (roomType) {
        case 'channel':
            return <ChannelDetails channelId={roomId} />;
        case 'group':
            return <GroupDetails groupId={roomId} />;
        case 'dm':
            return <ChatDetails chatId={roomId} />;
        default:
            return (
                <div className="h-full bg-background border-l border-border flex items-center justify-center">
                    <div className="text-muted-foreground">
                        Unknown room type
                    </div>
                </div>
            );
    }
}
