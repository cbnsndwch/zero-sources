import { useCallback, useState, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection } from 'lexical';
import { Bold, Italic, Underline, Strikethrough } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { toggleTextFormat, isFormatActive } from '../formatting-utils';
import type { TextFormatType } from '../types';

interface FormattingToolbarProps {
    disabled?: boolean;
}

export function FormattingToolbar({ disabled = false }: FormattingToolbarProps) {
    const [editor] = useLexicalComposerContext();
    const [activeFormats, setActiveFormats] = useState<Set<TextFormatType>>(new Set());

    // Update active formats when selection changes
    const updateActiveFormats = useCallback(() => {
        try {
            editor.getEditorState().read(() => {
                const selection = $getSelection();
                const newActiveFormats = new Set<TextFormatType>();

                if ($isRangeSelection(selection)) {
                    if (selection.hasFormat('bold')) newActiveFormats.add('bold');
                    if (selection.hasFormat('italic')) newActiveFormats.add('italic');
                    if (selection.hasFormat('underline')) newActiveFormats.add('underline');
                    if (selection.hasFormat('strikethrough')) newActiveFormats.add('strikethrough');
                }

                setActiveFormats(newActiveFormats);
            });
        } catch (error) {
            // In test environment or when editor is not properly initialized, fail silently
            console.debug('FormattingToolbar: Unable to update active formats', error);
        }
    }, [editor]);

    // Listen for editor state changes to update active formats
    useEffect(() => {
        // Handle test environment where registerUpdateListener might not exist
        if (typeof editor.registerUpdateListener === 'function') {
            return editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    updateActiveFormats();
                });
            });
        } else {
            // In test environment, just update once on mount
            updateActiveFormats();
        }
    }, [editor, updateActiveFormats]);

    // Handle format button clicks
    const handleFormatClick = useCallback((formatType: TextFormatType) => {
        if (!disabled) {
            toggleTextFormat(editor, formatType);
        }
    }, [editor, disabled]);

    const formatButtons: Array<{
        type: TextFormatType;
        icon: typeof Bold;
        label: string;
        shortcut: string;
    }> = [
        { type: 'bold', icon: Bold, label: 'Bold', shortcut: 'Ctrl+B' },
        { type: 'italic', icon: Italic, label: 'Italic', shortcut: 'Ctrl+I' },
        { type: 'underline', icon: Underline, label: 'Underline', shortcut: 'Ctrl+U' },
        { type: 'strikethrough', icon: Strikethrough, label: 'Strikethrough', shortcut: 'Ctrl+Shift+S' }
    ];

    return (
        <div className="flex gap-1 p-2 border-b border-input bg-muted/20">
            {formatButtons.map(({ type, icon: Icon, label, shortcut }) => {
                const isActive = activeFormats.has(type);
                return (
                    <Button
                        key={type}
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className={`h-8 w-8 p-0 ${isActive ? 'bg-primary text-primary-foreground' : ''}`}
                        onClick={() => handleFormatClick(type)}
                        disabled={disabled}
                        title={`${label} (${shortcut})`}
                        data-testid={`format-${type}`}
                    >
                        <Icon size={14} />
                    </Button>
                );
            })}
        </div>
    );
}