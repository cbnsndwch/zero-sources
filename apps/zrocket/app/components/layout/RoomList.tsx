import { useQuery } from '@rocicorp/zero/react';
import { Hash, Lock, User, type LucideIcon } from 'lucide-react';
import { useMemo } from 'react';
import { NavLink } from 'react-router';

import { ScrollArea } from '@/components/ui/scroll-area';
import type { RoomType } from '@/utils/room-preferences';
import { useZero } from '@/zero/use-zero';
import { cn } from '@/lib/utils';
import useRoomTitle from '@/hooks/use-room-title';

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
            case 'dms':
                return 'dm';
            case 'groups':
                return 'group';
            case 'channels':
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
    dms: User,
    groups: Lock,
    channels: Hash
};

export function RoomList({ roomType, searchQuery }: RoomListProps) {
    const z = useZero();

    // Query data based on room type
    const [chats, chatsResult] = useQuery(
        z.query.chats.orderBy('lastMessageAt', 'desc'),
        { enabled: !!z && roomType === 'dms' }
    );

    const [groups, groupsResult] = useQuery(
        z.query.groups.orderBy('lastMessageAt', 'desc'),
        { enabled: !!z && roomType === 'groups' }
    );

    const [channels, channelsResult] = useQuery(
        z.query.channels.orderBy('lastMessageAt', 'desc'),
        { enabled: !!z && roomType === 'channels' }
    );

    const rooms = useMemo(() => {
        switch (roomType) {
            case 'dms':
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

            case 'groups':
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

            case 'channels':
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
    const isLoading = useMemo(
        () =>
            (roomType === 'dms' && chatsResult.type !== 'complete') ||
            (roomType === 'groups' && groupsResult.type !== 'complete') ||
            (roomType === 'channels' && channelsResult.type !== 'complete'),
        [channelsResult.type, chatsResult.type, groupsResult.type, roomType]
    );

    const groupedRooms = useMemo(() => groupByFirstLetter(rooms), [rooms]);

    const sortedGroups = useMemo(
        () => Object.keys(groupedRooms).sort(),
        [groupedRooms]
    );

    if (isLoading) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                <div className="mb-2">Loading {roomType}...</div>
            </div>
        );
    }

    if (rooms.length === 0) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                <div className="mb-2">No {roomType} found</div>
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
