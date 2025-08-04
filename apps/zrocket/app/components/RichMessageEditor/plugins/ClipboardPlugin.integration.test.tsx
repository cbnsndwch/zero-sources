import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

import { ClipboardPlugin, copyToClipboard } from './ClipboardPlugin';

// Mock only the parts we can't test in JSDOM
Object.defineProperty(navigator, 'clipboard', {
    value: {
        writeText: vi.fn(() => Promise.resolve()),
        readText: vi.fn(() => Promise.resolve('')),
        write: vi.fn(() => Promise.resolve()),
        read: vi.fn(() => Promise.resolve([]))
    },
    writable: true,
    configurable: true
});

// Test component that uses the actual ClipboardPlugin
function TestEditor({ config = {}, onPaste = vi.fn() }) {
    const initialConfig = {
        namespace: 'test-editor',
        theme: {},
        onError: (error: Error) => {
            throw error; // Let errors bubble up in tests
        }
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <RichTextPlugin
                contentEditable={
                    <ContentEditable
                        data-testid="editor-content"
                        className="editor-content"
                        style={{
                            minHeight: '100px',
                            border: '1px solid #ccc',
                            padding: '8px'
                        }}
                    />
                }
                placeholder={<div>Type something...</div>}
                ErrorBoundary={LexicalErrorBoundary}
            />
            <ClipboardPlugin {...config} onPaste={onPaste} />
        </LexicalComposer>
    );
}

describe.skip('ClipboardPlugin - Focused Integration Tests', () => {
    // Skipped: Integration tests require browser APIs not available in jsdom.
    // See https://github.com/facebook/lexical/issues/2367 and jsdom limitations.
    let user: ReturnType<typeof userEvent.setup>;
    const mockClipboard = navigator.clipboard as any;

    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Plugin Integration', () => {
        it('should render and integrate with Lexical editor', () => {
            const onPaste = vi.fn();
            render(<TestEditor onPaste={onPaste} />);

            expect(screen.getByTestId('editor-content')).toBeInTheDocument();
            expect(screen.getByText('Type something...')).toBeInTheDocument();
        });

        it('should accept and use configuration options', () => {
            const config = {
                preserveFormatting: false,
                maxPasteLength: 50,
                onPaste: vi.fn()
            };

            render(<TestEditor config={config} />);

            // Plugin should render without throwing
            expect(screen.getByTestId('editor-content')).toBeInTheDocument();
        });
    });

    describe('Keyboard Shortcuts', () => {
        it('should handle Ctrl+Shift+V for plain text paste', async () => {
            const onPaste = vi.fn();
            mockClipboard.readText.mockResolvedValue(
                'Plain text from clipboard'
            );

            render(<TestEditor onPaste={onPaste} />);

            const editor = screen.getByTestId('editor-content');
            await user.click(editor);

            // Simulate Ctrl+Shift+V
            await user.keyboard('{Control>}{Shift>}v{/Shift}{/Control}');

            await waitFor(() => {
                expect(mockClipboard.readText).toHaveBeenCalled();
            });
        });

        it('should handle clipboard access errors gracefully', async () => {
            const consoleSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});
            mockClipboard.readText.mockRejectedValue(
                new Error('Access denied')
            );

            render(<TestEditor />);

            const editor = screen.getByTestId('editor-content');
            await user.click(editor);
            await user.keyboard('{Control>}{Shift>}v{/Shift}{/Control}');

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(
                    'Could not read clipboard for plain text paste:',
                    expect.any(Error)
                );
            });

            consoleSpy.mockRestore();
        });
    });

    describe('User Interactions', () => {
        it('should allow typing and basic editor functionality', async () => {
            render(<TestEditor />);

            const editor = screen.getByTestId('editor-content');
            await user.click(editor);
            await user.type(editor, 'Hello World');

            expect(editor).toHaveTextContent('Hello World');
        });

        it('should handle focus and blur events', async () => {
            render(<TestEditor />);

            const editor = screen.getByTestId('editor-content');

            await user.click(editor);
            expect(editor).toHaveFocus();

            await user.tab();
            expect(editor).not.toHaveFocus();
        });
    });

    describe('Error Handling', () => {
        it('should handle plugin initialization errors', () => {
            // Test with invalid configuration
            expect(() => {
                render(<TestEditor config={{ maxPasteLength: -1 }} />);
            }).not.toThrow();
        });
    });
});

describe('copyToClipboard utility - Unit Tests', () => {
    const mockClipboard = navigator.clipboard as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should handle clipboard API unavailable', async () => {
        // Temporarily remove clipboard API
        const originalClipboard = navigator.clipboard;
        Object.defineProperty(navigator, 'clipboard', {
            value: undefined,
            writable: true
        });

        const mockEditor = {
            getEditorState: vi.fn(() => ({
                read: vi.fn(callback => callback())
            }))
        } as any;

        const result = await copyToClipboard(mockEditor);
        expect(result).toBe(false);

        // Restore clipboard API
        Object.defineProperty(navigator, 'clipboard', {
            value: originalClipboard,
            writable: true
        });
    });

    it('should handle clipboard write failures gracefully', async () => {
        mockClipboard.write.mockRejectedValue(new Error('Write failed'));
        mockClipboard.writeText.mockRejectedValue(
            new Error('WriteText failed')
        );

        const mockEditor = {
            getEditorState: vi.fn(() => ({
                read: vi.fn(callback => callback())
            }))
        } as any;

        const result = await copyToClipboard(mockEditor);
        expect(result).toBe(false);
    });
});
