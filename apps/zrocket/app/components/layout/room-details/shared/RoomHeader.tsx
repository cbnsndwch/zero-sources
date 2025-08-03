import { Bell, Star, Settings, type LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface RoomHeaderProps {
    title: string;
    Icon: LucideIcon;
}

export function RoomHeader({ title, Icon }: RoomHeaderProps) {
    return (
        <div id="room-header" className="space-y-3">
            <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-semibold text-lg">{title}</h2>
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
    );
}
