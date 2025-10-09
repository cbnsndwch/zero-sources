import { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

import EmptyChat from '@/components/layout/EmptyChat';
import useChats from '@/hooks/use-chats';
import {
    getLastVisitedRoom,
    setLastVisitedRoom
} from '@/utils/room-preferences';

interface OutletContext {
    isRoomDetailsOpen: boolean;
    setIsRoomDetailsOpen: (open: boolean) => void;
    roomType: 'dm';
}

export default function DirectMessagesIndex() {
    const navigate = useNavigate();
    useOutletContext<OutletContext>(); // Just to validate context exists

    // Get DM chats using the hook
    const [chats, chatsResult] = useChats();

    useEffect(() => {
        const attemptRedirect = () => {
            // Check if we're still loading
            if (chatsResult.type !== 'complete') return;

            // Filter for DM chats only
            const dmChats =
                chats?.filter((chat: any) => chat.type === 'dm') || [];

            if (dmChats.length === 0) {
                return; // No chats available, stay on index page to show empty state
            }

            // Check for last visited room of this type
            const lastVisitedRoomId = getLastVisitedRoom('dms');
            const lastVisitedRoom = lastVisitedRoomId
                ? dmChats.find(chat => chat._id === lastVisitedRoomId)
                : null;

            if (lastVisitedRoom) {
                navigate(`/d/${lastVisitedRoom._id}`, { replace: true });
            } else {
                // Navigate to the first available room and set it as last visited
                const firstRoom = dmChats[0];
                setLastVisitedRoom('dms', firstRoom._id);
                navigate(`/d/${firstRoom._id}`, { replace: true });
            }
        };

        attemptRedirect();
    }, [chats, chatsResult.type, navigate]);

    // Show loading state while querying
    if (chatsResult.type !== 'complete') {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-muted-foreground">
                    Loading direct messages...
                </div>
            </div>
        );
    }

    return <EmptyChat roomType="dms" />;
}
