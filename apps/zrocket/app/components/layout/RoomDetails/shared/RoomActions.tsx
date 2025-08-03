import { Archive } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface RoomActionsProps {
    roomType: 'dm' | 'group' | 'channel';
}

export function RoomActions({ roomType }: RoomActionsProps) {
    return (
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
    );
}
