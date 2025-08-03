import type { SerializedEditorState } from 'lexical';

/**
 * Interface for the expected SerializedEditorState format as specified in the issue
 */
export interface ValidSerializedEditorState {
    root: {
        children: Array<{
            children: Array<{
                text: string;
                format?: number; // Bitfield for formatting
                style?: string;
                type?: string;
            }>;
            direction?: 'ltr' | 'rtl';
            format?: string;
            indent?: number;
            type: string;
            version: number;
        }>;
        direction: 'ltr' | 'rtl';
        format: string;
        indent: number;
        type: 'root';
        version: number;
    };
}

/**
 * Validates that a SerializedEditorState matches the expected contract format
 */
export function validateSerializedEditorState(
    state: SerializedEditorState
): boolean {
    try {
        // Check root structure
        if (!state.root) {
            console.error(
                'SerializedEditorState validation failed: missing root'
            );
            return false;
        }

        const { root } = state;

        // Validate root properties
        if (root.type !== 'root') {
            console.error(
                'SerializedEditorState validation failed: root.type is not "root"'
            );
            return false;
        }

        if (typeof root.version !== 'number') {
            console.error(
                'SerializedEditorState validation failed: root.version is not a number'
            );
            return false;
        }

        if (typeof root.format !== 'string') {
            console.error(
                'SerializedEditorState validation failed: root.format is not a string'
            );
            return false;
        }

        if (typeof root.indent !== 'number') {
            console.error(
                'SerializedEditorState validation failed: root.indent is not a number'
            );
            return false;
        }

        if (
            root.direction !== null &&
            root.direction !== 'ltr' &&
            root.direction !== 'rtl'
        ) {
            console.error(
                'SerializedEditorState validation failed: root.direction is not valid'
            );
            return false;
        }

        // Validate children array
        if (!Array.isArray(root.children)) {
            console.error(
                'SerializedEditorState validation failed: root.children is not an array'
            );
            return false;
        }

        // Validate each child (typically paragraph nodes)
        for (const child of root.children) {
            if (!validateBlockNode(child)) {
                return false;
            }
        }

        return true;
    } catch (error) {
        console.error(
            'SerializedEditorState validation failed with error:',
            error
        );
        return false;
    }
}

/**
 * Validates a block-level node (e.g., paragraph)
 */
function validateBlockNode(node: any): boolean {
    if (typeof node.type !== 'string') {
        console.error('Block node validation failed: type is not a string');
        return false;
    }

    if (typeof node.version !== 'number') {
        console.error('Block node validation failed: version is not a number');
        return false;
    }

    if (!Array.isArray(node.children)) {
        console.error('Block node validation failed: children is not an array');
        return false;
    }

    // Validate text nodes within the block
    for (const textNode of node.children) {
        if (!validateTextNode(textNode)) {
            return false;
        }
    }

    return true;
}

/**
 * Validates a text node
 */
function validateTextNode(node: any): boolean {
    if (typeof node.text !== 'string') {
        console.error('Text node validation failed: text is not a string');
        return false;
    }

    // Format should be a number (bitfield) if present
    if (node.format !== undefined && typeof node.format !== 'number') {
        console.error('Text node validation failed: format is not a number');
        return false;
    }

    // Style should be a string if present
    if (node.style !== undefined && typeof node.style !== 'string') {
        console.error('Text node validation failed: style is not a string');
        return false;
    }

    // Type should be a string if present
    if (node.type !== undefined && typeof node.type !== 'string') {
        console.error('Text node validation failed: type is not a string');
        return false;
    }

    return true;
}

/**
 * Creates an empty valid SerializedEditorState
 */
export function createEmptySerializedEditorState(): SerializedEditorState {
    return {
        root: {
            children: [],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1
        }
    };
}

/**
 * Ensures a SerializedEditorState conforms to the expected format
 * Fixes common issues automatically where possible
 */
export function ensureValidSerializedEditorState(
    state: SerializedEditorState
): SerializedEditorState {
    // If invalid or empty, return empty state
    if (!state || !state.root) {
        return createEmptySerializedEditorState();
    }

    const normalizedState = { ...state };

    // Ensure root has required properties with proper defaults
    normalizedState.root = {
        type: 'root',
        version: normalizedState.root.version || 1,
        format: normalizedState.root.format || '',
        indent: normalizedState.root.indent || 0,
        direction: normalizedState.root.direction || 'ltr',
        children: Array.isArray(normalizedState.root.children)
            ? normalizedState.root.children
            : []
    };

    // Process each child to ensure proper format
    normalizedState.root.children = normalizedState.root.children
        .map(child => {
            if (!child || typeof child !== 'object') {
                return null;
            }

            return {
                ...child,
                type: child.type || 'paragraph',
                version: child.version || 1,
                format: child.format || '',
                indent: child.indent || 0,
                direction: child.direction || null,
                children: Array.isArray(child.children)
                    ? child.children
                          .map(textNode => {
                              if (!textNode || typeof textNode !== 'object') {
                                  return null;
                              }

                              return {
                                  ...textNode,
                                  text: textNode.text || '',
                                  format:
                                      typeof textNode.format === 'number'
                                          ? textNode.format
                                          : 0,
                                  style: textNode.style || '',
                                  type: textNode.type || 'text'
                              };
                          })
                          .filter(Boolean)
                    : []
            };
        })
        .filter(Boolean);

    return normalizedState;
}
