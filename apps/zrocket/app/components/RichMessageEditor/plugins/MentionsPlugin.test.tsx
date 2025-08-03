import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RichMessageEditor } from '../RichMessageEditor';

// Mock the fetch function for user search
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockUsers = [
    {
        _id: 'user1',
        username: 'johndoe',
        name: 'John Doe',
        email: 'john@example.com'
    },
    {
        _id: 'user2', 
        username: 'janedoe',
        name: 'Jane Doe',
        email: 'jane@example.com'
    }
];

describe('MentionsPlugin Integration', () => {
    beforeEach(() => {
        mockFetch.mockClear();
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => mockUsers
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should render the editor with mentions plugin', () => {
        const onSendMessage = vi.fn();
        
        render(
            <RichMessageEditor onSendMessage={onSendMessage} />
        );

        // Should render the editor
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should detect @ character and trigger user search', async () => {
        const onSendMessage = vi.fn();
        const user = userEvent.setup();
        
        render(
            <RichMessageEditor onSendMessage={onSendMessage} />
        );

        const editor = screen.getByRole('textbox');
        
        // Type @ to trigger mention detection
        await user.type(editor, '@john');

        // Should call the user search API
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/users?q=john&limit=10')
            );
        });
    });

    it('should show dropdown when users are found', async () => {
        const onSendMessage = vi.fn();
        const user = userEvent.setup();
        
        render(
            <RichMessageEditor onSendMessage={onSendMessage} />
        );

        const editor = screen.getByRole('textbox');
        
        // Type @ to trigger mention detection
        await user.type(editor, '@john');

        // Wait for dropdown to appear
        await waitFor(() => {
            expect(screen.getByText('@johndoe')).toBeInTheDocument();
        });

        // Should show user's name
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should handle empty search results', async () => {
        const onSendMessage = vi.fn();
        const user = userEvent.setup();
        
        // Mock empty results
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => []
        });
        
        render(
            <RichMessageEditor onSendMessage={onSendMessage} />
        );

        const editor = screen.getByRole('textbox');
        
        // Type @ to trigger mention detection
        await user.type(editor, '@nonexistent');

        // Should call the API but not show dropdown
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/users?q=nonexistent&limit=10')
            );
        });

        // Should not show dropdown for empty results
        expect(screen.queryByText('@johndoe')).not.toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
        const onSendMessage = vi.fn();
        const user = userEvent.setup();
        
        // Mock API error
        mockFetch.mockRejectedValueOnce(new Error('API Error'));
        
        render(
            <RichMessageEditor onSendMessage={onSendMessage} />
        );

        const editor = screen.getByRole('textbox');
        
        // Type @ to trigger mention detection
        await user.type(editor, '@john');

        // Should handle error without crashing
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalled();
        });

        // Should not show dropdown on error
        expect(screen.queryByText('@johndoe')).not.toBeInTheDocument();
    });

    it('should debounce search requests', async () => {
        const onSendMessage = vi.fn();
        const user = userEvent.setup();
        
        render(
            <RichMessageEditor onSendMessage={onSendMessage} />
        );

        const editor = screen.getByRole('textbox');
        
        // Type rapidly
        await user.type(editor, '@j');
        await user.type(editor, 'o');
        await user.type(editor, 'h');
        await user.type(editor, 'n');

        // Should debounce and only make one final request
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/users?q=john&limit=10')
            );
        }, { timeout: 500 });
    });

    it('should select user on click', async () => {
        const onSendMessage = vi.fn();
        const user = userEvent.setup();
        
        render(
            <RichMessageEditor onSendMessage={onSendMessage} />
        );

        const editor = screen.getByRole('textbox');
        
        // Type @ to trigger mention detection
        await user.type(editor, '@john');

        // Wait for dropdown to appear
        await waitFor(() => {
            expect(screen.getByText('@johndoe')).toBeInTheDocument();
        });

        // Click on the user
        await user.click(screen.getByText('@johndoe'));

        // Should insert mention and close dropdown
        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        });
    });

    it('should handle keyboard navigation', async () => {
        const onSendMessage = vi.fn();
        const user = userEvent.setup();
        
        render(
            <RichMessageEditor onSendMessage={onSendMessage} />
        );

        const editor = screen.getByRole('textbox');
        
        // Type @ to trigger mention detection
        await user.type(editor, '@');

        // Wait for dropdown to appear
        await waitFor(() => {
            expect(screen.getByText('@johndoe')).toBeInTheDocument();
        });

        // Test arrow key navigation
        await user.keyboard('{ArrowDown}');
        await user.keyboard('{ArrowUp}');
        
        // Test Enter to select
        await user.keyboard('{Enter}');

        // Should close dropdown after selection
        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        });
    });

    it('should close dropdown on Escape', async () => {
        const onSendMessage = vi.fn();
        const user = userEvent.setup();
        
        render(
            <RichMessageEditor onSendMessage={onSendMessage} />
        );

        const editor = screen.getByRole('textbox');
        
        // Type @ to trigger mention detection
        await user.type(editor, '@john');

        // Wait for dropdown to appear
        await waitFor(() => {
            expect(screen.getByText('@johndoe')).toBeInTheDocument();
        });

        // Press Escape
        await user.keyboard('{Escape}');

        // Should close dropdown
        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        });
    });
});