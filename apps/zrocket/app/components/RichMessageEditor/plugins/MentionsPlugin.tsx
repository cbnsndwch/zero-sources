import { useCallback, useEffect, useState, useRef } from 'react';
import {
    $getSelection,
    $isRangeSelection,
    $isTextNode,
    $createTextNode,
    KEY_DOWN_COMMAND,
    COMMAND_PRIORITY_LOW
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import { $createMentionNode, MentionNode } from '../nodes/MentionNode';
import {
    MentionDropdown,
    type User
} from '../components/MentionDropdown';

// Mention trigger regex - matches @ followed by optional word characters
const MENTION_REGEX = /(?:^|\s)@(\w*)$/;

async function searchUsers(query: string): Promise<User[]> {
    if (!query.trim()) {
        return [];
    }

    try {
        const response = await fetch(
            `/api/users?q=${encodeURIComponent(query)}&limit=10`
        );
        
        if (!response.ok) {
            console.error('Failed to search users:', response.statusText);
            return [];
        }

        const users = await response.json();
        return Array.isArray(users) ? users : [];
    } catch (error) {
        console.error('Error searching users:', error);
        return [];
    }
}

export function MentionsPlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    const [showDropdown, setShowDropdown] = useState(false);
    const [queryString, setQueryString] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Debounced search
    useEffect(() => {
        if (!queryString) {
            setResults([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            const users = await searchUsers(queryString);
            setResults(users);
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [queryString]);

    // Reset selected index when results change
    useEffect(() => {
        setSelectedIndex(0);
    }, [results]);

    const handleMentionInsert = useCallback(
        (user: User) => {
            editor.update(() => {
                const selection = $getSelection();

                if (!$isRangeSelection(selection)) {
                    return;
                }

                const anchorNode = selection.anchor.getNode();
                if (!$isTextNode(anchorNode)) {
                    return;
                }

                const textContent = anchorNode.getTextContent();
                const match = textContent.match(MENTION_REGEX);
                
                if (match) {
                    const matchIndex = textContent.lastIndexOf('@');
                    
                    // Create the mention node
                    const mentionNode = $createMentionNode({
                        mentionID: user._id,
                        username: user.username,
                        name: user.name
                    });

                    // Split the text node at the @ symbol
                    const beforeText = textContent.slice(0, matchIndex);
                    const afterText = textContent.slice(matchIndex + match[0].length);

                    replaceTextNodeWithMention(anchorNode, mentionNode, beforeText, afterText);
                }

                setShowDropdown(false);
                setQueryString('');
                setResults([]);
            });
        },
        [editor]
    );

    const handleKeyNavigation = useCallback(
        (event: KeyboardEvent): boolean => {
            if (!showDropdown || results.length === 0) {
                return false;
            }

            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    setSelectedIndex(prev => (prev + 1) % results.length);
                    return true;
                case 'ArrowUp':
                    event.preventDefault();
                    setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
                    return true;
                case 'Enter':
                    event.preventDefault();
                    if (results[selectedIndex]) {
                        handleMentionInsert(results[selectedIndex]);
                    }
                    return true;
                case 'Escape':
                    event.preventDefault();
                    setShowDropdown(false);
                    setQueryString('');
                    setResults([]);
                    return true;
                default:
                    return false;
            }
        },
        [showDropdown, results, selectedIndex, handleMentionInsert]
    );

    useEffect(() => {
        return editor.registerCommand(
            KEY_DOWN_COMMAND,
            handleKeyNavigation,
            COMMAND_PRIORITY_LOW
        );
    }, [editor, handleKeyNavigation]);

    useEffect(() => {
        const updateListener = editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
                    setShowDropdown(false);
                    return;
                }

                const anchorNode = selection.anchor.getNode();
                if (!$isTextNode(anchorNode)) {
                    setShowDropdown(false);
                    return;
                }

                const textContent = anchorNode.getTextContent();
                const cursorOffset = selection.anchor.offset;
                const textBeforeCursor = textContent.slice(0, cursorOffset);
                const match = textBeforeCursor.match(MENTION_REGEX);

                if (match) {
                    const query = match[1] || '';
                    setQueryString(query);
                    setShowDropdown(true);
                } else {
                    setShowDropdown(false);
                    setQueryString('');
                }
            });
        });

        return updateListener;
    }, [editor]);

    if (!showDropdown || results.length === 0) {
        return null;
    }

    return (
        <MentionDropdown
            users={results}
            selectedIndex={selectedIndex}
            onSelect={handleMentionInsert}
            onClose={() => {
                setShowDropdown(false);
                setQueryString('');
                setResults([]);
            }}
            position={{ top: 0, left: 0 }} // Will be calculated by the component
        />
    );
}