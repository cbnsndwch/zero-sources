import { useParams, useOutletContext } from 'react-router';
import { useEffect } from 'react';

import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatInput } from '@/components/chat/ChatInput';
import { setLastVisitedRoom } from '@/utils/room-preferences';

interface OutletContext {
    isRoomDetailsOpen: boolean;
    setIsRoomDetailsOpen: (open: boolean) => void;
    roomType: 'group';
}

export default function GroupPage() {
    const { chatId } = useParams();
    const { isRoomDetailsOpen, setIsRoomDetailsOpen } = useOutletContext<OutletContext>();

    // Track room visit
    useEffect(() => {
        if (chatId) {
            setLastVisitedRoom('groups', chatId);
        }
    }, [chatId]);

    if (!chatId) {
        return <div>Group not found</div>;
    }

    return (
        <div className="h-full flex flex-col">
            <ChatHeader
                roomId={chatId}
                roomType="group"
                isRoomDetailsOpen={isRoomDetailsOpen}
                setIsRoomDetailsOpen={setIsRoomDetailsOpen}
            />
            <div className="flex-1 overflow-hidden">
                <ChatMessages roomId={chatId} roomType="group" />
            </div>
            <ChatInput roomId={chatId} roomType="group" />
        </div>
    );
}
