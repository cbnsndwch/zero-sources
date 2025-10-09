import { Hash, Lock, User, type LucideIcon } from 'lucide-react';
import { useMemo } from 'react';
import { NavLink } from 'react-router';

import { RoomType } from '@cbnsndwch/zrocket-contracts';

import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import useRoomTitle from '@/hooks/use-room-title';
import useChats from '@/hooks/use-chats';
import useGroups from '@/hooks/use-groups';
import useChannels from '@/hooks/use-channels';

interface RoomListProps {
    roomType: RoomType;
    searchQuery: string;
}

type Room = {
    id: string;
    name: string;
    url: string;
    online?: boolean;
    members?: number;
    originalData?: any; // Store original data for title generation
};

// Component to handle individual room item with proper title
function RoomListItem({
    room,
    roomData,
    roomType
}: {
    room: Room;
    roomData: any;
    roomType: RoomType;
}) {
    // Map RoomType to the expected type for useRoomTitle
    const getRoomTypeForTitle = (
        type: RoomType
    ): 'dm' | 'group' | 'channel' | undefined => {
        switch (type) {
            case RoomType.DirectMessages:
                return 'dm';
            case RoomType.PrivateGroup:
                return 'group';
            case RoomType.PublicChannel:
                return 'channel';
            default:
                return undefined;
        }
    };

    const title = useRoomTitle(roomData, getRoomTypeForTitle(roomType));
    const Icon = ROOM_ICON_BY_TYPE[roomType] || Hash;

    return (
        <NavLink
            to={room.url}
            className={({ isActive }) =>
                cn(
                    'flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md',
                    isActive && 'bg-accent text-accent-foreground'
                )
            }
        >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate flex-1">{title || room.name}</span>
            {room.online && (
                <div className="h-2 w-2 bg-green-500 rounded-full shrink-0" />
            )}
            {room.members !== undefined && (
                <span className="text-xs text-muted-foreground shrink-0">
                    {room.members}
                </span>
            )}
        </NavLink>
    );
}

function groupByFirstLetter(items: Room[]): Record<string, Room[]> {
    return items.reduce(
        (groups, item) => {
            const firstLetter = item.name.charAt(0).toLowerCase();

            if (!groups[firstLetter]) {
                groups[firstLetter] = [];
            }

            groups[firstLetter].push(item);
            return groups;
        },
        {} as Record<string, Room[]>
    );
}

function mapDirectMessageToRoom(dm: any): Room {
    // For DMs, create a display name from usernames (excluding current user)
    const displayName = dm.usernames?.join(', ') || `Chat ${dm._id}`;

    return {
        id: dm._id,
        name: displayName,
        url: `/d/${dm._id}`,
        online: true, // You could determine this from user status
        originalData: dm
    };
}

function mapPrivateGroupToRoom(group: any): Room {
    return {
        id: group._id,
        name: group.name,
        url: `/p/${group._id}`,
        members: group.memberIds?.length || 0,
        originalData: group
    };
}

function mapChannelToRoom(channel: any): Room {
    return {
        id: channel._id,
        name: channel.name,
        url: `/c/${channel._id}`,
        members: channel.memberIds?.length || 0,
        originalData: channel
    };
}

const ROOM_ICON_BY_TYPE: Partial<Record<RoomType, LucideIcon>> = {
    [RoomType.DirectMessages]: User,
    [RoomType.PrivateGroup]: Lock,
    [RoomType.PublicChannel]: Hash
};

const ROOM_TITLE_BY_TYPE: Partial<Record<RoomType, string>> = {
    [RoomType.DirectMessages]: 'Direct Messages',
    [RoomType.PrivateGroup]: 'Private Groups',
    [RoomType.PublicChannel]: 'Public Channels'
};

export default function RoomList({ roomType, searchQuery }: RoomListProps) {
    // Query data based on room type using hooks
    const [chats, chatsResult] = useChats();
    const [groups, groupsResult] = useGroups();
    const [channels, channelsResult] = useChannels();

    const roomTypeTitle = useMemo(
        () => ROOM_TITLE_BY_TYPE[roomType] || 'Rooms',
        [roomType]
    );

    const rooms = useMemo(() => {
        switch (roomType) {
            case RoomType.DirectMessages:
                if (chatsResult.type !== 'complete' || !chats) {
                    return [];
                }

                return chats
                    .map(mapDirectMessageToRoom)
                    .filter(dm =>
                        dm.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                    );

            case RoomType.PrivateGroup:
                if (groupsResult.type !== 'complete' || !groups) {
                    return [];
                }

                return groups
                    .map(mapPrivateGroupToRoom)
                    .filter(group =>
                        group.name
                            ?.toLowerCase()
                            ?.includes(searchQuery.toLowerCase())
                    );

            case RoomType.PublicChannel:
                if (channelsResult.type !== 'complete' || !channels) {
                    return [];
                }

                return channels
                    .map(mapChannelToRoom)
                    .filter(channel =>
                        channel.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                    );

            // case 'threads':
            // case 'starred':
            // case 'archived':
            //     // These room types don't have data yet, return empty array
            //     return [];
            default:
                return [];
        }
    }, [
        roomType,
        chatsResult.type,
        chats,
        groupsResult.type,
        groups,
        channelsResult.type,
        channels,
        searchQuery
    ]);

    // Check if we're still loading
    const isLoading = useMemo(() => {
        const loadingStateByType: Record<RoomType, boolean> = {
            [RoomType.DirectMessages]: chatsResult.type !== 'complete',
            [RoomType.PrivateGroup]: groupsResult.type !== 'complete',
            [RoomType.PublicChannel]: channelsResult.type !== 'complete'
        };

        const value = loadingStateByType[roomType] ?? false;

        return value;
    }, [channelsResult.type, chatsResult.type, groupsResult.type, roomType]);

    const groupedRooms = useMemo(() => groupByFirstLetter(rooms), [rooms]);

    const sortedGroups = useMemo(
        () => Object.keys(groupedRooms).sort(),
        [groupedRooms]
    );

    if (isLoading) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                <div className="mb-2">Loading {roomTypeTitle}...</div>
            </div>
        );
    }

    if (rooms.length === 0) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                <div className="mb-2">No {roomTypeTitle} found</div>
                {searchQuery && (
                    <div className="text-sm">Try a different search term</div>
                )}
            </div>
        );
    }

    return (
        <ScrollArea className="h-full">
            <div className="p-2">
                {sortedGroups.map(letter => (
                    <div key={letter} className="mb-4">
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {letter}
                        </div>
                        <div className="space-y-1">
                            {groupedRooms[letter].map(room => (
                                <RoomListItem
                                    key={room.id}
                                    room={room}
                                    roomData={room.originalData}
                                    roomType={roomType}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}
