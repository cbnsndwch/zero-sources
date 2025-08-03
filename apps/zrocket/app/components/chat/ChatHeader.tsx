import { Hash, Lock, User, Info, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import useChannel from '@/hooks/use-channel';
import useGroup from '@/hooks/use-group';
import useChat from '@/hooks/use-chat';
import useRoomTitle from '@/hooks/use-room-title';

interface ChatHeaderProps {
    roomId: string;
    roomType: 'channel' | 'group' | 'dm';
    isRoomDetailsOpen: boolean;
    setIsRoomDetailsOpen: (open: boolean) => void;
}

export function ChatHeader({
    roomId,
    roomType,
    isRoomDetailsOpen,
    setIsRoomDetailsOpen
}: ChatHeaderProps) {
    // Fetch room data based on room type
    const channelResult = useChannel(roomType === 'channel' ? roomId : '');
    const groupResult = useGroup(roomType === 'group' ? roomId : '');
    const chatResult = useChat(roomType === 'dm' ? roomId : '');

    // Get the appropriate room data
    const room =
        roomType === 'channel'
            ? channelResult[0]
            : roomType === 'group'
              ? groupResult[0]
              : chatResult[0];

    // Use the proper room title hook
    const roomTitle = useRoomTitle(room as any, roomType);

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

    const getRoomDescription = () => {
        if (roomType === 'channel' && room && 'description' in room) {
            return (
                room.description ||
                `Welcome to #${roomTitle}! This is where the team collaborates.`
            );
        }
        return null;
    };

    const getMemberCount = () => {
        if (room && 'memberIds' in room && Array.isArray(room.memberIds)) {
            return room.memberIds.length;
        }
        return 0;
    };

    const Icon = getRoomIcon();

    return (
        <div className="flex items-center justify-between p-4 border-b border-border bg-background">
            <div className="flex items-center gap-3">
                {roomType === 'dm' ? (
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-sm">
                            {roomTitle?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                ) : (
                    <Icon className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                    <h1 className="font-semibold text-lg">{roomTitle}</h1>
                    {roomType === 'channel' && (
                        <p className="text-sm text-muted-foreground">
                            {getRoomDescription()}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                {roomType !== 'dm' && (
                    <Button variant="ghost" size="sm">
                        <Users className="h-4 w-4 mr-1" />
                        <span className="text-sm">{getMemberCount()}</span>
                    </Button>
                )}

                {/* <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                </Button> */}

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsRoomDetailsOpen(!isRoomDetailsOpen)}
                    className={`transition-all duration-200 ${
                        isRoomDetailsOpen
                            ? 'bg-muted text-foreground shadow-sm'
                            : 'hover:bg-muted'
                    }`}
                    title={
                        isRoomDetailsOpen
                            ? 'Hide room details'
                            : 'Show room details'
                    }
                >
                    <Info
                        className={`h-4 w-4 transition-transform duration-200 ${
                            isRoomDetailsOpen ? 'rotate-180' : ''
                        }`}
                    />
                </Button>
            </div>
        </div>
    );
}
