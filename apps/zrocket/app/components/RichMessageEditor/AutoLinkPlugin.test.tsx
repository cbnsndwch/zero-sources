import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { RichMessageEditor } from './RichMessageEditor';

describe('AutoLink Plugin', () => {
    let mockOnSendMessage: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockOnSendMessage = vi.fn();
    });

    it('should detect and convert HTTPS URLs to links', async () => {
        const user = userEvent.setup();
        
        render(
            <RichMessageEditor 
                onSendMessage={mockOnSendMessage}
                placeholder="Type a message..."
            />
        );

        const editor = screen.getByRole('textbox');
        
        // Type a URL
        await user.type(editor, 'Check out https://example.com for more info');
        
        // Wait for auto-detection
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // The URL should be converted to a link
        const link = screen.getByRole('link', { name: /https:\/\/example\.com/ });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'https://example.com');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('should detect and convert HTTP URLs to links', async () => {
        const user = userEvent.setup();
        
        render(
            <RichMessageEditor 
                onSendMessage={mockOnSendMessage}
                placeholder="Type a message..."
            />
        );

        const editor = screen.getByRole('textbox');
        
        // Type a URL
        await user.type(editor, 'Visit http://example.com');
        
        // Wait for auto-detection
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // The URL should be converted to a link
        const link = screen.getByRole('link', { name: /http:\/\/example\.com/ });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'http://example.com');
    });

    it('should detect and convert www URLs to links with https prefix', async () => {
        const user = userEvent.setup();
        
        render(
            <RichMessageEditor 
                onSendMessage={mockOnSendMessage}
                placeholder="Type a message..."
            />
        );

        const editor = screen.getByRole('textbox');
        
        // Type a URL
        await user.type(editor, 'Go to www.example.com');
        
        // Wait for auto-detection
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // The URL should be converted to a link with https prefix
        const link = screen.getByRole('link', { name: /www\.example\.com/ });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'https://www.example.com');
    });

    it('should detect and convert domain-only URLs to links with https prefix', async () => {
        const user = userEvent.setup();
        
        render(
            <RichMessageEditor 
                onSendMessage={mockOnSendMessage}
                placeholder="Type a message..."
            />
        );

        const editor = screen.getByRole('textbox');
        
        // Type a URL
        await user.type(editor, 'Visit example.com for details');
        
        // Wait for auto-detection
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // The URL should be converted to a link with https prefix
        const link = screen.getByRole('link', { name: /example\.com/ });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('should detect and convert email addresses to mailto links', async () => {
        const user = userEvent.setup();
        
        render(
            <RichMessageEditor 
                onSendMessage={mockOnSendMessage}
                placeholder="Type a message..."
            />
        );

        const editor = screen.getByRole('textbox');
        
        // Type an email
        await user.type(editor, 'Contact test@example.com');
        
        // Wait for auto-detection
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // The email should be converted to a mailto link
        const link = screen.getByRole('link', { name: /test@example\.com/ });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'mailto:test@example.com');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should not convert invalid URLs to links', async () => {
        const user = userEvent.setup();
        
        render(
            <RichMessageEditor 
                onSendMessage={mockOnSendMessage}
                placeholder="Type a message..."
            />
        );

        const editor = screen.getByRole('textbox');
        
        // Type invalid URLs (improved test case)
        await user.type(editor, 'not-a-url and just text');
        
        // Wait for potential auto-detection
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // There should be no links created
        const links = screen.queryAllByRole('link');
        expect(links).toHaveLength(0);
    });

    it('should preserve links when sending messages', async () => {
        const user = userEvent.setup();
        
        render(
            <RichMessageEditor 
                onSendMessage={mockOnSendMessage}
                placeholder="Type a message..."
            />
        );

        const editor = screen.getByRole('textbox');
        
        // Type a message with a URL
        await user.type(editor, 'Check https://example.com{enter}');
        
        // Verify the message was sent with proper link serialization
        expect(mockOnSendMessage).toHaveBeenCalledTimes(1);
        const sentContent = mockOnSendMessage.mock.calls[0][0];
        
        // The serialized content should contain link information
        expect(JSON.stringify(sentContent)).toContain('https://example.com');
    });

    it('should apply proper CSS classes to links', async () => {
        const user = userEvent.setup();
        
        render(
            <RichMessageEditor 
                onSendMessage={mockOnSendMessage}
                placeholder="Type a message..."
            />
        );

        const editor = screen.getByRole('textbox');
        
        // Type a URL
        await user.type(editor, 'Visit https://example.com');
        
        // Wait for auto-detection
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // The link should have proper CSS classes
        const link = screen.getByRole('link', { name: /https:\/\/example\.com/ });
        expect(link).toHaveClass('text-blue-600', 'hover:text-blue-800', 'hover:underline', 'cursor-pointer');
    });
});