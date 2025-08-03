import { Pin } from 'lucide-react';

export function PinnedMessages() {
    return (
        <div className="space-y-2">
            <h3 className="font-medium text-sm flex items-center gap-2">
                <Pin className="h-4 w-4" />
                Pinned Messages
            </h3>
            <div className="text-sm text-muted-foreground">
                No pinned messages
            </div>
        </div>
    );
}
