import {
    useParams,
    useOutletContext,
    type ClientLoaderFunctionArgs
} from 'react-router';

import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatInput } from '@/components/chat/ChatInput';
import { setLastVisitedRoom } from '@/utils/room-preferences';

interface OutletContext {
    isRoomDetailsOpen: boolean;
    setIsRoomDetailsOpen: (open: boolean) => void;
    roomType: 'channel';
}

export default function ChannelPage() {
    const { channelId } = useParams();
    const { isRoomDetailsOpen, setIsRoomDetailsOpen } =
        useOutletContext<OutletContext>();

    if (!channelId) {
        return <div>Channel not found</div>;
    }

    return (
        <div className="h-full flex flex-col">
            <ChatHeader
                roomId={channelId}
                roomType="channel"
                isRoomDetailsOpen={isRoomDetailsOpen}
                setIsRoomDetailsOpen={setIsRoomDetailsOpen}
            />
            <div className="flex-1 overflow-hidden">
                <ChatMessages roomId={channelId} roomType="channel" />
            </div>
            <ChatInput roomId={channelId} roomType="channel" />
        </div>
    );
}

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
    if (params.channelId) {
        setLastVisitedRoom('channels', params.channelId);
    }

    return null;
}
