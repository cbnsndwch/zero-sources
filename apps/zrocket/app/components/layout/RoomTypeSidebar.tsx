import { MessageSquare, Hash, Lock } from 'lucide-react';
// import { Star, Archive } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent
} from '@/components/ui/tooltip';

import type { RoomType } from '@/utils/room-preferences';
import { cn } from '@/lib/utils';

const roomTypes = [
    // {
    //     id: 'threads' as RoomType,
    //     name: 'Threads',
    //     Icon: MessageSquare
    // },
    {
        id: 'dms' as RoomType,
        name: 'DMs',
        Icon: MessageSquare
    },
    {
        id: 'channels' as RoomType,
        name: 'Channels',
        Icon: Hash
    },
    {
        id: 'groups' as RoomType,
        name: 'Private Groups',
        Icon: Lock
    }
    // {
    //     id: 'starred' as RoomType,
    //     name: 'Starred',
    //     Icon: Star
    // },
    // {
    //     id: 'archived' as RoomType,
    //     name: 'Archive',
    //     Icon: Archive
    // }
] as const;

type RoomTypeItem = (typeof roomTypes)[number];

interface RoomTypeSidebarProps {
    activeRoomType: RoomType;
    setActiveRoomType: (type: RoomType) => void;
}

export function RoomTypeSidebar({
    activeRoomType,
    setActiveRoomType
}: RoomTypeSidebarProps) {
    return (
        <div className="w-16 bg-muted/30 border-r border-border flex flex-col items-center py-3 space-y-1">
            {roomTypes.map(item => (
                <RoomTypeButton
                    key={item.id}
                    activeRoomType={activeRoomType}
                    setActiveRoomType={setActiveRoomType}
                    {...item}
                />
            ))}
        </div>
    );
}

type RoomTypeButtonProps = RoomTypeItem & RoomTypeSidebarProps;

function RoomTypeButton({
    id,
    name,
    Icon,
    activeRoomType,
    setActiveRoomType
}: RoomTypeButtonProps) {
    return (
        <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
                <Button
                    key={id}
                    variant="ghost"
                    size="icon"
                    className={cn(
                        `h-8 w-8 rounded-lg transition-colors cursor-pointer`,
                        activeRoomType === id
                            ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                    onClick={() => setActiveRoomType(id)}
                    title={name}
                >
                    <Icon className="h-4 w-4" />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
                <span>{name}</span>
            </TooltipContent>
        </Tooltip>
    );
}
