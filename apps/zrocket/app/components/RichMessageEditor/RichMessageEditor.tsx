import { Component, useCallback, useEffect, useState } from 'react';
import {
    $getRoot,
    $getSelection,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
    KEY_DOWN_COMMAND,
    COMMAND_PRIORITY_NORMAL,
    RootNode,
    type EditorState,
    type SerializedEditorState,
    type TextFormatType
} from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import type {
    RichMessageEditorProps,
    EditorErrorBoundaryProps,
    EditorErrorBoundaryState
} from './types';
import {
    validateSerializedEditorState,
    ensureValidSerializedEditorState
} from './serialization-utils';
import { MentionNode } from './nodes/MentionNode';
import { MentionsPlugin } from './plugins/MentionsPlugin';

/**
 * Error boundary component to catch and handle Lexical editor errors
 */
class EditorErrorBoundary extends Component<
    EditorErrorBoundaryProps,
    EditorErrorBoundaryState
> {
    constructor(props: EditorErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): EditorErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error) {
        console.error('RichMessageEditor Error:', error);
        this.props.onError?.(error);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 border border-destructive/50 rounded-md bg-destructive/10">
                    <p className="text-sm text-destructive">
                        Something went wrong with the message editor. Please
                        refresh the page.
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Custom plugin to handle keyboard events (Enter to send, Shift+Enter for new lines)
 */
function KeyboardPlugin({
    onSendMessage
}: {
    onSendMessage: (content: SerializedEditorState) => void;
}) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                event.stopPropagation();

                // Get the current editor state and serialize it
                const editorState = editor.getEditorState();
                const rawSerializedState = editorState.toJSON();

                // Ensure the serialized state complies with the expected format
                const serializedState =
                    ensureValidSerializedEditorState(rawSerializedState);

                // Validate the format for debugging (in development)
                if (process.env.NODE_ENV === 'development') {
                    if (!validateSerializedEditorState(serializedState)) {
                        console.warn(
                            'SerializedEditorState validation failed, but proceeding with normalized state'
                        );
                    }
                }

                // Check if the editor has content before sending
                let hasContent = false;
                editorState.read(() => {
                    const root = $getRoot();
                    const textContent = root.getTextContent().trim();
                    hasContent = textContent.length > 0;
                });

                if (hasContent) {
                    onSendMessage(serializedState);

                    // Clear the editor after sending
                    editor.update(() => {
                        const root = $getRoot();
                        root.clear();
                    });
                }
            }
        };

        return editor.registerRootListener((rootElement, prevRootElement) => {
            if (prevRootElement !== null) {
                prevRootElement.removeEventListener('keydown', handleKeyDown);
            }
            if (rootElement !== null) {
                rootElement.addEventListener('keydown', handleKeyDown);
            }
        });
    }, [editor, onSendMessage]);

    return null;
}

/**
 * Plugin to handle text formatting keyboard shortcuts
 */
function FormattingPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        const removeCommandListener = editor.registerCommand(
            KEY_DOWN_COMMAND,
            (event: KeyboardEvent) => {
                const { ctrlKey, metaKey, key, shiftKey } = event;
                const isModifier = ctrlKey || metaKey;

                if (!isModifier) return false;

                let formatType: TextFormatType | null = null;

                switch (key.toLowerCase()) {
                    case 'b':
                        formatType = 'bold';
                        break;
                    case 'i':
                        formatType = 'italic';
                        break;
                    case 'u':
                        formatType = 'underline';
                        break;
                    case 's':
                        if (shiftKey) {
                            formatType = 'strikethrough';
                        }
                        break;
                    default:
                        return false;
                }

                if (formatType) {
                    event.preventDefault();
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, formatType);
                    return true;
                }

                return false;
            },
            COMMAND_PRIORITY_NORMAL
        );

        return removeCommandListener;
    }, [editor]);

    return null;
}

/**
 * Custom plugin to handle character limits
 */
function CharacterLimitPlugin({ maxLength }: { maxLength?: number }) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!maxLength) {
            return;
        }

        return editor.registerNodeTransform(RootNode, rootNode => {
            // Safely check if we're in a valid editor context
            try {
                const textContent = rootNode.getTextContent();
                if (textContent.length > maxLength) {
                    // Prevent the text from exceeding the limit
                    editor.update(() => {
                        const selection = $getSelection();
                        if (selection && $isRangeSelection(selection)) {
                            selection.insertText('');
                        }
                    });
                }
            } catch (error) {
                // In test environment or invalid context, fail silently
                console.debug(
                    'CharacterLimitPlugin: Unable to check text content',
                    error
                );
            }
        });
    }, [editor, maxLength]);

    return null;
}

/**
 * RichMessageEditor component with Lexical editor integration
 */
export function RichMessageEditor({
    onSendMessage,
    placeholder = 'Type a message...',
    initialContent,
    disabled = false,
    maxLength
}: RichMessageEditorProps) {
    const [currentLength, setCurrentLength] = useState(0);

    // Lexical editor configuration
    const initialConfig = {
        namespace: 'RichMessageEditor',
        nodes: [MentionNode], // Register the MentionNode
        theme: {
            paragraph: 'mb-1',
            text: {
                bold: 'font-bold',
                italic: 'italic',
                underline: 'underline',
                strikethrough: 'line-through'
            }
        },
        onError: (error: Error) => {
            console.error('Lexical Editor Error:', error);
        },
        editorState: initialContent
            ? JSON.stringify(initialContent)
            : undefined,
        editable: !disabled
    };

    // Handle content changes
    const handleContentChange = useCallback((editorState: EditorState) => {
        editorState.read(() => {
            const root = $getRoot();
            const textContent = root.getTextContent();
            setCurrentLength(textContent.length);
        });
    }, []);

    return (
        <EditorErrorBoundary>
            <div className="relative">
                <LexicalComposer initialConfig={initialConfig}>
                    <div className="relative border border-input rounded-md bg-background">
                        <RichTextPlugin
                            contentEditable={
                                <ContentEditable
                                    className="min-h-[40px] max-h-32 overflow-y-auto p-3 pr-20 resize-none outline-none"
                                    aria-placeholder={placeholder}
                                    placeholder={
                                        <div className="absolute top-3 left-3 text-muted-foreground pointer-events-none select-none">
                                            {placeholder}
                                        </div>
                                    }
                                />
                            }
                            ErrorBoundary={LexicalErrorBoundary}
                        />

                        {/* Character count display - only show when over 85% of limit */}
                        {maxLength && currentLength > (maxLength * 0.85) && (
                            <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background/80 px-1 rounded pointer-events-none">
                                {currentLength}/{maxLength}
                            </div>
                        )}

                        <HistoryPlugin />
                        <OnChangePlugin onChange={handleContentChange} />
                        <KeyboardPlugin onSendMessage={onSendMessage} />
                        <FormattingPlugin />
                        <MentionsPlugin />
                        {maxLength && (
                            <CharacterLimitPlugin maxLength={maxLength} />
                        )}
                    </div>
                </LexicalComposer>
            </div>
        </EditorErrorBoundary>
    );
}
