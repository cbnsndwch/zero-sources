import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { ClipboardPlugin, copyToClipboard } from './ClipboardPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

// Mock the HTML generation functions
vi.mock('@lexical/html', () => ({
    $generateHtmlFromNodes: vi.fn(),
    $generateNodesFromDOM: vi.fn()
}));

// Global ClipboardEvent mock
global.ClipboardEvent = class ClipboardEvent extends Event {
    clipboardData: DataTransfer | null;
    
    constructor(type: string, eventInitDict?: ClipboardEventInit) {
        super(type, eventInitDict);
        this.clipboardData = eventInitDict?.clipboardData || null;
    }
} as any;

// DataTransfer mock
global.DataTransfer = class DataTransfer {
    private data: Record<string, string> = {};
    
    getData(format: string): string {
        return this.data[format] || '';
    }
    
    setData(format: string, data: string): void {
        this.data[format] = data;
    }
    
    clearData(format?: string): void {
        if (format) {
            delete this.data[format];
        } else {
            this.data = {};
        }
    }
} as any;

// ClipboardItem mock
global.ClipboardItem = class ClipboardItem {
    constructor(private data: Record<string, Blob>) {}
    
    async getType(type: string): Promise<Blob> {
        return this.data[type] || new Blob();
    }
} as any;

// Mock clipboard API
const mockClipboard = {
    readText: vi.fn(),
    writeText: vi.fn(),
    write: vi.fn(),
    read: vi.fn()
};

Object.defineProperty(navigator, 'clipboard', {
    value: mockClipboard,
    configurable: true
});

// Mock createHeadlessEditor
const mockEditor = {
    getEditorState: vi.fn(() => ({
        read: vi.fn((fn) => fn())
    })),
    update: vi.fn((fn) => fn()),
    registerCommand: vi.fn(),
    registerRootListener: vi.fn(),
    dispatchCommand: vi.fn()
};

vi.mock('lexical', async () => {
    const actual = await vi.importActual('lexical');
    return {
        ...actual,
        createHeadlessEditor: vi.fn(() => mockEditor)
    };
});

// Test component that includes ClipboardPlugin
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
                    />
                }
                placeholder={<div>Type something...</div>}
                ErrorBoundary={LexicalErrorBoundary}
            />
            <ClipboardPlugin {...config} onPaste={onPaste} />
        </LexicalComposer>
    );
}

describe('ClipboardPlugin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset clipboard mocks
        mockClipboard.readText.mockResolvedValue('');
        mockClipboard.writeText.mockResolvedValue(undefined);
        mockClipboard.write.mockResolvedValue(undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Plugin Registration', () => {
        it('should render without errors', () => {
            const onPaste = vi.fn();
            render(<TestEditor onPaste={onPaste} />);
            
            expect(screen.getByTestId('editor-content')).toBeInTheDocument();
        });

        it('should accept configuration options', () => {
            const config = {
                preserveFormatting: false,
                maxPasteLength: 100,
                showNotifications: true
            };
            const onPaste = vi.fn();
            
            render(<TestEditor config={config} onPaste={onPaste} />);
            expect(screen.getByTestId('editor-content')).toBeInTheDocument();
        });
    });

    describe('Paste Event Handling', () => {
        it('should handle plain text paste', async () => {
            const onPaste = vi.fn();
            render(<TestEditor onPaste={onPaste} />);
            
            const editor = screen.getByTestId('editor-content');
            
            // Create a paste event with plain text
            const clipboardData = new DataTransfer();
            clipboardData.setData('text/plain', 'Hello World');
            
            const pasteEvent = new ClipboardEvent('paste', { clipboardData });

            fireEvent(editor, pasteEvent);
            
            // Wait for paste handling
            await waitFor(() => {
                expect(onPaste).toHaveBeenCalledWith({
                    text: 'Hello World'
                });
            });
        });

        it('should handle HTML paste with formatting preservation', async () => {
            const onPaste = vi.fn();
            render(<TestEditor config={{ preserveFormatting: true }} onPaste={onPaste} />);
            
            const editor = screen.getByTestId('editor-content');
            const htmlContent = '<p><strong>Bold text</strong> and <em>italic text</em></p>';
            
            // Mock $generateNodesFromDOM to return test nodes
            const mockNodes = [{ type: 'paragraph', children: [] }];
            (vi.mocked($generateNodesFromDOM)).mockReturnValue(mockNodes);
            
            const clipboardData = new DataTransfer();
            clipboardData.setData('text/html', htmlContent);
            clipboardData.setData('text/plain', 'Bold text and italic text');
            
            const pasteEvent = new ClipboardEvent('paste', { clipboardData });

            fireEvent(editor, pasteEvent);
            
            await waitFor(() => {
                expect(onPaste).toHaveBeenCalledWith({
                    html: htmlContent,
                    nodes: mockNodes
                });
            });
        });

        it('should strip formatting when preserveFormatting is false', async () => {
            const onPaste = vi.fn();
            render(<TestEditor config={{ preserveFormatting: false }} onPaste={onPaste} />);
            
            const editor = screen.getByTestId('editor-content');
            const htmlContent = '<p><strong>Bold text</strong></p>';
            
            const clipboardData = new DataTransfer();
            clipboardData.setData('text/html', htmlContent);
            clipboardData.setData('text/plain', 'Bold text');
            
            const pasteEvent = new ClipboardEvent('paste', { clipboardData });

            fireEvent(editor, pasteEvent);
            
            await waitFor(() => {
                expect(onPaste).toHaveBeenCalledWith({
                    text: 'Bold text'
                });
            });
        });

        it('should enforce maximum paste length', async () => {
            const onPaste = vi.fn();
            render(<TestEditor config={{ maxPasteLength: 5 }} onPaste={onPaste} />);
            
            const editor = screen.getByTestId('editor-content');
            
            const clipboardData = new DataTransfer();
            clipboardData.setData('text/plain', 'This is a very long text that exceeds the limit');
            
            const pasteEvent = new ClipboardEvent('paste', { clipboardData });

            fireEvent(editor, pasteEvent);
            
            await waitFor(() => {
                expect(onPaste).toHaveBeenCalledWith({
                    text: 'This '
                });
            });
        });
    });

    describe('HTML Sanitization', () => {
        it('should remove dangerous script tags', async () => {
            const onPaste = vi.fn();
            const customSanitizer = vi.fn((html) => {
                // Remove script tags
                return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            });
            
            render(<TestEditor config={{ sanitizeHtml: customSanitizer }} onPaste={onPaste} />);
            
            const editor = screen.getByTestId('editor-content');
            const maliciousHtml = '<p>Safe content</p><script>alert("XSS")</script>';
            
            const clipboardData = new DataTransfer();
            clipboardData.setData('text/html', maliciousHtml);
            
            const pasteEvent = new ClipboardEvent('paste', { clipboardData });

            fireEvent(editor, pasteEvent);
            
            await waitFor(() => {
                expect(customSanitizer).toHaveBeenCalledWith(maliciousHtml);
            });
        });

        it('should handle custom sanitization function', async () => {
            const customSanitizer = vi.fn((html) => html.toUpperCase());
            const onPaste = vi.fn();
            
            render(<TestEditor config={{ sanitizeHtml: customSanitizer }} onPaste={onPaste} />);
            
            const editor = screen.getByTestId('editor-content');
            const htmlContent = '<p>hello world</p>';
            
            const clipboardData = new DataTransfer();
            clipboardData.setData('text/html', htmlContent);
            
            const pasteEvent = new ClipboardEvent('paste', { clipboardData });

            fireEvent(editor, pasteEvent);
            
            await waitFor(() => {
                expect(customSanitizer).toHaveBeenCalledWith(htmlContent);
            });
        });
    });

    describe('Keyboard Shortcuts', () => {
        it('should handle Ctrl+Shift+V for plain text paste', async () => {
            const onPaste = vi.fn();
            mockClipboard.readText.mockResolvedValue('Plain text from clipboard');
            
            render(<TestEditor onPaste={onPaste} />);
            
            const editor = screen.getByTestId('editor-content');
            
            // Simulate Ctrl+Shift+V
            fireEvent.keyDown(editor, {
                key: 'v',
                ctrlKey: true,
                shiftKey: true
            });
            
            await waitFor(() => {
                expect(mockClipboard.readText).toHaveBeenCalled();
                expect(onPaste).toHaveBeenCalledWith({
                    text: 'Plain text from clipboard'
                });
            });
        });

        it('should handle clipboard API errors gracefully', async () => {
            const onPaste = vi.fn();
            mockClipboard.readText.mockRejectedValue(new Error('Clipboard access denied'));
            
            // Spy on console.warn to check error handling
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            
            render(<TestEditor onPaste={onPaste} />);
            
            const editor = screen.getByTestId('editor-content');
            
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
        it('should handle empty clipboard data', async () => {
            const onPaste = vi.fn();
            render(<TestEditor onPaste={onPaste} />);
            
            const editor = screen.getByTestId('editor-content');
            
            const clipboardData = new DataTransfer();
            // Don't set any data, leaving it empty
            
            const pasteEvent = new ClipboardEvent('paste', { clipboardData });

            fireEvent(editor, pasteEvent);
            
            // Should not call onPaste for empty content
            expect(onPaste).not.toHaveBeenCalled();
        });

        it('should handle malformed HTML gracefully', async () => {
            const onPaste = vi.fn();
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            
            // Mock $generateNodesFromDOM to throw an error
            (vi.mocked($generateNodesFromDOM)).mockImplementation(() => {
                throw new Error('Invalid HTML');
            });
            
            render(<TestEditor onPaste={onPaste} />);
            
            const editor = screen.getByTestId('editor-content');
            const malformedHtml = '<p><strong>Unclosed tag</p>';
            
            const clipboardData = new DataTransfer();
            clipboardData.setData('text/html', malformedHtml);
            clipboardData.setData('text/plain', 'Unclosed tag');
            
            const pasteEvent = new ClipboardEvent('paste', { clipboardData });

            fireEvent(editor, pasteEvent);
            
            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(
                    'Error parsing HTML content:',
                    expect.any(Error)
                );
                // Should fall back to plain text
                expect(onPaste).toHaveBeenCalledWith({
                    text: 'Unclosed tag'
                });
            });
            
            consoleSpy.mockRestore();
        });
    });
});

describe('copyToClipboard utility', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockClipboard.write.mockResolvedValue(undefined);
        mockClipboard.writeText.mockResolvedValue(undefined);
    });

    it('should copy selected content to clipboard', async () => {
        // Import after mocking
        const { createHeadlessEditor } = await import('lexical');
        const editor = createHeadlessEditor({
            namespace: 'test',
            theme: {},
            onError: () => {}
        });

        // Mock HTML generation
        (vi.mocked($generateHtmlFromNodes)).mockReturnValue('<p>Selected text</p>');

        const result = await copyToClipboard(editor);
        
        expect(result).toBe(true);
        expect(mockClipboard.write).toHaveBeenCalled();
    });

    it('should fall back to text copy if HTML copy fails', async () => {
        const { createHeadlessEditor } = await import('lexical');
        const editor = createHeadlessEditor({
            namespace: 'test',
            theme: {},
            onError: () => {}
        });

        // Mock HTML generation
        (vi.mocked($generateHtmlFromNodes)).mockReturnValue('<p>Selected text</p>');
        
        // Mock clipboard.write to fail
        mockClipboard.write.mockRejectedValue(new Error('Write failed'));
        
        const result = await copyToClipboard(editor);
        
        expect(result).toBe(true);
        expect(mockClipboard.writeText).toHaveBeenCalled();
    });

    it('should return false if no content is selected', async () => {
        const { createHeadlessEditor } = await import('lexical');
        const editor = createHeadlessEditor({
            namespace: 'test',
            theme: {},
            onError: () => {}
        });

        // Mock empty selection
        (vi.mocked($generateHtmlFromNodes)).mockReturnValue('');

        const result = await copyToClipboard(editor);
        
        expect(result).toBe(false);
        expect(mockClipboard.write).not.toHaveBeenCalled();
    });
});