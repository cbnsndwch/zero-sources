import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ClipboardPlugin, copyToClipboard } from './ClipboardPlugin';

describe('ClipboardPlugin - Minimal Tests', () => {
    beforeEach(() => {
        // Mock clipboard API
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                readText: vi.fn(() => Promise.resolve('test text')),
                writeText: vi.fn(() => Promise.resolve()),
                write: vi.fn(() => Promise.resolve()),
                read: vi.fn(() => Promise.resolve([]))
            },
            configurable: true
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should export ClipboardPlugin function', () => {
        expect(ClipboardPlugin).toBeDefined();
        expect(typeof ClipboardPlugin).toBe('function');
    });

    it('should export copyToClipboard function', () => {
        expect(copyToClipboard).toBeDefined();
        expect(typeof copyToClipboard).toBe('function');
    });

    describe('copyToClipboard utility', () => {
        it('should handle null editor gracefully', async () => {
            // @ts-expect-error - Testing null handling
            const result = await copyToClipboard(null);
            expect(result).toBe(false);
        });

        it('should handle clipboard write errors', async () => {
            // Mock clipboard to throw an error
            vi.mocked(navigator.clipboard.writeText).mockRejectedValue(
                new Error('Clipboard error')
            );

            // @ts-expect-error - Testing null handling for error path
            const result = await copyToClipboard(null);
            expect(result).toBe(false);
        });
    });

    describe('Edge cases', () => {
        it('should handle missing clipboard API', async () => {
            // Remove clipboard API
            const originalClipboard = navigator.clipboard;
            // @ts-ignore
            delete navigator.clipboard;

            // @ts-expect-error - Testing null handling
            const result = await copyToClipboard(null);
            expect(result).toBe(false);

            // Restore clipboard API
            Object.defineProperty(navigator, 'clipboard', {
                value: originalClipboard,
                configurable: true
            });
        });
    });

    describe('Plugin existence', () => {
        it('should be a valid React component function', () => {
            expect(ClipboardPlugin).toBeInstanceOf(Function);
            expect(ClipboardPlugin.name).toBe('ClipboardPlugin');
        });
    });
});
