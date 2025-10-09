import { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

import EmptyChat from '@/components/layout/EmptyChat';
import useGroups from '@/hooks/use-groups';
import {
    getLastVisitedRoom,
    setLastVisitedRoom
} from '@/utils/room-preferences';

interface OutletContext {
    isRoomDetailsOpen: boolean;
    setIsRoomDetailsOpen: (open: boolean) => void;
    roomType: 'group';
}

export default function GroupsIndex() {
    const navigate = useNavigate();
    useOutletContext<OutletContext>(); // Just to validate context exists

    // Get private groups using the hook
    const [groups, groupsResult] = useGroups();

    useEffect(() => {
        const attemptRedirect = () => {
            // Check if we're still loading
            if (groupsResult.type !== 'complete') return;

            const groupList = groups || [];

            if (groupList.length === 0) {
                return; // No groups available, stay on index page to show empty state
            }

            // Check for last visited room of this type
            const lastVisitedRoomId = getLastVisitedRoom('groups');
            const lastVisitedRoom = lastVisitedRoomId
                ? groupList.find(group => group._id === lastVisitedRoomId)
                : null;

            if (lastVisitedRoom) {
                navigate(`/p/${lastVisitedRoom._id}`, { replace: true });
            } else {
                // Navigate to the first available room and set it as last visited
                const firstRoom = groupList[0];
                setLastVisitedRoom('groups', firstRoom._id);
                navigate(`/p/${firstRoom._id}`, { replace: true });
            }
        };

        attemptRedirect();
    }, [groups, groupsResult.type, navigate]);

    // Show loading state while querying
    if (groupsResult.type !== 'complete') {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-muted-foreground">Loading groups...</div>
            </div>
        );
    }

    return <EmptyChat roomType="groups" />;
}
