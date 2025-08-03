import type { SerializedEditorState } from 'lexical';

// Re-export serialization utilities for external use
export {
    validateSerializedEditorState,
    createEmptySerializedEditorState,
    ensureValidSerializedEditorState,
    type ValidSerializedEditorState
} from './serialization-utils';

// Re-export formatting utilities for external use
export {
    toggleTextFormat,
    isFormatActive,
    getActiveFormats,
    getFormattingShortcut,
    FORMATTING_SHORTCUTS
} from './formatting-utils';

/**
 * Text formatting types supported by the editor
 */
export type TextFormatType = 'bold' | 'italic' | 'underline' | 'strikethrough';

/**
 * Props for the RichMessageEditor component
 */
export interface RichMessageEditorProps {
    /**
     * Callback function called when a message should be sent
     * @param content - The serialized editor state containing the message content
     */
    onSendMessage: (content: SerializedEditorState) => void;

    /**
     * Placeholder text to display when the editor is empty
     * @default "Type a message..."
     */
    placeholder?: string;

    /**
     * Initial content to populate the editor with
     */
    initialContent?: SerializedEditorState;

    /**
     * Whether the editor is disabled and cannot be interacted with
     * @default false
     */
    disabled?: boolean;

    /**
     * Maximum number of characters allowed in the editor
     */
    maxLength?: number;
}

/**
 * Props for the error boundary component
 */
export interface EditorErrorBoundaryProps {
    children: React.ReactNode;
    onError?: (error: Error) => void;
}

/**
 * State for the error boundary component
 */
export interface EditorErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}
