import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ChatInput } from './ChatInput';

// Mock the RichMessageEditor component since it requires DOM setup
vi.mock('@/components/RichMessageEditor', () => ({
    RichMessageEditor: ({ onSendMessage, placeholder, maxLength }: any) => (
        <div data-testid="rich-message-editor">
            <div data-testid="rich-editor-placeholder">{placeholder}</div>
            <div data-testid="rich-editor-max-length">{maxLength}</div>
            <button
                data-testid="rich-editor-send"
                onClick={() =>
                    onSendMessage({
                        root: {
                            children: [
                                {
                                    children: [{ text: 'test message' }]
                                }
                            ]
                        }
                    })
                }
            >
                Send
            </button>
        </div>
    )
}));

describe('ChatInput', () => {
    const defaultProps = {
        roomId: 'test-room',
        roomType: 'channel' as const
    };

    it('renders with basic textarea by default', () => {
        render(<ChatInput {...defaultProps} />);

        expect(
            screen.getByPlaceholderText('Type a message...')
        ).toBeInTheDocument();
        expect(screen.getAllByRole('button')).toHaveLength(4); // Plus, Send, Paperclip, Smile
        expect(
            screen.queryByTestId('rich-message-editor')
        ).not.toBeInTheDocument();
    });

    it('renders with RichMessageEditor when useRichEditor is true', () => {
        render(<ChatInput {...defaultProps} useRichEditor />);

        expect(screen.getByTestId('rich-message-editor')).toBeInTheDocument();
        expect(screen.getByTestId('rich-editor-placeholder')).toHaveTextContent(
            'Type a message...'
        );
        expect(screen.getByTestId('rich-editor-max-length')).toHaveTextContent(
            '1000'
        );
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument(); // No textarea
    });

    it('includes attachment and emoji buttons in both modes', () => {
        const { rerender } = render(<ChatInput {...defaultProps} />);

        // Check basic mode: Plus, Send, Paperclip, Smile buttons
        expect(screen.getAllByRole('button')).toHaveLength(4);

        // Check rich editor mode: Plus, Send, Paperclip, Smile + mock send button
        rerender(<ChatInput {...defaultProps} useRichEditor />);
        expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(4);
    });

    it('handles rich message sending', () => {
        const consoleSpy = vi
            .spyOn(console, 'log')
            .mockImplementation(() => {});

        render(<ChatInput {...defaultProps} useRichEditor />);

        const sendButton = screen.getByTestId('rich-editor-send');
        sendButton.click();

        expect(consoleSpy).toHaveBeenCalledWith('Sending rich message:', {
            textContent: 'test message',
            serializedState: {
                root: {
                    children: [
                        {
                            children: [{ text: 'test message' }]
                        }
                    ]
                }
            }
        });

        consoleSpy.mockRestore();
    });

    it('maintains backward compatibility with existing API', () => {
        // Should render without errors with existing props
        render(<ChatInput roomId="test" roomType="dm" />);
        expect(
            screen.getByPlaceholderText('Type a message...')
        ).toBeInTheDocument();
    });

    it('applies correct room type and id props', () => {
        render(
            <ChatInput roomId="my-room" roomType="group" useRichEditor />
        );

        // Component should render successfully with all prop variations
        expect(screen.getByTestId('rich-message-editor')).toBeInTheDocument();
    });
});
