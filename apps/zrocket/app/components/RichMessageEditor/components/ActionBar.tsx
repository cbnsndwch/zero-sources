import { SendIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

type ActionBarProps = {
    disabled?: boolean;
};

export default function ActionBar({ disabled }: ActionBarProps) {
    return (
        <div
            className="flex items-center justify-between px-2 pb-2"
            id="rich-message-editor-action-bar"
        >
            {/* Left side: Additional actions */}
            <div
                className="flex items-center gap-1"
                id="rich-message-editor-action-buttons"
            >
                <button
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-150 ease-in-out"
                    title="Attach file"
                    disabled={disabled}
                    id="rich-message-editor-attach-btn"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        />
                    </svg>
                </button>
                <button
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-150 ease-in-out"
                    title="Add emoji"
                    disabled={disabled}
                    id="rich-message-editor-emoji-btn"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </button>
                <button
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-150 ease-in-out"
                    title="Mention someone (@)"
                    disabled={disabled}
                    id="rich-message-editor-mention-btn"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                    </svg>
                </button>
            </div>

            {/* Right side: Send indication with better styling */}
            <Button
                id="rich-message-editor-send-indicator"
                disabled={disabled}
                variant={disabled ? 'ghost' : 'default'}
                size="sm"
                className={`h-8 w-8 p-0 transition-all duration-150 ${
                    disabled
                        ? 'hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                        : 'bg-primary text-primary-foreground shadow-sm !cursor-pointer'
                }`}
            >
                <SendIcon />
            </Button>
        </div>
    );
}
