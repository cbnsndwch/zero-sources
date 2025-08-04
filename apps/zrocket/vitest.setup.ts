import '@testing-library/jest-dom';

import { beforeAll, vi } from 'vitest';
import { configure } from '@testing-library/react';
import React from 'react';

// Setup DOM environment
beforeAll(() => {
    // Configure React Testing Library for React 19
    configure({
        asyncUtilTimeout: 5000,
        testIdAttribute: 'data-testid'
    });

    // Fix React 19 compatibility: React.act was removed in React 19
    // but React Testing Library still expects it. We need to provide a shim.
    if (!React.act) {
        // In React 19, act is no longer needed for most cases, so we provide a passthrough
        (React as any).act = (callback: () => any) => {
            const result = callback();
            if (result && typeof result.then === 'function') {
                return result;
            }
            return Promise.resolve();
        };
    }

    // Mock HTMLElement methods that might be missing in jsdom
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn()
        }))
    });

    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
    }));

    // Mock DOMParser for Lexical HTML parsing
    global.DOMParser = vi.fn().mockImplementation(() => ({
        parseFromString: vi
            .fn()
            .mockImplementation((html: string, type: string) => {
                // Create a simple mock document
                const div = document.createElement('div');
                div.innerHTML = html;
                return {
                    body: div,
                    documentElement: div,
                    createElement: document.createElement.bind(document),
                    querySelectorAll: div.querySelectorAll.bind(div)
                };
            })
    }));

    // Mock ClipboardItem for Lexical clipboard functionality
    (global as any).ClipboardItem = vi
        .fn()
        .mockImplementation((items: Record<string, Blob>) => ({
            types: Object.keys(items),
            getType: vi
                .fn()
                .mockImplementation(async (type: string) => items[type])
        }));
    (global as any).ClipboardItem.supports = vi.fn().mockReturnValue(true);

    // Mock Blob constructor
    (global as any).Blob = vi
        .fn()
        .mockImplementation((content: any[], options?: { type?: string }) => ({
            type: options?.type || '',
            size: content.join('').length,
            stream: vi.fn(),
            text: vi.fn().mockResolvedValue(content.join('')),
            arrayBuffer: vi.fn()
        }));

    // Mock Range API for Lexical selection
    const MockRange = vi.fn().mockImplementation(() => ({
        setStart: vi.fn(),
        setEnd: vi.fn(),
        collapse: vi.fn(),
        selectNodeContents: vi.fn(),
        getBoundingClientRect: vi.fn().mockReturnValue({
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            width: 0,
            height: 0
        })
    }));
    Object.assign(MockRange, {
        START_TO_START: 0,
        START_TO_END: 1,
        END_TO_END: 2,
        END_TO_START: 3
    });
    global.Range = MockRange as any;

    // Mock Selection API
    global.Selection = vi.fn().mockImplementation(() => ({
        addRange: vi.fn(),
        removeAllRanges: vi.fn(),
        getRangeAt: vi.fn().mockReturnValue(new Range()),
        rangeCount: 0
    }));

    // Mock document.createRange
    document.createRange = vi.fn().mockImplementation(() => new Range());

    // Mock getComputedStyle
    global.getComputedStyle = vi.fn().mockImplementation(() => ({
        getPropertyValue: vi.fn().mockReturnValue(''),
        fontSize: '16px',
        lineHeight: '1.5'
    }));
});
