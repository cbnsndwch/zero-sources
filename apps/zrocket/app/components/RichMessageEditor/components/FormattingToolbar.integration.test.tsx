import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $getRoot,
    $createTextNode,
    $createParagraphNode,
    TextNode,
    ParagraphNode,
    RootNode
} from 'lexical';
import React, { useEffect } from 'react';

import { FormattingToolbar } from './FormattingToolbar';

// Test-specific component to set up text for formatting tests
function TestEditorSetup({
    initialText = 'Test text'
}: {
    initialText?: string;
}) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        editor.update(() => {
            const root = $getRoot();
            root.clear();

            const paragraph = $createParagraphNode();
            const textNode = $createTextNode(initialText);
            paragraph.append(textNode);
            root.append(paragraph);

            // Select the text node for formatting tests
            textNode.select();
        });
    }, [editor, initialText]);

    return null;
}

// Custom wrapper that provides real Lexical composer
function LexicalTestWrapper({
    children,
    initialText
}: {
    children: React.ReactNode;
    initialText?: string;
}) {
    const initialConfig = {
        namespace: 'FormattingToolbarTest',
        nodes: [RootNode, TextNode, ParagraphNode],
        onError: (error: Error) => {
            console.error('Lexical error in test:', error);
        },
        theme: {
            text: {
                bold: 'font-bold',
                italic: 'italic',
                underline: 'underline',
                strikethrough: 'line-through'
            }
        }
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div data-testid="lexical-editor">
                <FormattingToolbar />
                <RichTextPlugin
                    contentEditable={
                        <ContentEditable
                            data-testid="content-editable"
                            style={{
                                minHeight: '100px',
                                padding: '8px',
                                border: '1px solid #ccc'
                            }}
                        />
                    }
                    placeholder={<div>Type something...</div>}
                    ErrorBoundary={LexicalErrorBoundary}
                />
                <HistoryPlugin />
                {initialText && <TestEditorSetup initialText={initialText} />}
                {children}
            </div>
        </LexicalComposer>
    );
}

describe('FormattingToolbar - Integration Tests', () => {
    beforeEach(() => {
        // Clear any previous state
        document.body.innerHTML = '';
    });

    it('renders formatting toolbar with real Lexical composer', async () => {
        render(
            <LexicalTestWrapper>
                <div />
            </LexicalTestWrapper>
        );

        // Wait for the component to fully render
        await waitFor(() => {
            expect(screen.getByTestId('lexical-editor')).toBeInTheDocument();
        });

        // Check that all formatting buttons are rendered
        expect(screen.getByTestId('format-bold')).toBeInTheDocument();
        expect(screen.getByTestId('format-italic')).toBeInTheDocument();
        expect(screen.getByTestId('format-underline')).toBeInTheDocument();
        expect(screen.getByTestId('format-strikethrough')).toBeInTheDocument();
    });

    it('shows correct button titles and icons', async () => {
        render(
            <LexicalTestWrapper>
                <div />
            </LexicalTestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByTestId('format-bold')).toBeInTheDocument();
        });

        // Check button titles (tooltips)
        expect(screen.getByTestId('format-bold')).toHaveAttribute(
            'title',
            'Bold (Ctrl+B)'
        );
        expect(screen.getByTestId('format-italic')).toHaveAttribute(
            'title',
            'Italic (Ctrl+I)'
        );
        expect(screen.getByTestId('format-underline')).toHaveAttribute(
            'title',
            'Underline (Ctrl+U)'
        );
        expect(screen.getByTestId('format-strikethrough')).toHaveAttribute(
            'title',
            'Strikethrough (Ctrl+Shift+S)'
        );
    });

    it('buttons can be clicked without errors', async () => {
        render(
            <LexicalTestWrapper initialText="Test text for formatting">
                <div />
            </LexicalTestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByTestId('format-bold')).toBeInTheDocument();
        });

        const boldButton = screen.getByTestId('format-bold');
        const italicButton = screen.getByTestId('format-italic');
        const underlineButton = screen.getByTestId('format-underline');
        const strikethroughButton = screen.getByTestId('format-strikethrough');

        // These clicks should not throw errors
        expect(() => {
            fireEvent.click(boldButton);
            fireEvent.click(italicButton);
            fireEvent.click(underlineButton);
            fireEvent.click(strikethroughButton);
        }).not.toThrow();

        // Buttons should still be in the document after clicking
        expect(boldButton).toBeInTheDocument();
        expect(italicButton).toBeInTheDocument();
        expect(underlineButton).toBeInTheDocument();
        expect(strikethroughButton).toBeInTheDocument();
    });

    it('disabled prop disables all buttons', async () => {
        render(
            <LexicalComposer
                initialConfig={{
                    namespace: 'DisabledTest',
                    nodes: [RootNode, TextNode, ParagraphNode],
                    onError: () => {}
                }}
            >
                <FormattingToolbar disabled={true} />
            </LexicalComposer>
        );

        await waitFor(() => {
            expect(screen.getByTestId('format-bold')).toBeInTheDocument();
        });

        expect(screen.getByTestId('format-bold')).toBeDisabled();
        expect(screen.getByTestId('format-italic')).toBeDisabled();
        expect(screen.getByTestId('format-underline')).toBeDisabled();
        expect(screen.getByTestId('format-strikethrough')).toBeDisabled();
    });

    it('toolbar has correct CSS classes', async () => {
        render(
            <LexicalTestWrapper>
                <div />
            </LexicalTestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByTestId('format-bold')).toBeInTheDocument();
        });

        // Find the toolbar container
        const toolbar = screen.getByTestId('format-bold').closest('div');
        expect(toolbar).toHaveClass('flex', 'gap-0.5', 'px-2', 'pt-2');
    });

    it('buttons have correct styling states', async () => {
        render(
            <LexicalTestWrapper>
                <div />
            </LexicalTestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByTestId('format-bold')).toBeInTheDocument();
        });

        const boldButton = screen.getByTestId('format-bold');

        // Initially, buttons should have ghost variant (not active)
        expect(boldButton).toHaveAttribute('data-variant', 'ghost');
        expect(boldButton).toHaveAttribute('data-size', 'sm');
    });

    it('integrates with ContentEditable without errors', async () => {
        render(
            <LexicalTestWrapper initialText="Sample text">
                <div />
            </LexicalTestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByTestId('content-editable')).toBeInTheDocument();
            expect(screen.getByTestId('format-bold')).toBeInTheDocument();
        });

        const editor = screen.getByTestId('content-editable');
        const boldButton = screen.getByTestId('format-bold');

        // Focus the editor
        fireEvent.focus(editor);

        // Click formatting button
        fireEvent.click(boldButton);

        // Should not cause any errors - the editor and toolbar should work together
        expect(editor).toBeInTheDocument();
        expect(boldButton).toBeInTheDocument();
    });

    it('handles rapid button clicks without errors', async () => {
        render(
            <LexicalTestWrapper initialText="Test text">
                <div />
            </LexicalTestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByTestId('format-bold')).toBeInTheDocument();
        });

        const boldButton = screen.getByTestId('format-bold');

        // Rapidly click the button multiple times
        for (let i = 0; i < 5; i++) {
            fireEvent.click(boldButton);
        }

        // Should not cause any errors
        expect(boldButton).toBeInTheDocument();
    });

    it('toolbar persists after editor state changes', async () => {
        let editorRef: any = null;

        function EditorReference() {
            const [editor] = useLexicalComposerContext();
            editorRef = editor;
            return null;
        }

        render(
            <LexicalTestWrapper>
                <EditorReference />
            </LexicalTestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByTestId('format-bold')).toBeInTheDocument();
            expect(editorRef).not.toBeNull();
        });

        // Simulate editor state change
        await waitFor(() => {
            if (editorRef) {
                editorRef.update(() => {
                    const root = $getRoot();
                    root.clear();
                    const paragraph = $createParagraphNode();
                    const textNode = $createTextNode('New content');
                    paragraph.append(textNode);
                    root.append(paragraph);
                });
            }
        });

        // Toolbar should still be present after state change
        expect(screen.getByTestId('format-bold')).toBeInTheDocument();
        expect(screen.getByTestId('format-italic')).toBeInTheDocument();
        expect(screen.getByTestId('format-underline')).toBeInTheDocument();
        expect(screen.getByTestId('format-strikethrough')).toBeInTheDocument();
    });
});
