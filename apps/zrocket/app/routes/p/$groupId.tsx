import { useParams, useOutletContext } from 'react-router';

import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatInput } from '@/components/chat/ChatInput';

interface OutletContext {
    isRoomDetailsOpen: boolean;
    setIsRoomDetailsOpen: (open: boolean) => void;
}

export default function GroupPage() {
    const { groupId } = useParams();
    const { isRoomDetailsOpen, setIsRoomDetailsOpen } =
        useOutletContext<OutletContext>();

    return (
        <div className="h-full flex flex-col">
            <ChatHeader
                roomId={groupId!}
                roomType="group"
                isRoomDetailsOpen={isRoomDetailsOpen}
                setIsRoomDetailsOpen={setIsRoomDetailsOpen}
            />
            <div className="flex-1 overflow-hidden">
                <ChatMessages roomId={groupId!} roomType="group" />
            </div>
            <ChatInput roomId={groupId!} roomType="group" />
        </div>
    );
}
