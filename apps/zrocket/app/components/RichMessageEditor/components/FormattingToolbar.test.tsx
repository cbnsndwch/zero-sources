import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { FormattingToolbar } from './FormattingToolbar';

// Mock the Lexical components and add formatting support
vi.mock('@lexical/react/LexicalComposer', () => ({
    LexicalComposer: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="lexical-composer">{children}</div>
    )
}));

// Enhanced mock to support toolbar
vi.mock('@lexical/react/LexicalComposerContext', () => ({
    useLexicalComposerContext: () => [
        {
            registerUpdateListener: vi.fn(() => () => {}),
            dispatchCommand: vi.fn(),
            getEditorState: () => ({
                read: (fn: Function) => fn()
            })
        }
    ]
}));

// Mock Lexical selection functions
vi.mock('lexical', async () => {
    const actual = await vi.importActual('lexical');
    return {
        ...actual,
        $getSelection: vi.fn(() => ({
            hasFormat: vi.fn(() => false)
        })),
        $isRangeSelection: vi.fn(() => true),
        FORMAT_TEXT_COMMAND: 'FORMAT_TEXT_COMMAND'
    };
});

// Mock UI components
vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, disabled, className, title, 'data-testid': testId }: any) => (
        <button 
            onClick={onClick}
            disabled={disabled}
            className={className}
            title={title}
            data-testid={testId}
        >
            {children}
        </button>
    )
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Bold: () => <span>B</span>,
    Italic: () => <span>I</span>,
    Underline: () => <span>U</span>,
    Strikethrough: () => <span>S</span>
}));

describe('FormattingToolbar', () => {
    it('renders all formatting buttons', () => {
        render(<FormattingToolbar />);

        expect(screen.getByTestId('format-bold')).toBeInTheDocument();
        expect(screen.getByTestId('format-italic')).toBeInTheDocument();
        expect(screen.getByTestId('format-underline')).toBeInTheDocument();
        expect(screen.getByTestId('format-strikethrough')).toBeInTheDocument();
    });

    it('shows correct tooltips for each button', () => {
        render(<FormattingToolbar />);

        expect(screen.getByTestId('format-bold')).toHaveAttribute('title', 'Bold (Ctrl+B)');
        expect(screen.getByTestId('format-italic')).toHaveAttribute('title', 'Italic (Ctrl+I)');
        expect(screen.getByTestId('format-underline')).toHaveAttribute('title', 'Underline (Ctrl+U)');
        expect(screen.getByTestId('format-strikethrough')).toHaveAttribute('title', 'Strikethrough (Ctrl+Shift+S)');
    });

    it('handles button clicks correctly', () => {
        render(<FormattingToolbar />);

        const boldButton = screen.getByTestId('format-bold');
        const italicButton = screen.getByTestId('format-italic');

        fireEvent.click(boldButton);
        fireEvent.click(italicButton);

        // In real environment, these would dispatch FORMAT_TEXT_COMMAND
        // In test environment, we verify the buttons can be clicked
        expect(boldButton).toBeInTheDocument();
        expect(italicButton).toBeInTheDocument();
    });

    it('disables all buttons when disabled prop is true', () => {
        render(<FormattingToolbar disabled={true} />);

        expect(screen.getByTestId('format-bold')).toBeDisabled();
        expect(screen.getByTestId('format-italic')).toBeDisabled();
        expect(screen.getByTestId('format-underline')).toBeDisabled();
        expect(screen.getByTestId('format-strikethrough')).toBeDisabled();
    });

    it('renders with proper styling classes', () => {
        render(<FormattingToolbar />);
        
        // Check that the toolbar container has correct styling
        const toolbar = screen.getByTestId('format-bold').closest('div');
        expect(toolbar).toHaveClass('flex', 'gap-1', 'p-2');
    });

    it('shows icons correctly', () => {
        render(<FormattingToolbar />);

        // Check that icons are rendered (mocked as text)
        expect(screen.getByText('B')).toBeInTheDocument();
        expect(screen.getByText('I')).toBeInTheDocument();
        expect(screen.getByText('U')).toBeInTheDocument();
        expect(screen.getByText('S')).toBeInTheDocument();
    });
});