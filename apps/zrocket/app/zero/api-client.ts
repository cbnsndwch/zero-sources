import type { RoomType } from '@cbnsndwch/zrocket-contracts';

/**
 * API client for chat operations.
 * Uses regular REST endpoints instead of Zero custom mutators.
 *
 * The flow is:
 * 1. Client calls REST API to write data
 * 2. NestJS service updates MongoDB
 * 3. MongoDB CDC picks up changes
 * 4. Zero cache updates and pushes to clients
 * 5. Zero queries automatically update (reactive)
 */

const API_BASE_URL =
    typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:8011';

/**
 * Send a new message to a room
 */
export async function sendMessage(input: {
    roomId: string;
    content: string;
    userId: string;
    username: string;
}): Promise<{ success: boolean; messageId: string }> {
    const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
    });

    if (!response.ok) {
        const error = await response
            .json()
            .catch(() => ({ message: 'Failed to send message' }));
        throw new Error(error.message || 'Failed to send message');
    }

    return response.json();
}

/**
 * Create a new room
 */
export async function createRoom(input: {
    type: RoomType;
    memberIds: string[];
    usernames: string[];
    name?: string;
    topic?: string;
    description?: string;
    readOnly?: boolean;
    createdBy: string;
}): Promise<{ success: boolean; roomId: string }> {
    const response = await fetch(`${API_BASE_URL}/api/rooms`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
    });

    if (!response.ok) {
        const error = await response
            .json()
            .catch(() => ({ message: 'Failed to create room' }));
        throw new Error(error.message || 'Failed to create room');
    }

    return response.json();
}

/**
 * Invite users to a room
 */
export async function inviteToRoom(input: {
    roomId: string;
    userIds: string[];
    usernames: string[];
}): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/api/rooms/invite`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
    });

    if (!response.ok) {
        const error = await response
            .json()
            .catch(() => ({ message: 'Failed to invite users' }));
        throw new Error(error.message || 'Failed to invite users');
    }

    return response.json();
}
