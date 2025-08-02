/**
 * Utility functions for managing room navigation preferences
 */

export type RoomType = 'dms' | 'groups' | 'channels';

interface RoomPreferences {
    lastVisitedRooms: {
        dms?: string;
        groups?: string;
        channels?: string;
    };
    visitHistory: {
        dms: string[];
        groups: string[];
        channels: string[];
    };
}

const STORAGE_KEY = 'zrocket-room-preferences';
const MAX_HISTORY = 10;

function getStorageKey(): string {
    // In a real app, this would include user ID
    return STORAGE_KEY;
}

function getPreferences(): RoomPreferences {
    if (typeof window === 'undefined') {
        return {
            lastVisitedRooms: {},
            visitHistory: { dms: [], groups: [], channels: [] }
        };
    }

    try {
        const stored = localStorage.getItem(getStorageKey());
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.warn('Failed to parse room preferences:', error);
    }

    return {
        lastVisitedRooms: {},
        visitHistory: { dms: [], groups: [], channels: [] }
    };
}

function savePreferences(preferences: RoomPreferences): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(getStorageKey(), JSON.stringify(preferences));
    } catch (error) {
        console.warn('Failed to save room preferences:', error);
    }
}

export function getLastVisitedRoom(roomType: RoomType): string | undefined {
    const preferences = getPreferences();
    return preferences.lastVisitedRooms[roomType];
}

export function setLastVisitedRoom(roomType: RoomType, roomId: string): void {
    const preferences = getPreferences();
    
    // Update last visited
    preferences.lastVisitedRooms[roomType] = roomId;
    
    // Update visit history
    const history = preferences.visitHistory[roomType];
    const existingIndex = history.indexOf(roomId);
    
    if (existingIndex > -1) {
        // Move to front if already exists
        history.splice(existingIndex, 1);
    }
    
    history.unshift(roomId);
    
    // Keep only recent history
    if (history.length > MAX_HISTORY) {
        history.splice(MAX_HISTORY);
    }
    
    savePreferences(preferences);
}

export function getVisitHistory(roomType: RoomType): string[] {
    const preferences = getPreferences();
    return preferences.visitHistory[roomType] || [];
}

export function clearLastVisitedRoom(roomType: RoomType): void {
    const preferences = getPreferences();
    delete preferences.lastVisitedRooms[roomType];
    savePreferences(preferences);
}

export function clearAllPreferences(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(getStorageKey());
}
