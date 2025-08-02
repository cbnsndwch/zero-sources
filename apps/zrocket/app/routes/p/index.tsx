import { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

import { useQuery } from '@rocicorp/zero/react';

import { EmptyChat } from '@/components/layout/EmptyChat';
import { useZero } from '@/zero/use-zero';
import { getLastVisitedRoom, setLastVisitedRoom } from '@/utils/room-preferences';

interface OutletContext {
    isRoomDetailsOpen: boolean;
    setIsRoomDetailsOpen: (open: boolean) => void;
    roomType: 'group';
}

export default function GroupsIndex() {
    const navigate = useNavigate();
    useOutletContext<OutletContext>(); // Just to validate context exists
    const z = useZero();

    // Get group chats
    const [chats, chatsResult] = useQuery(
        z.query.chats.orderBy('lastMessageAt', 'desc'),
        { enabled: !!z }
    );

    useEffect(() => {
        const attemptRedirect = () => {
            // Check if we're still loading
            if (chatsResult.type !== 'complete') return;

            // Filter for group chats only
            const groupChats = chats?.filter((chat: any) => chat.type === 'group') || [];

            if (groupChats.length === 0) {
                return; // No chats available, stay on index page to show empty state
            }

            // Check for last visited room of this type
            const lastVisitedRoomId = getLastVisitedRoom('groups');
            const lastVisitedRoom = lastVisitedRoomId 
                ? groupChats.find(chat => chat._id === lastVisitedRoomId)
                : null;

            if (lastVisitedRoom) {
                navigate(`/p/${lastVisitedRoom._id}`, { replace: true });
            } else {
                // Navigate to the first available room and set it as last visited
                const firstRoom = groupChats[0];
                setLastVisitedRoom('groups', firstRoom._id);
                navigate(`/p/${firstRoom._id}`, { replace: true });
            }
        };

        attemptRedirect();
    }, [chats, chatsResult.type, navigate]);

    // Show loading state while querying
    if (chatsResult.type !== 'complete') {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-muted-foreground">
                    Loading groups...
                </div>
            </div>
        );
    }

    return <EmptyChat roomType="groups" />;
}
