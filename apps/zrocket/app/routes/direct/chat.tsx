import { useParams, useOutletContext } from 'react-router';
import { useEffect } from 'react';

import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatInput } from '@/components/chat/ChatInput';
import { setLastVisitedRoom } from '@/utils/room-preferences';

interface OutletContext {
    isRoomDetailsOpen: boolean;
    setIsRoomDetailsOpen: (open: boolean) => void;
    roomType: 'dm';
}

export default function DirectMessagePage() {
    const { chatId } = useParams();
    const { isRoomDetailsOpen, setIsRoomDetailsOpen } =
        useOutletContext<OutletContext>();

    // Track room visit
    useEffect(() => {
        if (chatId) {
            setLastVisitedRoom('dms', chatId);
        }
    }, [chatId]);

    if (!chatId) {
        return <div>Chat not found</div>;
    }

    return (
        <div className="h-full flex flex-col">
            <ChatHeader
                roomId={chatId}
                roomType="dm"
                isRoomDetailsOpen={isRoomDetailsOpen}
                setIsRoomDetailsOpen={setIsRoomDetailsOpen}
            />
            <div className="flex-1 overflow-hidden">
                <ChatMessages roomId={chatId} roomType="dm" />
            </div>
            <ChatInput roomId={chatId} roomType="dm" />
        </div>
    );
}
