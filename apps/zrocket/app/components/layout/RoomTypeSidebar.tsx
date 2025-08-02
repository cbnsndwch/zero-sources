import { MessageSquare, Hash, Lock, Star, Archive } from 'lucide-react';

import { Button } from '@/components/ui/button';

const roomTypes = [
    {
        id: 'threads',
        name: 'Threads',
        icon: MessageSquare
    },
    {
        id: 'dms',
        name: 'DMs',
        icon: MessageSquare
    },
    {
        id: 'channels',
        name: 'Channels',
        icon: Hash
    },
    {
        id: 'groups',
        name: 'Private Groups',
        icon: Lock
    },
    {
        id: 'starred',
        name: 'Starred',
        icon: Star
    },
    {
        id: 'archived',
        name: 'Archive',
        icon: Archive
    }
];

interface RoomTypeSidebarProps {
    activeRoomType: string;
    setActiveRoomType: (type: string) => void;
}

export function RoomTypeSidebar({
    activeRoomType,
    setActiveRoomType
}: RoomTypeSidebarProps) {
    return (
        <div className="w-16 bg-muted/30 border-r border-border flex flex-col items-center py-3 space-y-1">
            {roomTypes.map(roomType => {
                const Icon = roomType.icon;
                const isActive = activeRoomType === roomType.id;
                return (
                    <Button
                        key={roomType.id}
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-lg transition-colors cursor-pointer ${
                            isActive
                                ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                        onClick={() => setActiveRoomType(roomType.id)}
                        title={roomType.name}
                    >
                        <Icon className="h-4 w-4" />
                    </Button>
                );
            })}
        </div>
    );
}
