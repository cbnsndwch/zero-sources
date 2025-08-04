import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the formatting utils first
vi.mock('../formatting-utils', () => ({
    toggleTextFormat: vi.fn()
}));

// Mock UI Button component
vi.mock('@/components/ui/button', () => ({
    Button: ({
        children,
        onClick,
        disabled,
        title,
        'data-testid': testId,
        ...props
    }: any) => (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            data-testid={testId}
            {...props}
        >
            {children}
        </button>
    )
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    Bold: () => <span data-testid="bold-icon">B</span>,
    Italic: () => <span data-testid="italic-icon">I</span>,
    Underline: () => <span data-testid="underline-icon">U</span>,
    Strikethrough: () => <span data-testid="strikethrough-icon">S</span>
}));

// Mock Lexical modules
vi.mock('@lexical/react/LexicalComposerContext', () => ({
    useLexicalComposerContext: () => [
        {
            registerUpdateListener: vi.fn(callback => {
                // Simulate an update by immediately calling the callback
                setTimeout(() => {
                    callback({
                        editorState: {
                            read: vi.fn(fn => fn())
                        }
                    });
                }, 0);
                // Return cleanup function
                return () => {};
            }),
            getEditorState: vi.fn(() => ({
                read: vi.fn(fn => fn())
            })),
            dispatchCommand: vi.fn()
        }
    ]
}));

vi.mock('lexical', () => ({
    $getSelection: vi.fn(() => ({
        hasFormat: vi.fn(format => {
            // Mock some formats as active for testing
            return format === 'bold';
        })
    })),
    $isRangeSelection: vi.fn(() => true)
}));

import { toggleTextFormat } from '../formatting-utils';

import { FormattingToolbar } from './FormattingToolbar';

describe('FormattingToolbar', () => {
    it('renders all formatting buttons', () => {
        const { container } = render(<FormattingToolbar />);

        // Debug output to see what's rendered
        console.log('Rendered HTML:', container.innerHTML);
        console.log('Document body:', document.body.innerHTML);

        expect(screen.getByTestId('format-bold')).toBeInTheDocument();
        expect(screen.getByTestId('format-italic')).toBeInTheDocument();
        expect(screen.getByTestId('format-underline')).toBeInTheDocument();
        expect(screen.getByTestId('format-strikethrough')).toBeInTheDocument();
    });

    it('shows correct tooltips for each button', () => {
        render(<FormattingToolbar />);

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

    it('handles button clicks correctly', () => {
        const mockToggleTextFormat = vi.mocked(toggleTextFormat);
        render(<FormattingToolbar />);

        const boldButton = screen.getByTestId('format-bold');
        const italicButton = screen.getByTestId('format-italic');
        const underlineButton = screen.getByTestId('format-underline');
        const strikethroughButton = screen.getByTestId('format-strikethrough');

        fireEvent.click(boldButton);
        fireEvent.click(italicButton);
        fireEvent.click(underlineButton);
        fireEvent.click(strikethroughButton);

        expect(mockToggleTextFormat).toHaveBeenCalledTimes(4);
        expect(mockToggleTextFormat).toHaveBeenNthCalledWith(
            1,
            expect.any(Object),
            'bold'
        );
        expect(mockToggleTextFormat).toHaveBeenNthCalledWith(
            2,
            expect.any(Object),
            'italic'
        );
        expect(mockToggleTextFormat).toHaveBeenNthCalledWith(
            3,
            expect.any(Object),
            'underline'
        );
        expect(mockToggleTextFormat).toHaveBeenNthCalledWith(
            4,
            expect.any(Object),
            'strikethrough'
        );
    });

    it('disables all buttons when disabled prop is true', () => {
        render(<FormattingToolbar disabled={true} />);

        expect(screen.getByTestId('format-bold')).toBeDisabled();
        expect(screen.getByTestId('format-italic')).toBeDisabled();
        expect(screen.getByTestId('format-underline')).toBeDisabled();
        expect(screen.getByTestId('format-strikethrough')).toBeDisabled();
    });

    it('does not call toggleTextFormat when disabled', () => {
        const mockToggleTextFormat = vi.mocked(toggleTextFormat);
        render(<FormattingToolbar disabled={true} />);

        const boldButton = screen.getByTestId('format-bold');
        fireEvent.click(boldButton);

        expect(mockToggleTextFormat).not.toHaveBeenCalled();
    });

    it('renders with proper styling classes', () => {
        render(<FormattingToolbar />);

        // Check that the toolbar container has correct styling
        const toolbar = screen.getByTestId('format-bold').closest('div');
        expect(toolbar).toHaveClass('flex', 'gap-0.5', 'px-2', 'pt-2');
    });

    it('buttons have correct variant and size attributes', () => {
        render(<FormattingToolbar />);

        const boldButton = screen.getByTestId('format-bold');

        // Check button attributes for mocked button component
        expect(boldButton).toHaveAttribute('data-variant', 'ghost');
        expect(boldButton).toHaveAttribute('data-size', 'sm');
    });
});
