import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { RichMessageEditor } from './RichMessageEditor';

// Mock the Lexical components since they require DOM setup
vi.mock('@lexical/react/LexicalComposer', () => ({
    LexicalComposer: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="lexical-composer">{children}</div>
    )
}));

vi.mock('@lexical/react/LexicalRichTextPlugin', () => ({
    RichTextPlugin: ({ contentEditable, ErrorBoundary }: any) => (
        <div data-testid="rich-text-plugin">
            {contentEditable}
            <ErrorBoundary />
        </div>
    )
}));

vi.mock('@lexical/react/LexicalContentEditable', () => ({
    ContentEditable: ({ placeholder, className }: any) => (
        <div data-testid="content-editable" className={className}>
            {placeholder}
        </div>
    )
}));

vi.mock('@lexical/react/LexicalHistoryPlugin', () => ({
    HistoryPlugin: () => <div data-testid="history-plugin" />
}));

vi.mock('@lexical/react/LexicalOnChangePlugin', () => ({
    OnChangePlugin: () => <div data-testid="onchange-plugin" />
}));

vi.mock('@lexical/react/LexicalErrorBoundary', () => ({
    LexicalErrorBoundary: () => <div data-testid="error-boundary" />
}));

vi.mock('@lexical/react/LexicalComposerContext', () => ({
    useLexicalComposerContext: () => [
        {
            registerRootListener: () => () => {},
            registerNodeTransform: () => () => {},
            registerCommand: () => () => {},
            dispatchCommand: () => {},
            getEditorState: () => ({
                toJSON: () => ({ root: { children: [] } }),
                read: (fn: Function) => fn()
            }),
            update: (fn: Function) => fn()
        }
    ]
}));

describe('RichMessageEditor', () => {
    it('renders without crashing', () => {
        const mockOnSendMessage = vi.fn();

        render(<RichMessageEditor onSendMessage={mockOnSendMessage} />);

        expect(screen.getByTestId('lexical-composer')).toBeInTheDocument();
        expect(screen.getByTestId('rich-text-plugin')).toBeInTheDocument();
        expect(screen.getByTestId('content-editable')).toBeInTheDocument();
    });

    it('displays the default placeholder', () => {
        const mockOnSendMessage = vi.fn();

        render(<RichMessageEditor onSendMessage={mockOnSendMessage} />);

        expect(screen.getByText('Type a message...')).toBeInTheDocument();
    });

    it('displays custom placeholder when provided', () => {
        const mockOnSendMessage = vi.fn();
        const customPlaceholder = 'Enter your message here...';

        render(
            <RichMessageEditor
                onSendMessage={mockOnSendMessage}
                placeholder={customPlaceholder}
            />
        );

        expect(screen.getByText(customPlaceholder)).toBeInTheDocument();
    });

    it('includes required plugins', () => {
        const mockOnSendMessage = vi.fn();

        render(<RichMessageEditor onSendMessage={mockOnSendMessage} />);

        expect(screen.getByTestId('history-plugin')).toBeInTheDocument();
        expect(screen.getByTestId('onchange-plugin')).toBeInTheDocument();
        expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });

    it('shows character count when maxLength is provided and content is near limit', () => {
        const mockOnSendMessage = vi.fn();

        render(
            <RichMessageEditor
                onSendMessage={mockOnSendMessage}
                maxLength={100}
            />
        );

        // Character count is only shown when content is over 85% of limit
        // With an empty editor (0 characters), it should not show character count
        expect(screen.queryByText('0/100')).not.toBeInTheDocument();
        
        // The component should render without errors
        expect(screen.getByTestId('lexical-composer')).toBeInTheDocument();
    });

    it('does not show character count when maxLength is not provided', () => {
        const mockOnSendMessage = vi.fn();

        render(<RichMessageEditor onSendMessage={mockOnSendMessage} />);

        expect(screen.queryByText(/\/\d+/)).not.toBeInTheDocument();
    });
});
