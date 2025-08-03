import { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

import { useQuery } from '@rocicorp/zero/react';

import { EmptyChat } from '@/components/layout/EmptyChat';
import { useZero } from '@/zero/use-zero';
import { getLastVisitedRoom, setLastVisitedRoom } from '@/utils/room-preferences';

interface OutletContext {
    isRoomDetailsOpen: boolean;
    setIsRoomDetailsOpen: (open: boolean) => void;
    roomType: 'channel';
}

export default function ChannelsIndex() {
    const navigate = useNavigate();
    useOutletContext<OutletContext>(); // Just to validate context exists
    const z = useZero();

    // Get channels
    const [channels, channelsResult] = useQuery(
        z.query.channels.orderBy('name', 'asc'),
        { enabled: !!z }
    );

    useEffect(() => {
        const attemptRedirect = () => {
            // Check if we're still loading
            if (channelsResult.type !== 'complete') return;

            const channelList = channels || [];

            if (channelList.length === 0) {
                return; // No channels available, stay on index page to show empty state
            }

            // Check for last visited room of this type
            const lastVisitedRoomId = getLastVisitedRoom('channels');
            const lastVisitedRoom = lastVisitedRoomId 
                ? channelList.find(channel => channel._id === lastVisitedRoomId)
                : null;

            if (lastVisitedRoom) {
                navigate(`/c/${lastVisitedRoom._id}`, { replace: true });
            } else {
                // Navigate to the first available room and set it as last visited
                const firstRoom = channelList[0];
                setLastVisitedRoom('channels', firstRoom._id);
                navigate(`/c/${firstRoom._id}`, { replace: true });
            }
        };

        attemptRedirect();
    }, [channels, channelsResult.type, navigate]);

    // Show loading state while querying
    if (channelsResult.type !== 'complete') {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-muted-foreground">
                    Loading channels...
                </div>
            </div>
        );
    }

    return <EmptyChat roomType="channels" />;
}
