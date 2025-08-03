import {
    Users,
    Settings,
    Bell,
    Star,
    Archive,
    Pin,
    Hash,
    Lock,
    User
} from 'lucide-react';
import { useParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import useChannel from '@/hooks/use-channel';
import useGroup from '@/hooks/use-group';
import useChat from '@/hooks/use-chat';
import useUsersByIds from '@/hooks/use-users-by-ids';
import useCurrentUser from '@/hooks/use-current-user';

export function RoomDetails() {
    const params = useParams();
    const roomId = params.chatId || params.groupId || params.channelId;
    const roomType = params.chatId
        ? 'dm'
        : params.groupId
          ? 'group'
          : 'channel';

    // Get current user ID
    const currentUserId = useCurrentUser();

    // Fetch room data based on room type
    const channelQueryResult = useChannel(
        roomType === 'channel' && roomId ? roomId : ''
    );
    const groupQueryResult = useGroup(
        roomType === 'group' && roomId ? roomId : ''
    );
    const chatQueryResult = useChat(roomType === 'dm' && roomId ? roomId : '');

    // Get the appropriate room data
    const room =
        roomType === 'channel'
            ? channelQueryResult[0]
            : roomType === 'group'
              ? groupQueryResult[0]
              : roomType === 'dm'
                ? chatQueryResult[0]
                : undefined;

    // Get member IDs from room
    const memberIds = room && 'memberIds' in room ? room.memberIds || [] : [];

    // For DMs, we need to get the usernames and filter out current user
    const dmUsernames =
        roomType === 'dm' &&
        room &&
        'usernames' in room &&
        Array.isArray(room.usernames)
            ? room.usernames.filter(username => username !== currentUserId)
            : [];

    // Get users for members (for DM username lookup if needed)
    const usersMap = useUsersByIds(memberIds);

    // Get room members
    const roomMembers = memberIds
        .map(memberId => usersMap.get(memberId))
        .filter(Boolean);
    const getRoomIcon = () => {
        switch (roomType) {
            case 'dm':
                return User;
            case 'group':
                return Lock;
            case 'channel':
                return Hash;
            default:
                return Hash;
        }
    };

    const getRoomTitle = () => {
        if (!roomId) return 'No room selected';

        switch (roomType) {
            case 'dm':
                // For DMs, show list of usernames excluding current user
                if (dmUsernames.length > 0) {
                    return dmUsernames.join(', ');
                }
                return 'Direct Message';

            case 'channel':
                // For public channels, show room name or 'N/A'
                if (room && 'name' in room && room.name) {
                    return room.name;
                }
                return 'N/A';

            case 'group':
                // For private groups, show room name or 'N/A'
                if (room && 'name' in room && room.name) {
                    return room.name;
                }
                return 'N/A';

            default:
                return 'N/A';
        }
    };

    const getRoomDescription = () => {
        if (roomType === 'channel' && room && 'description' in room) {
            return (
                room.description ||
                `Welcome to #${getRoomTitle()}! This is where the team collaborates.`
            );
        }
        if (roomType === 'group') {
            return `Private group for ${getRoomTitle()} discussions.`;
        }
        if (roomType === 'dm') {
            return `Direct messages with ${getRoomTitle()}.`;
        }
        return '';
    };

    const Icon = getRoomIcon();

    return (
        <div className="h-full bg-background border-l border-border">
            <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                    {/* Room Header */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <h2 className="font-semibold text-lg">
                                {getRoomTitle()}
                            </h2>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm">
                                <Bell className="h-4 w-4 mr-1" />
                                Notifications
                            </Button>
                            <Button variant="outline" size="sm">
                                <Star className="h-4 w-4 mr-1" />
                                Star
                            </Button>
                            <Button variant="outline" size="sm">
                                <Settings className="h-4 w-4 mr-1" />
                                Settings
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* Room Description */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-sm">About</h3>
                        <p className="text-sm text-muted-foreground">
                            {getRoomDescription()}
                        </p>
                    </div>

                    <Separator />

                    {/* Pinned Messages */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-sm flex items-center gap-2">
                            <Pin className="h-4 w-4" />
                            Pinned Messages
                        </h3>
                        <div className="text-sm text-muted-foreground">
                            No pinned messages
                        </div>
                    </div>

                    {roomType !== 'dm' && (
                        <>
                            <Separator />

                            {/* Members */}
                            <div className="space-y-3">
                                <h3 className="font-medium text-sm flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Members ({roomMembers.length})
                                </h3>

                                <div className="space-y-2">
                                    {roomMembers.map((member: any) => (
                                        <div
                                            key={member._id}
                                            className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                                        >
                                            <div className="relative">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="text-xs">
                                                        {(
                                                            member.name ||
                                                            member.username ||
                                                            'U'
                                                        )
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div
                                                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background ${
                                                        member.status ===
                                                        'online'
                                                            ? 'bg-green-500'
                                                            : member.status ===
                                                                'away'
                                                              ? 'bg-yellow-500'
                                                              : 'bg-gray-400'
                                                    }`}
                                                />
                                            </div>
                                            <span className="text-sm font-medium">
                                                {member.name || member.username}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <Separator />

                    {/* Actions */}
                    <div className="space-y-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                        >
                            <Archive className="h-4 w-4 mr-2" />
                            Archive {roomType}
                        </Button>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
