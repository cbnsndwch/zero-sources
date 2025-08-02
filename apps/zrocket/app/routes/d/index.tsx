import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@rocicorp/zero/react';

import { EmptyChat } from '@/components/layout/EmptyChat';
import { useZero } from '@/zero/use-zero';
import { getLastVisitedRoom, setLastVisitedRoom } from '@/utils/room-preferences';

export default function DirectMessagesIndex() {
    const navigate = useNavigate();
    const z = useZero();

    const [chats, result] = useQuery(
        z.query.chats.orderBy('lastMessageAt', 'desc'),
        { enabled: !!z }
    );

    useEffect(() => {
        if (result.type !== 'complete' || !chats) return;

        // If no chats exist, stay on this page to show empty state
        if (chats.length === 0) return;

        // Check for last visited room
        const lastVisited = getLastVisitedRoom('dms');
        
        if (lastVisited) {
            // Verify the room still exists
            const roomExists = chats.find((chat: any) => chat._id === lastVisited);
            if (roomExists) {
                navigate(`/d/${lastVisited}`, { replace: true });
                return;
            }
        }

        // If no last visited room or it doesn't exist, go to the first available room
        const firstRoom = chats[0] as any;
        if (firstRoom) {
            setLastVisitedRoom('dms', firstRoom._id);
            navigate(`/d/${firstRoom._id}`, { replace: true });
        }
    }, [chats, result.type, navigate]);

    // Show loading state while querying
    if (result.type !== 'complete') {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-muted-foreground">Loading direct messages...</div>
            </div>
        );
    }

    // Show empty state if no chats exist
    if (!chats || chats.length === 0) {
        return <EmptyChat roomType="dms" />;
    }

    // This should not be reached since we navigate away, but just in case
    return <EmptyChat roomType="dms" />;
}
