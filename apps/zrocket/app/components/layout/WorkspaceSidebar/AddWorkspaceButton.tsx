import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function AddWorkspaceButton() {
    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground mt-2 cursor-pointer"
        >
            <Plus className="h-4 w-4" />
        </Button>
    );
}
