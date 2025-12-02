import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
    toggleTextFormat,
    isFormatActive,
    getActiveFormats,
    getFormattingShortcut,
    FORMATTING_SHORTCUTS
} from './formatting-utils';
import type { TextFormatType } from './types';

// Mock Lexical editor
const createMockEditor = () => {
    const mockRead = vi.fn(callback => callback());
    const mockEditor = {
        dispatchCommand: vi.fn(),
        getEditorState: vi.fn(() => ({
            read: mockRead
        }))
    };
    return mockEditor;
};

// Mock $getSelection and $isRangeSelection
vi.mock('lexical', async () => {
    const actual = await vi.importActual('lexical');
    return {
        ...actual,
        $getSelection: vi.fn(),
        $isRangeSelection: vi.fn(),
        FORMAT_TEXT_COMMAND: 'FORMAT_TEXT_COMMAND'
    };
});

describe('Text Formatting Utils', () => {
    let mockEditor: any;

    beforeEach(() => {
        mockEditor = createMockEditor();
        vi.clearAllMocks();
    });

    describe('toggleTextFormat', () => {
        it('should dispatch FORMAT_TEXT_COMMAND with bold format', () => {
            toggleTextFormat(mockEditor, 'bold');

            expect(mockEditor.dispatchCommand).toHaveBeenCalledWith(
                'FORMAT_TEXT_COMMAND',
                'bold'
            );
        });

        it('should dispatch FORMAT_TEXT_COMMAND with italic format', () => {
            toggleTextFormat(mockEditor, 'italic');

            expect(mockEditor.dispatchCommand).toHaveBeenCalledWith(
                'FORMAT_TEXT_COMMAND',
                'italic'
            );
        });

        it('should dispatch FORMAT_TEXT_COMMAND with underline format', () => {
            toggleTextFormat(mockEditor, 'underline');

            expect(mockEditor.dispatchCommand).toHaveBeenCalledWith(
                'FORMAT_TEXT_COMMAND',
                'underline'
            );
        });

        it('should dispatch FORMAT_TEXT_COMMAND with strikethrough format', () => {
            toggleTextFormat(mockEditor, 'strikethrough');

            expect(mockEditor.dispatchCommand).toHaveBeenCalledWith(
                'FORMAT_TEXT_COMMAND',
                'strikethrough'
            );
        });
    });

    describe('isFormatActive', () => {
        it('should return true when bold format is active', async () => {
            const { $getSelection, $isRangeSelection } =
                await import('lexical');
            const mockSelection = {
                hasFormat: vi.fn((format: string) => format === 'bold')
            };

            ($getSelection as any).mockReturnValue(mockSelection);
            ($isRangeSelection as any).mockReturnValue(true);

            const result = isFormatActive(mockEditor, 'bold');

            expect(result).toBe(true);
            expect(mockEditor.getEditorState().read).toHaveBeenCalled();
        });

        it('should return false when bold format is not active', async () => {
            const { $getSelection, $isRangeSelection } =
                await import('lexical');
            const mockSelection = {
                hasFormat: vi.fn(() => false)
            };

            ($getSelection as any).mockReturnValue(mockSelection);
            ($isRangeSelection as any).mockReturnValue(true);

            const result = isFormatActive(mockEditor, 'bold');

            expect(result).toBe(false);
        });

        it('should return false when selection is not a range selection', async () => {
            const { $getSelection, $isRangeSelection } =
                await import('lexical');

            ($getSelection as any).mockReturnValue({});
            ($isRangeSelection as any).mockReturnValue(false);

            const result = isFormatActive(mockEditor, 'bold');

            expect(result).toBe(false);
        });
    });

    describe('getActiveFormats', () => {
        it('should return all active formats', async () => {
            const { $getSelection, $isRangeSelection } =
                await import('lexical');
            const mockSelection = {
                hasFormat: vi.fn((format: string) =>
                    ['bold', 'italic'].includes(format)
                )
            };

            ($getSelection as any).mockReturnValue(mockSelection);
            ($isRangeSelection as any).mockReturnValue(true);

            const result = getActiveFormats(mockEditor);

            expect(result).toEqual(['bold', 'italic']);
        });

        it('should return empty array when no formats are active', async () => {
            const { $getSelection, $isRangeSelection } =
                await import('lexical');
            const mockSelection = {
                hasFormat: vi.fn(() => false)
            };

            ($getSelection as any).mockReturnValue(mockSelection);
            ($isRangeSelection as any).mockReturnValue(true);

            const result = getActiveFormats(mockEditor);

            expect(result).toEqual([]);
        });

        it('should return empty array when selection is not a range selection', async () => {
            const { $getSelection, $isRangeSelection } =
                await import('lexical');

            ($getSelection as any).mockReturnValue({});
            ($isRangeSelection as any).mockReturnValue(false);

            const result = getActiveFormats(mockEditor);

            expect(result).toEqual([]);
        });
    });

    describe('FORMATTING_SHORTCUTS', () => {
        it('should have correct shortcut definitions', () => {
            expect(FORMATTING_SHORTCUTS.bold).toEqual({
                key: 'b',
                modifier: true,
                shift: false
            });

            expect(FORMATTING_SHORTCUTS.italic).toEqual({
                key: 'i',
                modifier: true,
                shift: false
            });

            expect(FORMATTING_SHORTCUTS.underline).toEqual({
                key: 'u',
                modifier: true,
                shift: false
            });

            expect(FORMATTING_SHORTCUTS.strikethrough).toEqual({
                key: 's',
                modifier: true,
                shift: true
            });
        });
    });

    describe('getFormattingShortcut', () => {
        // Mock window.navigator for testing
        const originalNavigator = global.navigator;

        beforeEach(() => {
            // Reset navigator mock
            Object.defineProperty(global, 'navigator', {
                value: { platform: 'Windows' },
                writable: true
            });
        });

        afterEach(() => {
            Object.defineProperty(global, 'navigator', {
                value: originalNavigator,
                writable: true
            });
        });

        it('should return Ctrl shortcuts on Windows', () => {
            Object.defineProperty(global, 'navigator', {
                value: { platform: 'Windows' },
                writable: true
            });

            expect(getFormattingShortcut('bold')).toBe('Ctrl+B');
            expect(getFormattingShortcut('italic')).toBe('Ctrl+I');
            expect(getFormattingShortcut('underline')).toBe('Ctrl+U');
            expect(getFormattingShortcut('strikethrough')).toBe('Ctrl+Shift+S');
        });

        it('should return Cmd shortcuts on Mac', () => {
            Object.defineProperty(global, 'navigator', {
                value: { platform: 'MacIntel' },
                writable: true
            });

            expect(getFormattingShortcut('bold')).toBe('Cmd+B');
            expect(getFormattingShortcut('italic')).toBe('Cmd+I');
            expect(getFormattingShortcut('underline')).toBe('Cmd+U');
            expect(getFormattingShortcut('strikethrough')).toBe('Cmd+Shift+S');
        });

        it('should handle server-side rendering (no window)', () => {
            const originalWindow = global.window;

            // @ts-ignore
            delete global.window;

            expect(getFormattingShortcut('bold')).toBe('Ctrl+B');

            global.window = originalWindow;
        });
    });

    describe('Format Type Combinations', () => {
        it('should handle multiple format toggles correctly', () => {
            const formats: TextFormatType[] = [
                'bold',
                'italic',
                'underline',
                'strikethrough'
            ];

            formats.forEach(format => {
                toggleTextFormat(mockEditor, format);
                expect(mockEditor.dispatchCommand).toHaveBeenCalledWith(
                    'FORMAT_TEXT_COMMAND',
                    format
                );
            });

            expect(mockEditor.dispatchCommand).toHaveBeenCalledTimes(4);
        });
    });
});
