import { useParams, useOutletContext } from 'react-router';

import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatInput } from '@/components/chat/ChatInput';

interface OutletContext {
    isRoomDetailsOpen: boolean;
    setIsRoomDetailsOpen: (open: boolean) => void;
}

export default function ChannelPage() {
    const { channelId } = useParams();
    const { isRoomDetailsOpen, setIsRoomDetailsOpen } =
        useOutletContext<OutletContext>();

    return (
        <div className="h-full flex flex-col">
            <ChatHeader
                roomId={channelId!}
                roomType="channel"
                isRoomDetailsOpen={isRoomDetailsOpen}
                setIsRoomDetailsOpen={setIsRoomDetailsOpen}
            />
            <div className="flex-1 overflow-hidden">
                <ChatMessages roomId={channelId!} roomType="channel" />
            </div>
            <ChatInput roomId={channelId!} roomType="channel" />
        </div>
    );
}
