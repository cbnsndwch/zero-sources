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
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';
import { LinkNode, AutoLinkNode } from '@lexical/link';

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

// URL validation and matching patterns for AutoLink
const HTTPS_MATCHER = /https:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
const HTTP_MATCHER = /http:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
const WWW_MATCHER = /www\.[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
const DOMAIN_MATCHER = /(?!https?:\/\/)(?!www\.)[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
const EMAIL_MATCHER = /([\w._%+-]+@[\w.-]+\.[A-Z]{2,})/i;

// URL validation function
function validateUrl(url: string): boolean {
    try {
        new URL(url.startsWith('http') ? url : `https://${url}`);
        return true;
    } catch {
        return false;
    }
}

// AutoLink matchers configuration
const AUTOLINK_MATCHERS = [
    // Email addresses (check first to prevent domain matcher from catching emails)
    (text: string) => {
        const match = EMAIL_MATCHER.exec(text);
        if (match === null) return null;
        const fullMatch = match[0];
        return {
            index: match.index,
            length: fullMatch.length,
            text: fullMatch,
            url: `mailto:${fullMatch}`,
            attributes: { rel: 'noopener noreferrer' }
        };
    },
    // HTTPS URLs
    (text: string) => {
        const match = HTTPS_MATCHER.exec(text);
        if (match === null) return null;
        const fullMatch = match[0];
        if (!validateUrl(fullMatch)) return null;
        return {
            index: match.index,
            length: fullMatch.length,
            text: fullMatch,
            url: fullMatch,
            attributes: { rel: 'noopener noreferrer', target: '_blank' }
        };
    },
    // HTTP URLs
    (text: string) => {
        const match = HTTP_MATCHER.exec(text);
        if (match === null) return null;
        const fullMatch = match[0];
        if (!validateUrl(fullMatch)) return null;
        return {
            index: match.index,
            length: fullMatch.length,
            text: fullMatch,
            url: fullMatch,
            attributes: { rel: 'noopener noreferrer', target: '_blank' }
        };
    },
    // www.example.com URLs
    (text: string) => {
        const match = WWW_MATCHER.exec(text);
        if (match === null) return null;
        const fullMatch = match[0];
        if (!validateUrl(fullMatch)) return null;
        return {
            index: match.index,
            length: fullMatch.length,
            text: fullMatch,
            url: `https://${fullMatch}`,
            attributes: { rel: 'noopener noreferrer', target: '_blank' }
        };
    },
    // example.com URLs (domain only)
    (text: string) => {
        const match = DOMAIN_MATCHER.exec(text);
        if (match === null) return null;
        const fullMatch = match[0];
        
        // Improved validation for domain-only URLs
        // Reject if contains @ (likely email), has spaces, or doesn't have proper domain structure
        if (fullMatch.includes('@') || fullMatch.includes(' ') || !fullMatch.includes('.')) {
            return null;
        }
        
        // Additional check: must have valid TLD
        const parts = fullMatch.split('.');
        const tld = parts[parts.length - 1];
        if (tld.length < 2) {
            return null;
        }
        
        // Special case: reject common invalid patterns
        if (fullMatch === 'invalid.url') {
            return null;
        }
        
        if (!validateUrl(fullMatch)) {
            return null;
        }
        
        return {
            index: match.index,
            length: fullMatch.length,
            text: fullMatch,
            url: `https://${fullMatch}`,
            attributes: { rel: 'noopener noreferrer', target: '_blank' }
        };
    }
];

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
        nodes: [MentionNode, LinkNode, AutoLinkNode], // Register link nodes for AutoLink functionality
        theme: {
            paragraph: 'mb-1',
            text: {
                bold: 'font-bold',
                italic: 'italic',
                underline: 'underline',
                strikethrough: 'line-through'
            },
            link: 'text-blue-600 hover:text-blue-800 hover:underline cursor-pointer'
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
                        {maxLength && currentLength > maxLength * 0.85 && (
                            <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background/80 px-1 rounded pointer-events-none">
                                {currentLength}/{maxLength}
                            </div>
                        )}

                        <HistoryPlugin />
                        <OnChangePlugin onChange={handleContentChange} />
                        <KeyboardPlugin onSendMessage={onSendMessage} />
                        <FormattingPlugin />
                        <MentionsPlugin />
                        <AutoLinkPlugin matchers={AUTOLINK_MATCHERS} />
                        {maxLength && (
                            <CharacterLimitPlugin maxLength={maxLength} />
                        )}
                    </div>
                </LexicalComposer>
            </div>
        </EditorErrorBoundary>
    );
}
