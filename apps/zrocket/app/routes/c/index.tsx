import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@rocicorp/zero/react';

import { EmptyChat } from '@/components/layout/EmptyChat';
import { useZero } from '@/zero/use-zero';
import { getLastVisitedRoom, setLastVisitedRoom } from '@/utils/room-preferences';

export default function PublicChannelsIndex() {
    const navigate = useNavigate();
    const z = useZero();

    const [channels, result] = useQuery(
        z.query.channels.orderBy('lastMessageAt', 'desc'),
        { enabled: !!z }
    );

    useEffect(() => {
        if (result.type !== 'complete' || !channels) return;

        // If no channels exist, stay on this page to show empty state
        if (channels.length === 0) return;

        // Check for last visited room
        const lastVisited = getLastVisitedRoom('channels');
        
        if (lastVisited) {
            // Verify the room still exists
            const roomExists = channels.find((channel: any) => channel._id === lastVisited);
            if (roomExists) {
                navigate(`/c/${lastVisited}`, { replace: true });
                return;
            }
        }

        // If no last visited room or it doesn't exist, go to the first available room
        const firstRoom = channels[0] as any;
        if (firstRoom) {
            setLastVisitedRoom('channels', firstRoom._id);
            navigate(`/c/${firstRoom._id}`, { replace: true });
        }
    }, [channels, result.type, navigate]);

    // Show loading state while querying
    if (result.type !== 'complete') {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-muted-foreground">Loading public channels...</div>
            </div>
        );
    }

    // Show empty state if no channels exist
    if (!channels || channels.length === 0) {
        return <EmptyChat roomType="channels" />;
    }

    // This should not be reached since we navigate away, but just in case
    return <EmptyChat roomType="channels" />;
}
