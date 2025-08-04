import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $createParagraphNode,
    $createTextNode,
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_LOW,
    KEY_DOWN_COMMAND,
    COMMAND_PRIORITY_HIGH
} from 'lexical';
import {
    $createListItemNode,
    $createListNode,
    $isListItemNode,
    $isListNode,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    REMOVE_LIST_COMMAND,
    OUTDENT_LIST_COMMAND,
    INDENT_LIST_COMMAND,
    ListItemNode,
    ListNode
} from '@lexical/list';

const MAX_LIST_DEPTH = 3;

/**
 * Custom list plugin that provides comprehensive list functionality
 * including keyboard navigation, indentation, and list behaviors
 */
export function CustomListPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        // Register list creation commands
        const removeInsertOrderedListListener = editor.registerCommand(
            INSERT_ORDERED_LIST_COMMAND,
            () => {
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        const listNode = $createListNode('number');
                        const listItemNode = $createListItemNode();
                        const textNode = $createTextNode('');
                        listItemNode.append(textNode);
                        listNode.append(listItemNode);
                        selection.insertNodes([listNode]);
                    }
                });
                return true;
            },
            COMMAND_PRIORITY_LOW
        );

        const removeInsertUnorderedListListener = editor.registerCommand(
            INSERT_UNORDERED_LIST_COMMAND,
            () => {
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        const listNode = $createListNode('bullet');
                        const listItemNode = $createListItemNode();
                        const textNode = $createTextNode('');
                        listItemNode.append(textNode);
                        listNode.append(listItemNode);
                        selection.insertNodes([listNode]);
                    }
                });
                return true;
            },
            COMMAND_PRIORITY_LOW
        );

        const removeRemoveListListener = editor.registerCommand(
            REMOVE_LIST_COMMAND,
            () => {
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        const anchorNode = selection.anchor.getNode();
                        let element = anchorNode?.getParent();
                        
                        if ($isListItemNode(element)) {
                            const listNode = element.getParent();
                            if ($isListNode(listNode)) {
                                const paragraph = $createParagraphNode();
                                element.getChildren().forEach(child => {
                                    paragraph.append(child);
                                });
                                element.replace(paragraph);
                            }
                        }
                    }
                });
                return true;
            },
            COMMAND_PRIORITY_LOW
        );

        // Handle comprehensive keyboard shortcuts for lists
        const removeKeyDownListener = editor.registerCommand(
            KEY_DOWN_COMMAND,
            (event: KeyboardEvent) => {
                const { ctrlKey, metaKey, key, shiftKey } = event;
                const isModifier = ctrlKey || metaKey;

                // Handle Ctrl/Cmd+Shift+7/8 for list creation
                if (isModifier && shiftKey) {
                    switch (key) {
                        case '7':
                            event.preventDefault();
                            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
                            return true;
                        case '8':
                            event.preventDefault();
                            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
                            return true;
                    }
                }

                // Handle Tab/Shift+Tab for indentation
                if (key === 'Tab') {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        const anchorNode = selection.anchor.getNode();
                        const element = anchorNode?.getParent();
                        
                        if ($isListItemNode(element)) {
                            event.preventDefault();
                            
                            if (shiftKey) {
                                // Shift+Tab: Outdent
                                editor.dispatchCommand(OUTDENT_LIST_COMMAND, undefined);
                            } else {
                                // Tab: Indent (with depth limit)
                                const depth = element.getValue();
                                if (depth < MAX_LIST_DEPTH - 1) {
                                    editor.dispatchCommand(INDENT_LIST_COMMAND, undefined);
                                }
                            }
                            return true;
                        }
                    }
                    return false;
                }

                // Handle Enter key in list items
                if (key === 'Enter' && !shiftKey) {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        const anchorNode = selection.anchor.getNode();
                        const element = anchorNode?.getParent();
                        
                        if ($isListItemNode(element)) {
                            // Check if the list item is empty
                            const textContent = element.getTextContent().trim();
                            
                            if (textContent === '') {
                                // If empty list item, remove it and exit list
                                event.preventDefault();
                                editor.update(() => {
                                    const paragraph = $createParagraphNode();
                                    element.replace(paragraph);
                                    paragraph.selectStart();
                                });
                                return true;
                            } else {
                                // Let the default Enter behavior create a new list item
                                // (this is handled by Lexical's built-in list behavior)
                                return false;
                            }
                        }
                    }
                }

                // Handle Backspace at beginning of list item
                if (key === 'Backspace') {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        const anchorNode = selection.anchor.getNode();
                        const element = anchorNode?.getParent();
                        
                        if ($isListItemNode(element)) {
                            // Check if cursor is at the beginning of the list item
                            const anchorOffset = selection.anchor.offset;
                            if (anchorOffset === 0) {
                                event.preventDefault();
                                
                                // Check if list item is empty
                                const textContent = element.getTextContent().trim();
                                if (textContent === '') {
                                    // Remove list formatting
                                    editor.update(() => {
                                        const paragraph = $createParagraphNode();
                                        element.replace(paragraph);
                                        paragraph.selectStart();
                                    });
                                } else {
                                    // Outdent the list item
                                    editor.dispatchCommand(OUTDENT_LIST_COMMAND, undefined);
                                }
                                return true;
                            }
                        }
                    }
                }

                return false;
            },
            COMMAND_PRIORITY_HIGH
        );

        return () => {
            removeInsertOrderedListListener();
            removeInsertUnorderedListListener();
            removeRemoveListListener();
            removeKeyDownListener();
        };
    }, [editor]);

    return null;
}