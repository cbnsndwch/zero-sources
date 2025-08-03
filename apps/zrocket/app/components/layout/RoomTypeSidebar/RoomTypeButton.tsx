import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import type { RoomTypeItem, RoomTypeSidebarProps } from './contracts';

type RoomTypeButtonProps = RoomTypeItem & RoomTypeSidebarProps;

export default function RoomTypeButton({
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
