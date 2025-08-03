import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
        
        render(
            <RichMessageEditor onSendMessage={onSendMessage} />
        );

        const editor = screen.getByRole('textbox');
        
        // Simulate typing @ to trigger mention detection
        fireEvent.input(editor, { target: { textContent: '@john' } });

        // Should call the user search API
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/users?q=john&limit=10')
            );
        });
    });

    it('should handle empty search results', async () => {
        const onSendMessage = vi.fn();
        
        // Mock empty results
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => []
        });
        
        render(
            <RichMessageEditor onSendMessage={onSendMessage} />
        );

        const editor = screen.getByRole('textbox');
        
        // Simulate typing @ to trigger mention detection
        fireEvent.input(editor, { target: { textContent: '@nonexistent' } });

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
        
        // Mock API error
        mockFetch.mockRejectedValueOnce(new Error('API Error'));
        
        render(
            <RichMessageEditor onSendMessage={onSendMessage} />
        );

        const editor = screen.getByRole('textbox');
        
        // Simulate typing @ to trigger mention detection
        fireEvent.input(editor, { target: { textContent: '@john' } });

        // Should handle error without crashing
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalled();
        });

        // Should not show dropdown on error
        expect(screen.queryByText('@johndoe')).not.toBeInTheDocument();
    });
});