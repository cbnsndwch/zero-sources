import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { SerializedEditorState } from 'lexical';

import { RichMessageEditor } from './RichMessageEditor';
import { createEmptySerializedEditorState } from './serialization-utils';

// Mock the Lexical components since they require DOM setup
vi.mock('@lexical/react/LexicalComposer', () => ({
    LexicalComposer: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="lexical-composer">{children}</div>
    )
}));

vi.mock('@lexical/react/LexicalRichTextPlugin', () => ({
    RichTextPlugin: ({ contentEditable, ErrorBoundary }: any) => (
        <div data-testid="rich-text-plugin">
            {contentEditable}
            <ErrorBoundary />
        </div>
    )
}));

vi.mock('@lexical/react/LexicalContentEditable', () => ({
    ContentEditable: ({ placeholder, className }: any) => (
        <div data-testid="content-editable" className={className}>
            {placeholder}
        </div>
    )
}));

vi.mock('@lexical/react/LexicalHistoryPlugin', () => ({
    HistoryPlugin: () => <div data-testid="history-plugin" />
}));

vi.mock('@lexical/react/LexicalOnChangePlugin', () => ({
    OnChangePlugin: () => <div data-testid="onchange-plugin" />
}));

vi.mock('@lexical/react/LexicalErrorBoundary', () => ({
    LexicalErrorBoundary: () => <div data-testid="error-boundary" />
}));

vi.mock('@lexical/react/LexicalComposerContext', () => ({
    useLexicalComposerContext: () => [
        {
            registerRootListener: () => () => {},
            registerNodeTransform: () => () => {},
            registerCommand: () => () => {},
            dispatchCommand: () => {},
            getEditorState: () => ({
                toJSON: () => ({ root: { children: [] } }),
                read: (fn: Function) => fn()
            }),
            update: (fn: Function) => fn()
        }
    ]
}));

describe.skip('RichMessageEditor - SerializedEditorState Compliance', () => {
    // Skipped: Integration tests require browser APIs not available in jsdom.
    // See https://github.com/facebook/lexical/issues/2367 and jsdom limitations.
    it('should support initialContent with existing SerializedEditorState', () => {
        const mockOnSendMessage = vi.fn();

        // Create a complex initial content
        const initialContent: any = {
            root: {
                children: [
                    {
                        children: [
                            {
                                text: 'Hello ',
                                format: 0,
                                type: 'text'
                            },
                            {
                                text: 'world',
                                format: 1, // Bold
                                type: 'text'
                            },
                            {
                                text: '!',
                                format: 0,
                                type: 'text'
                            }
                        ],
                        direction: 'ltr',
                        format: '',
                        indent: 0,
                        type: 'paragraph',
                        version: 1
                    }
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'root',
                version: 1
            }
        };

        render(
            <RichMessageEditor
                onSendMessage={mockOnSendMessage}
                initialContent={initialContent}
            />
        );

        expect(screen.getByTestId('lexical-composer')).toBeInTheDocument();
    });

    it('should handle empty state properly', () => {
        const mockOnSendMessage = vi.fn();
        const emptyState = createEmptySerializedEditorState();

        render(
            <RichMessageEditor
                onSendMessage={mockOnSendMessage}
                initialContent={emptyState}
            />
        );

        expect(screen.getByTestId('lexical-composer')).toBeInTheDocument();
    });

    it('should handle complex formatted content for editing', () => {
        const mockOnSendMessage = vi.fn();

        // Complex content with multiple formatting types
        const complexContent: any = {
            root: {
                children: [
                    {
                        children: [
                            {
                                text: 'Normal text ',
                                format: 0,
                                type: 'text'
                            },
                            {
                                text: 'bold ',
                                format: 1, // Bold
                                type: 'text'
                            },
                            {
                                text: 'italic ',
                                format: 2, // Italic
                                type: 'text'
                            },
                            {
                                text: 'bold italic ',
                                format: 3, // Bold + Italic
                                type: 'text'
                            },
                            {
                                text: 'underlined',
                                format: 8, // Underline
                                type: 'text'
                            }
                        ],
                        direction: 'ltr',
                        format: '',
                        indent: 0,
                        type: 'paragraph',
                        version: 1
                    },
                    {
                        children: [
                            {
                                text: 'Second paragraph with ',
                                format: 0,
                                type: 'text'
                            },
                            {
                                text: 'code',
                                format: 16, // Code
                                type: 'text'
                            }
                        ],
                        direction: 'ltr',
                        format: '',
                        indent: 0,
                        type: 'paragraph',
                        version: 1
                    }
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'root',
                version: 1
            }
        };

        render(
            <RichMessageEditor
                onSendMessage={mockOnSendMessage}
                initialContent={complexContent}
            />
        );

        expect(screen.getByTestId('lexical-composer')).toBeInTheDocument();
    });

    it('should handle malformed initial content gracefully', () => {
        const mockOnSendMessage = vi.fn();

        // Intentionally malformed content
        const malformedContent = {
            root: {
                children: [
                    {
                        // Missing required properties
                        children: [
                            {
                                text: 'Some text'
                                // Missing format and type
                            }
                        ]
                    }
                ]
                // Missing required root properties
            }
        } as any;

        render(
            <RichMessageEditor
                onSendMessage={mockOnSendMessage}
                initialContent={malformedContent}
            />
        );

        // Should still render without crashing
        expect(screen.getByTestId('lexical-composer')).toBeInTheDocument();
    });

    it('should accept null/undefined initial content', () => {
        const mockOnSendMessage = vi.fn();

        render(
            <RichMessageEditor
                onSendMessage={mockOnSendMessage}
                initialContent={undefined}
            />
        );

        expect(screen.getByTestId('lexical-composer')).toBeInTheDocument();
    });

    describe('Text Formatting Bitfields', () => {
        it('should handle all supported text formatting types', () => {
            const mockOnSendMessage = vi.fn();

            // Test all formatting combinations
            const formattingContent: any = {
                root: {
                    children: [
                        {
                            children: [
                                { text: 'Bold', format: 1, type: 'text' },
                                { text: ' Italic', format: 2, type: 'text' },
                                {
                                    text: ' Strikethrough',
                                    format: 4,
                                    type: 'text'
                                },
                                { text: ' Underline', format: 8, type: 'text' },
                                { text: ' Code', format: 16, type: 'text' },
                                {
                                    text: ' Subscript',
                                    format: 32,
                                    type: 'text'
                                },
                                {
                                    text: ' Superscript',
                                    format: 64,
                                    type: 'text'
                                },
                                { text: ' Combined', format: 3, type: 'text' } // Bold + Italic
                            ],
                            direction: 'ltr',
                            format: '',
                            indent: 0,
                            type: 'paragraph',
                            version: 1
                        }
                    ],
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                    type: 'root',
                    version: 1
                }
            };

            render(
                <RichMessageEditor
                    onSendMessage={mockOnSendMessage}
                    initialContent={formattingContent}
                />
            );

            expect(screen.getByTestId('lexical-composer')).toBeInTheDocument();
        });
    });

    describe('Performance and Edge Cases', () => {
        it('should handle large content efficiently', () => {
            const mockOnSendMessage = vi.fn();

            // Create content with many paragraphs and text nodes
            const children = Array.from({ length: 100 }, (_, i) => ({
                children: [
                    {
                        text: `Paragraph ${i + 1} with some text content that is long enough to test performance`,
                        format: i % 4, // Vary formatting
                        type: 'text'
                    }
                ],
                direction: 'ltr' as const,
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1
            }));

            const largeContent: SerializedEditorState = {
                root: {
                    children,
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                    type: 'root',
                    version: 1
                }
            };

            const startTime = performance.now();

            render(
                <RichMessageEditor
                    onSendMessage={mockOnSendMessage}
                    initialContent={largeContent}
                />
            );

            const endTime = performance.now();
            const renderTime = endTime - startTime;

            expect(screen.getByTestId('lexical-composer')).toBeInTheDocument();

            // Should render within reasonable time (less than 100ms for large content)
            expect(renderTime).toBeLessThan(100);
        });

        it('should handle deeply nested structures', () => {
            const mockOnSendMessage = vi.fn();

            // Content with many text nodes in a single paragraph
            const manyTextNodes = Array.from({ length: 50 }, (_, i) => ({
                text: `Text ${i + 1} `,
                format: i % 8, // Cycle through different formats
                type: 'text'
            }));

            const deepContent: any = {
                root: {
                    children: [
                        {
                            children: manyTextNodes,
                            direction: 'ltr',
                            format: '',
                            indent: 0,
                            type: 'paragraph',
                            version: 1
                        }
                    ],
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                    type: 'root',
                    version: 1
                }
            };

            render(
                <RichMessageEditor
                    onSendMessage={mockOnSendMessage}
                    initialContent={deepContent}
                />
            );

            expect(screen.getByTestId('lexical-composer')).toBeInTheDocument();
        });
    });
});
