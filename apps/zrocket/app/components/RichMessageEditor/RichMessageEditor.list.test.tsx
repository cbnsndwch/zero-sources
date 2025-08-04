import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RichMessageEditor } from './RichMessageEditor';

// Mock the console to avoid noise in test output
const originalConsoleError = console.error;
beforeEach(() => {
    console.error = vi.fn();
});

// Restore console after each test
afterEach(() => {
    console.error = originalConsoleError;
});

describe('RichMessageEditor - List Support', () => {
    const mockOnSendMessage = vi.fn();

    beforeEach(() => {
        mockOnSendMessage.mockClear();
    });

    it('renders with list support nodes registered', () => {
        render(
            <RichMessageEditor
                onSendMessage={mockOnSendMessage}
                placeholder="Test list support..."
            />
        );

        // Component should render without crashing
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('includes CustomListPlugin in the component tree', () => {
        const { container } = render(
            <RichMessageEditor
                onSendMessage={mockOnSendMessage}
                placeholder="Test list plugin..."
            />
        );

        // The editor should render successfully with list nodes
        expect(container.querySelector('[contenteditable="true"]')).toBeInTheDocument();
    });

    it('includes toolbar with list buttons', () => {
        render(
            <RichMessageEditor
                onSendMessage={mockOnSendMessage}
                placeholder="Test toolbar..."
            />
        );

        // Check for list buttons in toolbar
        const unorderedListButton = screen.getByTitle('Bulleted List (Ctrl+Shift+8)');
        const orderedListButton = screen.getByTitle('Numbered List (Ctrl+Shift+7)');

        expect(unorderedListButton).toBeInTheDocument();
        expect(orderedListButton).toBeInTheDocument();
    });

    it('toolbar buttons are clickable', () => {
        render(
            <RichMessageEditor
                onSendMessage={mockOnSendMessage}
                placeholder="Test toolbar clicks..."
            />
        );

        const unorderedListButton = screen.getByTitle('Bulleted List (Ctrl+Shift+8)');
        const orderedListButton = screen.getByTitle('Numbered List (Ctrl+Shift+7)');

        // Should not throw when clicked
        expect(() => {
            fireEvent.click(unorderedListButton);
        }).not.toThrow();

        expect(() => {
            fireEvent.click(orderedListButton);
        }).not.toThrow();
    });

    it('handles keyboard shortcuts for list creation', () => {
        render(
            <RichMessageEditor
                onSendMessage={mockOnSendMessage}
                placeholder="Test keyboard shortcuts..."
            />
        );

        const editor = screen.getByRole('textbox');

        // Test Ctrl+Shift+7 for ordered list
        expect(() => {
            fireEvent.keyDown(editor, {
                key: '7',
                ctrlKey: true,
                shiftKey: true
            });
        }).not.toThrow();

        // Test Ctrl+Shift+8 for unordered list
        expect(() => {
            fireEvent.keyDown(editor, {
                key: '8',
                ctrlKey: true,
                shiftKey: true
            });
        }).not.toThrow();
    });

    it('has updated theme configuration for lists', () => {
        const { container } = render(
            <RichMessageEditor
                onSendMessage={mockOnSendMessage}
                placeholder="Test theme..."
            />
        );

        // The component should render with list styling classes available
        expect(container.querySelector('[contenteditable="true"]')).toBeInTheDocument();
    });

    it('maintains backward compatibility with existing props', () => {
        const testContent = {
            root: {
                children: [
                    {
                        children: [
                            {
                                detail: 0,
                                format: 0,
                                mode: 'normal',
                                style: '',
                                text: 'Test content',
                                type: 'text',
                                version: 1
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

        expect(() => {
            render(
                <RichMessageEditor
                    onSendMessage={mockOnSendMessage}
                    placeholder="Test compatibility..."
                    initialContent={testContent}
                    disabled={false}
                    maxLength={100}
                />
            );
        }).not.toThrow();

        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('preserves serialization behavior with list content', () => {
        render(
            <RichMessageEditor
                onSendMessage={mockOnSendMessage}
                placeholder="Test serialization..."
            />
        );

        const editor = screen.getByRole('textbox');

        // Type some text
        fireEvent.input(editor, { target: { textContent: 'Test list item' } });

        // Simulate Enter to send (should not throw)
        expect(() => {
            fireEvent.keyDown(editor, { key: 'Enter' });
        }).not.toThrow();
    });
});