import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $createParagraphNode,
    $createTextNode,
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_LOW,
    KEY_DOWN_COMMAND
} from 'lexical';
import {
    $createListItemNode,
    $createListNode,
    $isListItemNode,
    $isListNode,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    REMOVE_LIST_COMMAND,
    ListItemNode,
    ListNode
} from '@lexical/list';

/**
 * Custom list plugin that provides basic list functionality
 * without relying on the full LexicalListPlugin which may cause issues
 */
export function CustomListPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
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
                        const element = anchorNode?.getParent();
                        
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

        // Handle keyboard shortcuts for list creation
        const removeKeyDownListener = editor.registerCommand(
            KEY_DOWN_COMMAND,
            (event: KeyboardEvent) => {
                const { ctrlKey, metaKey, key, shiftKey } = event;
                const isModifier = ctrlKey || metaKey;

                if (!isModifier || !shiftKey) return false;

                switch (key) {
                    case '7':
                        event.preventDefault();
                        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
                        return true;
                    case '8':
                        event.preventDefault();
                        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
                        return true;
                    default:
                        return false;
                }
            },
            COMMAND_PRIORITY_LOW
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