import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import {
    $getRoot,
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_NORMAL,
    FORMAT_TEXT_COMMAND,
    KEY_DOWN_COMMAND,
    RootNode,
    type EditorState,
    type SerializedEditorState,
    type TextFormatType
} from 'lexical';
import { Component, useCallback, useEffect, useRef, useState } from 'react';

import { MentionNode } from './nodes/MentionNode';
import { ClipboardPlugin } from './plugins/ClipboardPlugin';
import { MentionsPlugin } from './plugins/MentionsPlugin';
import {
    ensureValidSerializedEditorState,
    validateSerializedEditorState
} from './serialization-utils';
import type {
    EditorErrorBoundaryProps,
    EditorErrorBoundaryState,
    RichMessageEditorProps
} from './types';
import {
    memoryLeakDetector,
    usePerformanceMonitor
} from './utils/performance-monitor';

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
    onSendMessage,
    onPerformanceUpdate
}: {
    onSendMessage: (content: SerializedEditorState) => void;
    onPerformanceUpdate?: (
        type: 'keystroke' | 'serialization',
        startTime: number
    ) => void;
}) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const keystrokeStart = performance.now();

            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                event.stopPropagation();

                // Get the current editor state and serialize it
                const serializationStart = performance.now();
                const editorState = editor.getEditorState();
                const rawSerializedState = editorState.toJSON();

                // Ensure the serialized state complies with the expected format
                const serializedState =
                    ensureValidSerializedEditorState(rawSerializedState);

                onPerformanceUpdate?.('serialization', serializationStart);

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
            } else {
                // Track keystroke latency for regular typing
                onPerformanceUpdate?.('keystroke', keystrokeStart);
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
    }, [editor, onSendMessage, onPerformanceUpdate]);

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
    maxLength,
    onPaste
}: RichMessageEditorProps) {
    const [currentLength, setCurrentLength] = useState(0);
    const initTimeRef = useRef<number>(0);
    const performanceMonitor = usePerformanceMonitor();

    // Initialize performance monitoring
    useEffect(() => {
        initTimeRef.current = performance.now();

        // Start memory leak detection in development
        if (process.env.NODE_ENV === 'development') {
            memoryLeakDetector.startMonitoring(30000); // Check every 30 seconds
        }

        return () => {
            // Stop memory monitoring on unmount
            if (process.env.NODE_ENV === 'development') {
                memoryLeakDetector.stopMonitoring();
            }
        };
    }, []);

    // Record initialization time once editor is ready
    useEffect(() => {
        if (initTimeRef.current > 0) {
            performanceMonitor.recordInitialization(initTimeRef.current);
            initTimeRef.current = 0; // Reset to avoid multiple recordings
        }
    }, [performanceMonitor]);

    // Handle performance updates from plugins
    const handlePerformanceUpdate = useCallback(
        (type: 'keystroke' | 'serialization', startTime: number) => {
            if (type === 'keystroke') {
                performanceMonitor.recordKeystroke(startTime);
            } else if (type === 'serialization') {
                const textLength = currentLength;
                performanceMonitor.recordSerialization(startTime, textLength);
            }
        },
        [performanceMonitor, currentLength]
    );

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
            ? (() => {
                  const deserializationStart = performance.now();
                  const result = JSON.stringify(initialContent);
                  performanceMonitor.recordDeserialization(
                      deserializationStart,
                      result.length
                  );
                  return result;
              })()
            : undefined,
        editable: !disabled
    };

    // Handle content changes with performance tracking
    const handleContentChange = useCallback(
        (editorState: EditorState) => {
            const changeStart = performance.now();

            editorState.read(() => {
                const root = $getRoot();
                const textContent = root.getTextContent();
                setCurrentLength(textContent.length);
            });

            // Track render performance
            requestAnimationFrame(() => {
                const renderTime = performance.now() - changeStart;
                if (renderTime > 16 && process.env.NODE_ENV === 'development') {
                    console.warn(
                        `⚠️ Content change took ${renderTime.toFixed(2)}ms (>16ms target)`
                    );
                }
            });

            // Periodic memory monitoring
            if (Math.random() < 0.1) {
                // 10% chance to record memory
                performanceMonitor.recordMemoryUsage();
            }
        },
        [performanceMonitor]
    );

    // Handle paste events
    const handlePaste = useCallback(
        (content: { html?: string; text?: string; nodes?: any[] }) => {
            if (process.env.NODE_ENV === 'development') {
                console.log('Content pasted:', content);
            }
            onPaste?.(content);
        },
        [onPaste]
    );

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
                        <KeyboardPlugin
                            onSendMessage={onSendMessage}
                            onPerformanceUpdate={handlePerformanceUpdate}
                        />
                        <FormattingPlugin />
                        <MentionsPlugin />
                        <ClipboardPlugin
                            preserveFormatting={true}
                            maxPasteLength={maxLength}
                            onPaste={handlePaste}
                        />
                        {maxLength && (
                            <CharacterLimitPlugin maxLength={maxLength} />
                        )}
                    </div>
                </LexicalComposer>
            </div>
        </EditorErrorBoundary>
    );
}
