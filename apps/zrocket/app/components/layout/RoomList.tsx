import { Hash, Lock, User } from 'lucide-react';
import { NavLink } from 'react-router';
import { useQuery } from '@rocicorp/zero/react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { useZero } from '@/zero/use-zero';

interface RoomListProps {
    roomType: string;
    searchQuery: string;
}

type Room = {
    id: string;
    name: string;
    url: string;
    online?: boolean;
    members?: number;
};

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
        online: true // You could determine this from user status
    };
}

function mapPrivateGroupToRoom(group: any): Room {
    return {
        id: group._id,
        name: group.name,
        url: `/p/${group._id}`,
        members: group.memberIds?.length || 0
    };
}

function mapChannelToRoom(channel: any): Room {
    return {
        id: channel._id,
        name: channel.name,
        url: `/c/${channel._id}`,
        members: channel.memberIds?.length || 0
    };
}

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

    const getRoomsForType = (): Room[] => {
        switch (roomType) {
            case 'dms':
                if (chatsResult.type !== 'complete' || !chats) return [];
                return chats
                    .map(mapDirectMessageToRoom)
                    .filter(dm =>
                        dm.name.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    
            case 'groups':
                if (groupsResult.type !== 'complete' || !groups) return [];
                return groups
                    .map(mapPrivateGroupToRoom)
                    .filter(group =>
                        group.name.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    
            case 'channels':
                if (channelsResult.type !== 'complete' || !channels) return [];
                return channels
                    .map(mapChannelToRoom)
                    .filter(channel =>
                        channel.name.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    
            case 'threads':
            case 'starred':
            case 'archived':
                // These room types don't have data yet, return empty array
                return [];
            default:
                return [];
        }
    };

    const getRoomIcon = () => {
        switch (roomType) {
            case 'dms':
                return User;
            case 'groups':
                return Lock;
            case 'channels':
                return Hash;
            default:
                return Hash;
        }
    };

    // Check if we're still loading
    const isLoading = 
        (roomType === 'dms' && chatsResult.type !== 'complete') ||
        (roomType === 'groups' && groupsResult.type !== 'complete') ||
        (roomType === 'channels' && channelsResult.type !== 'complete');

    if (isLoading) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                <div className="mb-2">Loading {roomType}...</div>
            </div>
        );
    }

    const rooms = getRoomsForType();
    const groupedRooms = groupByFirstLetter(rooms);
    const sortedGroups = Object.keys(groupedRooms).sort();
    const Icon = getRoomIcon();

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
                                <NavLink
                                    key={room.id}
                                    to={room.url}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-muted ${
                                            isActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-foreground'
                                        }`
                                    }
                                >
                                    <Icon className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate flex-1">
                                        {room.name}
                                    </span>
                                    {roomType === 'dms' &&
                                        room.online !== undefined && (
                                            <div
                                                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                                    room.online
                                                        ? 'bg-green-500'
                                                        : 'bg-gray-400'
                                                }`}
                                            />
                                        )}
                                    {roomType !== 'dms' && room.members && (
                                        <span className="text-xs text-muted-foreground flex-shrink-0">
                                            {room.members}
                                        </span>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}
