import React from 'react';
import { vi } from 'vitest';

// Create a mock editor class that provides all the methods expected by Lexical
export class MockLexicalEditor {
    registerRootListener = vi.fn(() => () => {});
    registerNodeTransform = vi.fn(() => () => {});
    registerCommand = vi.fn(() => () => {});
    registerUpdateListener = vi.fn(() => () => {});
    dispatchCommand = vi.fn();
    getEditorState = vi.fn(() => ({
        toJSON: () => ({ root: { type: 'root', children: [] } }),
        read: (fn: Function) => fn()
    }));
    update = vi.fn((fn: Function) => fn());
    setEditable = vi.fn();
    isEditable = vi.fn(() => true);
    toJSON = vi.fn(() => ({ root: { type: 'root', children: [] } }));
}

// Create a provider component for tests
export const TestLexicalComposer = ({
    children
}: {
    children: React.ReactNode;
}) => {
    return <div data-testid="lexical-composer">{children}</div>;
};

// Setup all Lexical mocks
export function setupLexicalMocks() {
    const mockEditor = new MockLexicalEditor();

    // Mock the composer context
    vi.mock('@lexical/react/LexicalComposerContext', () => ({
        useLexicalComposerContext: () => [mockEditor],
        LexicalComposerContext: {
            Provider: ({ children }: any) => children
        }
    }));

    // Mock the composer
    vi.mock('@lexical/react/LexicalComposer', () => ({
        LexicalComposer: ({ children, initialConfig }: any) => {
            // Simulate the initialization process
            if (initialConfig.onError) {
                // Don't trigger error in test environment
            }
            return <TestLexicalComposer>{children}</TestLexicalComposer>;
        }
    }));

    // Mock plugins
    vi.mock('@lexical/react/LexicalRichTextPlugin', () => ({
        RichTextPlugin: ({ contentEditable, ErrorBoundary }: any) => (
            <div data-testid="rich-text-plugin">
                {typeof contentEditable === 'function'
                    ? contentEditable()
                    : contentEditable}
                {typeof ErrorBoundary === 'function' ? (
                    <ErrorBoundary />
                ) : (
                    ErrorBoundary
                )}
            </div>
        )
    }));

    vi.mock('@lexical/react/LexicalContentEditable', () => ({
        ContentEditable: ({ placeholder, className }: any) => (
            <div
                data-testid="content-editable"
                className={className}
                role="textbox"
                contentEditable
                suppressContentEditableWarning
            >
                {placeholder}
            </div>
        )
    }));

    vi.mock('@lexical/react/LexicalHistoryPlugin', () => ({
        HistoryPlugin: () => <div data-testid="history-plugin" />
    }));

    vi.mock('@lexical/react/LexicalOnChangePlugin', () => ({
        OnChangePlugin: ({ onChange }: any) => {
            // Simulate initial onChange
            React.useEffect(() => {
                if (onChange) {
                    onChange({
                        toJSON: () => ({
                            root: { type: 'root', children: [] }
                        }),
                        read: (fn: Function) => fn()
                    });
                }
            }, [onChange]);
            return <div data-testid="onchange-plugin" />;
        }
    }));

    vi.mock('@lexical/react/LexicalErrorBoundary', () => ({
        LexicalErrorBoundary: ({ children }: any) => (
            <div data-testid="error-boundary">{children}</div>
        )
    }));

    // Mock lexical core
    vi.mock('lexical', () => ({
        $getRoot: vi.fn(() => ({
            getTextContent: () => '',
            clear: () => {},
            getChildren: () => []
        })),
        $getSelection: vi.fn(() => null),
        $isRangeSelection: vi.fn(() => false),
        $createParagraphNode: vi.fn(() => ({
            type: 'paragraph',
            children: []
        })),
        FORMAT_TEXT_COMMAND: 'FORMAT_TEXT_COMMAND',
        KEY_DOWN_COMMAND: 'KEY_DOWN_COMMAND',
        COMMAND_PRIORITY_NORMAL: 1,
        RootNode: class RootNode {},
        ParagraphNode: class ParagraphNode {},
        TextNode: class TextNode {},
        DecoratorNode: class DecoratorNode {},
        EditorState: class EditorState {
            toJSON() {
                return { root: { type: 'root', children: [] } };
            }
            read(fn: Function) {
                fn();
            }
        }
    }));

    // Mock custom nodes
    vi.mock('./nodes/MentionNode', () => ({
        MentionNode: class MentionNode {}
    }));

    // Mock custom plugins - these are used by RichMessageEditor tests
    vi.mock('./plugins/MentionsPlugin', () => ({
        MentionsPlugin: () => null
    }));

    vi.mock('./plugins/ClipboardPlugin', () => ({
        ClipboardPlugin: () => null
    }));

    // Mock serialization utils
    vi.mock('./serialization-utils', () => ({
        validateSerializedEditorState: () => true,
        ensureValidSerializedEditorState: (state: any) =>
            state || { root: { type: 'root', children: [] } }
    }));

    return mockEditor;
}
