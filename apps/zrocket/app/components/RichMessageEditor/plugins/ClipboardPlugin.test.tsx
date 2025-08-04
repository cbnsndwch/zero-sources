import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

import { ClipboardPlugin, copyToClipboard } from './ClipboardPlugin';

// Simple clipboard mock - just enough to test our plugin doesn't crash
const mockClipboard = {
    readText: vi.fn(() => Promise.resolve('mocked clipboard text')),
    writeText: vi.fn(() => Promise.resolve()),
    write: vi.fn(() => Promise.resolve()),
    read: vi.fn(() => Promise.resolve([]))
};

Object.defineProperty(navigator, 'clipboard', {
    value: mockClipboard,
    configurable: true
});

// Simple test component
function TestEditor({ config = {}, onPaste = vi.fn() }) {
    const initialConfig = {
        namespace: 'test-editor',
        theme: {},
        onError: (error: Error) => {
            console.error('Test editor error:', error);
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
                            minHeight: '50px',
                            padding: '8px',
                            border: '1px solid #ccc'
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

describe.skip('ClipboardPlugin', () => {
    // Skipped: Integration tests require browser APIs not available in jsdom.
    // See https://github.com/facebook/lexical/issues/2367 and jsdom limitations.
    beforeEach(() => {
        vi.clearAllMocks();
        mockClipboard.readText.mockResolvedValue('mocked clipboard text');
        mockClipboard.writeText.mockResolvedValue(undefined);
        mockClipboard.write.mockResolvedValue(undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Integration Tests', () => {
        it('should render without errors', () => {
            const onPaste = vi.fn();
            render(<TestEditor onPaste={onPaste} />);

            expect(screen.getByTestId('editor-content')).toBeInTheDocument();
            expect(screen.getByText('Type something...')).toBeInTheDocument();
        });

        it('should accept configuration options', () => {
            const config = {
                preserveFormatting: false,
                maxPasteLength: 100,
                showNotifications: true
            };
            const onPaste = vi.fn();

            expect(() => {
                render(<TestEditor config={config} onPaste={onPaste} />);
            }).not.toThrow();

            expect(screen.getByTestId('editor-content')).toBeInTheDocument();
        });

        it('should handle typing without interference', async () => {
            render(<TestEditor />);

            const editor = screen.getByTestId('editor-content');

            // Click to focus
            fireEvent.click(editor);

            // Type some text
            fireEvent.input(editor, { target: { textContent: 'Test typing' } });

            // Should not throw or cause errors
            expect(editor).toBeInTheDocument();
        });
    });

    describe('Keyboard Shortcuts', () => {
        it('should handle Ctrl+Shift+V without crashing', async () => {
            const onPaste = vi.fn();
            render(<TestEditor onPaste={onPaste} />);

            const editor = screen.getByTestId('editor-content');
            fireEvent.click(editor);

            // Simulate Ctrl+Shift+V - should not crash
            expect(() => {
                fireEvent.keyDown(editor, {
                    key: 'v',
                    ctrlKey: true,
                    shiftKey: true
                });
            }).not.toThrow();

            // Wait for any async operations
            await waitFor(() => {
                expect(mockClipboard.readText).toHaveBeenCalled();
            });
        });

        it('should handle clipboard API errors gracefully', async () => {
            const consoleSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});
            mockClipboard.readText.mockRejectedValue(
                new Error('Access denied')
            );

            render(<TestEditor />);

            const editor = screen.getByTestId('editor-content');
            fireEvent.click(editor);

            fireEvent.keyDown(editor, {
                key: 'v',
                ctrlKey: true,
                shiftKey: true
            });

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(
                    'Could not read clipboard for plain text paste:',
                    expect.any(Error)
                );
            });

            consoleSpy.mockRestore();
        });
    });

    describe('Edge Cases', () => {
        it('should handle missing clipboard API', async () => {
            // Temporarily remove clipboard API
            const originalClipboard = navigator.clipboard;
            Object.defineProperty(navigator, 'clipboard', {
                value: undefined,
                configurable: true
            });

            const consoleSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});

            render(<TestEditor />);

            const editor = screen.getByTestId('editor-content');
            fireEvent.click(editor);

            fireEvent.keyDown(editor, {
                key: 'v',
                ctrlKey: true,
                shiftKey: true
            });

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(
                    'Clipboard API not available for plain text paste'
                );
            });

            // Restore clipboard API
            Object.defineProperty(navigator, 'clipboard', {
                value: originalClipboard,
                configurable: true
            });

            consoleSpy.mockRestore();
        });

        it('should not crash with invalid configuration', () => {
            const config = {
                maxPasteLength: -1, // Invalid value
                preserveFormatting: null as any // Invalid type
            };

            expect(() => {
                render(<TestEditor config={config} />);
            }).not.toThrow();
        });
    });
});

describe('copyToClipboard utility', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockClipboard.write.mockResolvedValue(undefined);
        mockClipboard.writeText.mockResolvedValue(undefined);
    });

    it('should not crash when called with invalid editor', async () => {
        const invalidEditor = null as any;

        // Should return false, not throw
        const result = await copyToClipboard(invalidEditor);
        expect(result).toBe(false);
    });
});
