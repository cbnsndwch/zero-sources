import { useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';

export interface User {
    _id: string;
    username: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
}

export interface MentionDropdownRef {
    navigateUp(): void;
    navigateDown(): void;
    selectCurrent(): void;
}

export interface MentionDropdownProps {
    users: User[];
    selectedIndex: number;
    onSelect: (user: User) => void;
    onClose: () => void;
    position: { top: number; left: number };
}

export const MentionDropdown = forwardRef<MentionDropdownRef, MentionDropdownProps>(
    ({ users, selectedIndex, onSelect, onClose, position }, ref) => {
        const handleUserSelect = useCallback(
            (user: User) => {
                onSelect(user);
                onClose();
            },
            [onSelect, onClose]
        );

        const navigateUp = useCallback(() => {
            // This will be handled by the parent component
        }, []);

        const navigateDown = useCallback(() => {
            // This will be handled by the parent component
        }, []);

        const selectCurrent = useCallback(() => {
            if (users[selectedIndex]) {
                handleUserSelect(users[selectedIndex]);
            }
        }, [users, selectedIndex, handleUserSelect]);

        useImperativeHandle(ref, () => ({
            navigateUp,
            navigateDown,
            selectCurrent
        }));

        // Handle escape key to close dropdown
        useEffect(() => {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    onClose();
                }
            };

            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }, [onClose]);

        if (users.length === 0) {
            return null;
        }

        return (
            <div
                className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto min-w-[200px] max-w-[300px]"
                style={{
                    top: position.top,
                    left: position.left
                }}
            >
                {users.map((user, index) => (
                    <button
                        key={user._id}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center gap-2 ${
                            index === selectedIndex ? 'bg-blue-50 text-blue-700' : ''
                        }`}
                        onClick={() => handleUserSelect(user)}
                        onMouseEnter={(e) => {
                            // Only focus on mouse hover if last input was mouse (not keyboard navigation)
                            if (!lastInputWasKeyboard.current) {
                                e.currentTarget.focus();
                            }
                        }}
                    >
                        {user.avatarUrl ? (
                            <img
                                src={user.avatarUrl}
                                alt={`${user.username}'s avatar`}
                                className="w-6 h-6 rounded-full flex-shrink-0"
                                onError={(e) => {
                                    // Fallback to initials if image fails
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.nextElementSibling as HTMLElement;
                                    if (fallback) {
                                        fallback.style.display = 'flex';
                                    }
                                }}
                            />
                        ) : null}
                        <div
                            className={`w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600 flex-shrink-0 ${
                                user.avatarUrl ? 'hidden' : 'flex'
                            }`}
                        >
                            {(user.name || user.username || user.email)
                                ?.charAt(0)
                                .toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                                @{user.username}
                            </div>
                            {user.name && user.name !== user.username && (
                                <div className="text-xs text-gray-500 truncate">
                                    {user.name}
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        );
    }
);

MentionDropdown.displayName = 'MentionDropdown';