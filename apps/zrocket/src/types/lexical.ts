/**
 * Local type definitions for Lexical to handle SSR compatibility issues.
 * These types mirror the ones from 'lexical' package but avoid import issues during SSR.
 */

/**
 * Minimal SerializedLexicalNode interface for typing purposes
 */
export interface SerializedLexicalNode {
    type: string;
    version: number;
    [key: string]: any;
}

/**
 * Minimal SerializedRootNode interface for typing purposes
 */
export interface SerializedRootNode<
    T extends SerializedLexicalNode = SerializedLexicalNode
> {
    children: T[];
    direction: 'ltr' | 'rtl' | null;
    format: string;
    indent: number;
    type: 'root';
    version: number;
}

/**
 * SerializedEditorState interface that matches the one from lexical
 * This can be used as a replacement when SSR import issues occur
 */
export interface SerializedEditorState<
    T extends SerializedLexicalNode = SerializedLexicalNode
> {
    root: SerializedRootNode<T>;
}
