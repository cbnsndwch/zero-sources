import { useMemo } from 'react';
import { useParams, useLocation } from 'react-router';

import ChannelDetails from './ChannelDetails';
import GroupDetails from './GroupDetails';
import ChatDetails from './ChatDetails';

import UnknownRoomDetails from './UnknownRoomDetails';

const DETAILS_COMPONENT = {
    channel: ChannelDetails,
    group: GroupDetails,
    dm: ChatDetails
} as const;

export function RoomDetails() {
    const params = useParams();
    const location = useLocation();

    const roomId = useMemo(
        () => params.chatId ?? params.groupId ?? params.channelId,
        [params.channelId, params.chatId, params.groupId]
    );

    // Determine room type based on the current URL path
    const roomType = useMemo(
        () =>
            location.pathname.startsWith('/p/')
                ? 'group'
                : location.pathname.startsWith('/c/')
                  ? 'channel'
                  : 'dm',
        [location.pathname]
    );

    const Component = useMemo(
        () =>
            roomType
                ? (DETAILS_COMPONENT[roomType] ?? UnknownRoomDetails)
                : null,
        [roomType]
    );

    if (!roomId) {
        return (
            <div className="h-full bg-background border-l border-border flex items-center justify-center">
                <div className="text-muted-foreground">No room selected</div>
            </div>
        );
    }

    if (!Component) {
        return <UnknownRoomDetails />;
    }

    return <Component id={roomId} />;
}
