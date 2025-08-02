import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@rocicorp/zero/react';

import { EmptyChat } from '@/components/layout/EmptyChat';
import { useZero } from '@/zero/use-zero';
import { getLastVisitedRoom, setLastVisitedRoom } from '@/utils/room-preferences';

export default function PrivateGroupsIndex() {
    const navigate = useNavigate();
    const z = useZero();

    const [groups, result] = useQuery(
        z.query.groups.orderBy('lastMessageAt', 'desc'),
        { enabled: !!z }
    );

    useEffect(() => {
        if (result.type !== 'complete' || !groups) return;

        // If no groups exist, stay on this page to show empty state
        if (groups.length === 0) return;

        // Check for last visited room
        const lastVisited = getLastVisitedRoom('groups');
        
        if (lastVisited) {
            // Verify the room still exists
            const roomExists = groups.find((group: any) => group._id === lastVisited);
            if (roomExists) {
                navigate(`/p/${lastVisited}`, { replace: true });
                return;
            }
        }

        // If no last visited room or it doesn't exist, go to the first available room
        const firstRoom = groups[0] as any;
        if (firstRoom) {
            setLastVisitedRoom('groups', firstRoom._id);
            navigate(`/p/${firstRoom._id}`, { replace: true });
        }
    }, [groups, result.type, navigate]);

    // Show loading state while querying
    if (result.type !== 'complete') {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-muted-foreground">Loading private groups...</div>
            </div>
        );
    }

    // Show empty state if no groups exist
    if (!groups || groups.length === 0) {
        return <EmptyChat roomType="groups" />;
    }

    // This should not be reached since we navigate away, but just in case
    return <EmptyChat roomType="groups" />;
}
