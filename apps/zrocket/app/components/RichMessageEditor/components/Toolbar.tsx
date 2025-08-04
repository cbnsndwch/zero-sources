import { useCallback } from 'react';
import { 
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import { 
    List, 
    ListOrdered
} from 'lucide-react';

import { Button } from '@/components/ui/button';

export interface ToolbarProps {
    className?: string;
}

export function Toolbar({ className = '' }: ToolbarProps) {
    const [editor] = useLexicalComposerContext();

    const insertOrderedList = useCallback(() => {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }, [editor]);

    const insertUnorderedList = useCallback(() => {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }, [editor]);

    return (
        <div className={`flex gap-1 p-2 border-b border-border ${className}`}>
            <Button
                variant="ghost"
                size="sm"
                onClick={insertUnorderedList}
                title="Bulleted List (Ctrl+Shift+8)"
                type="button"
                className="h-8 w-8 p-0"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={insertOrderedList}
                title="Numbered List (Ctrl+Shift+7)"
                type="button"
                className="h-8 w-8 p-0"
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
        </div>
    );
}