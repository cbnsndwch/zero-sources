import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
    $getSelection,
    $isNodeSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_NORMAL,
    PASTE_COMMAND,
    type LexicalEditor
} from 'lexical';
import { useEffect } from 'react';

/**
 * Configuration options for paste behavior
 */
interface ClipboardPluginConfig {
    /**
     * Whether to preserve formatting when pasting
     * @default true
     */
    preserveFormatting?: boolean;

    /**
     * Maximum length for pasted content (characters)
     */
    maxPasteLength?: number;

    /**
     * Whether to show notifications for paste operations
     * @default false
     */
    showNotifications?: boolean;

    /**
     * Custom sanitization function for HTML content
     */
    sanitizeHtml?: (html: string) => string;

    /**
     * Callback when content is pasted
     */
    onPaste?: (content: {
        html?: string;
        text?: string;
        nodes?: any[];
    }) => void;
}

/**
 * Default HTML sanitization function
 * Removes potentially dangerous elements and attributes
 */
function defaultSanitizeHtml(html: string): string {
    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Remove script tags and other potentially dangerous elements
    const dangerousElements = tempDiv.querySelectorAll(
        'script, object, embed, iframe, form, input, button'
    );
    dangerousElements.forEach(el => el.remove());

    // Remove dangerous attributes
    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(el => {
        const dangerousAttrs = [
            'onclick',
            'onload',
            'onerror',
            'onmouseover',
            'onfocus',
            'onblur',
            'onchange',
            'onsubmit'
        ];
        dangerousAttrs.forEach(attr => {
            if (el.hasAttribute(attr)) {
                el.removeAttribute(attr);
            }
        });

        // Remove style attributes that could be used for XSS
        if (el.hasAttribute('style')) {
            const style = el.getAttribute('style') || '';
            // Only allow safe CSS properties
            const safeStyle = style.replace(
                /(javascript:|expression\(|@import|behavior:)/gi,
                ''
            );
            el.setAttribute('style', safeStyle);
        }
    });

    return tempDiv.innerHTML;
}

/**
 * Extracts text content from HTML while preserving basic formatting
 */
function extractTextFromHtml(html: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Convert common HTML elements to text equivalents
    const brs = tempDiv.querySelectorAll('br');
    brs.forEach(br => br.replaceWith('\n'));

    const ps = tempDiv.querySelectorAll('p, div');
    ps.forEach(p => {
        if (p.nextSibling) {
            p.insertAdjacentText('afterend', '\n');
        }
    });

    return tempDiv.textContent || '';
}

/**
 * Handles paste operations with support for rich text, plain text, and external sources
 */
function handlePasteCommand(
    event: ClipboardEvent,
    editor: LexicalEditor,
    config: ClipboardPluginConfig = {}
): boolean {
    const {
        preserveFormatting = true,
        maxPasteLength,
        sanitizeHtml = defaultSanitizeHtml,
        onPaste
    } = config;

    const clipboardData = event.clipboardData;
    if (!clipboardData) {
        return false;
    }

    // Get HTML and text content from clipboard
    const htmlContent = clipboardData.getData('text/html');
    const textContent = clipboardData.getData('text/plain');

    // Determine what content to use
    let finalContent = '';
    let isHtmlContent = false;

    if (htmlContent && preserveFormatting) {
        // Use HTML content if available and formatting should be preserved
        finalContent = sanitizeHtml(htmlContent);
        isHtmlContent = true;
    } else if (textContent) {
        // Fall back to plain text
        finalContent = textContent;
        isHtmlContent = false;
    } else {
        // No usable content
        return false;
    }

    // Check content length limits
    const contentLength = isHtmlContent
        ? extractTextFromHtml(finalContent).length
        : finalContent.length;

    if (maxPasteLength && contentLength > maxPasteLength) {
        console.warn(
            `Paste content exceeds maximum length of ${maxPasteLength} characters`
        );
        // Truncate content if it's too long
        if (isHtmlContent) {
            const textContent = extractTextFromHtml(finalContent);
            finalContent = textContent.substring(0, maxPasteLength);
            isHtmlContent = false;
        } else {
            finalContent = finalContent.substring(0, maxPasteLength);
        }
    }

    // Insert content into editor
    editor.update(() => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection) && !$isNodeSelection(selection)) {
            return;
        }

        if (isHtmlContent) {
            // Parse HTML content and convert to Lexical nodes
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(finalContent, 'text/html');
                const nodes = $generateNodesFromDOM(editor, doc);

                if (nodes.length > 0) {
                    if ($isRangeSelection(selection)) {
                        selection.insertNodes(nodes);
                    }

                    // Call onPaste callback with parsed nodes
                    onPaste?.({ html: finalContent, nodes });
                }
            } catch (error) {
                console.error('Error parsing HTML content:', error);
                // Fall back to plain text
                if ($isRangeSelection(selection)) {
                    selection.insertText(extractTextFromHtml(finalContent));
                }
                onPaste?.({ text: extractTextFromHtml(finalContent) });
            }
        } else {
            // Insert as plain text
            if ($isRangeSelection(selection)) {
                selection.insertText(finalContent);
            }
            onPaste?.({ text: finalContent });
        }
    });

    // Prevent default paste behavior
    event.preventDefault();
    return true;
}

/**
 * Clipboard plugin that enhances paste functionality for the Lexical editor
 */
export function ClipboardPlugin(config: ClipboardPluginConfig = {}) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return mergeRegister(
            // Register paste command handler
            editor.registerCommand(
                PASTE_COMMAND,
                (event: ClipboardEvent) => {
                    return handlePasteCommand(event, editor, config);
                },
                COMMAND_PRIORITY_NORMAL
            ),

            // Register keyboard shortcut for plain text paste (Ctrl+Shift+V)
            editor.registerRootListener((rootElement, prevRootElement) => {
                if (prevRootElement !== null) {
                    prevRootElement.removeEventListener(
                        'keydown',
                        handleKeyDown
                    );
                }
                if (rootElement !== null) {
                    rootElement.addEventListener('keydown', handleKeyDown);
                }

                function handleKeyDown(event: KeyboardEvent) {
                    // Handle Ctrl+Shift+V for plain text paste
                    if (
                        event.key === 'v' &&
                        event.shiftKey &&
                        (event.ctrlKey || event.metaKey)
                    ) {
                        event.preventDefault();

                        // Check if clipboard API is available
                        if (
                            typeof navigator !== 'undefined' &&
                            navigator.clipboard &&
                            navigator.clipboard.readText
                        ) {
                            // Trigger paste with forced plain text
                            navigator.clipboard
                                .readText()
                                .then(text => {
                                    if (text) {
                                        editor.update(() => {
                                            const selection = $getSelection();
                                            if ($isRangeSelection(selection)) {
                                                selection.insertText(text);
                                            }
                                        });

                                        config.onPaste?.({ text });
                                    }
                                })
                                .catch(error => {
                                    console.warn(
                                        'Could not read clipboard for plain text paste:',
                                        error
                                    );
                                });
                        } else {
                            console.warn(
                                'Clipboard API not available for plain text paste'
                            );
                        }

                        return true;
                    }

                    return false;
                }
            })
        );
    }, [editor, config]);

    return null;
}

/**
 * Utility function to copy selected content to clipboard
 */
export function copyToClipboard(editor: LexicalEditor): Promise<boolean> {
    return new Promise(resolve => {
        // Add null check for editor
        if (!editor) {
            resolve(false);
            return;
        }

        try {
            editor.getEditorState().read(() => {
                const selection = $getSelection();

                if (!$isRangeSelection(selection)) {
                    resolve(false);
                    return;
                }

                // Generate HTML from selected nodes
                const htmlString = $generateHtmlFromNodes(editor, selection);
                const textString = selection.getTextContent();

                if (!htmlString && !textString) {
                    resolve(false);
                    return;
                }

                // Check if clipboard API is available
                if (typeof navigator === 'undefined' || !navigator.clipboard) {
                    console.warn('Clipboard API not available');
                    resolve(false);
                    return;
                }

                // Copy to clipboard
                if (navigator.clipboard.write) {
                    const clipboardItem = new ClipboardItem({
                        'text/html': new Blob([htmlString], {
                            type: 'text/html'
                        }),
                        'text/plain': new Blob([textString], {
                            type: 'text/plain'
                        })
                    });

                    navigator.clipboard
                        .write([clipboardItem])
                        .then(() => {
                            resolve(true);
                        })
                        .catch(error => {
                            console.error(
                                'Failed to copy to clipboard:',
                                error
                            );
                            // Fallback to text-only copy
                            if (navigator.clipboard.writeText) {
                                navigator.clipboard
                                    .writeText(textString)
                                    .then(() => {
                                        resolve(true);
                                    })
                                    .catch(() => {
                                        resolve(false);
                                    });
                            } else {
                                resolve(false);
                            }
                        });
                } else if (navigator.clipboard.writeText) {
                    // Fallback to text-only copy
                    navigator.clipboard
                        .writeText(textString)
                        .then(() => {
                            resolve(true);
                        })
                        .catch(() => {
                            resolve(false);
                        });
                } else {
                    resolve(false);
                }
            });
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            resolve(false);
        }
    });
}
