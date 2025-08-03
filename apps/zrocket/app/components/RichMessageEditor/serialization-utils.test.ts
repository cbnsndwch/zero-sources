import { describe, it, expect } from 'vitest';
import type { SerializedEditorState } from 'lexical';

import { 
  validateSerializedEditorState, 
  createEmptySerializedEditorState,
  ensureValidSerializedEditorState
} from './serialization-utils';

describe('SerializedEditorState Validation', () => {
  describe('validateSerializedEditorState', () => {
    it('should validate empty state', () => {
      const emptyState = createEmptySerializedEditorState();
      expect(validateSerializedEditorState(emptyState)).toBe(true);
    });

    it('should validate simple text content', () => {
      const simpleState: SerializedEditorState = {
        root: {
          children: [
            {
              children: [
                {
                  text: 'Hello world',
                  format: 0,
                  style: '',
                  type: 'text'
                }
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1
            }
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1
        }
      };

      expect(validateSerializedEditorState(simpleState)).toBe(true);
    });

    it('should validate formatted text (bold)', () => {
      const boldState: SerializedEditorState = {
        root: {
          children: [
            {
              children: [
                {
                  text: 'Bold text',
                  format: 1, // Bold bit flag
                  style: '',
                  type: 'text'
                }
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1
            }
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1
        }
      };

      expect(validateSerializedEditorState(boldState)).toBe(true);
    });

    it('should validate complex formatted text', () => {
      const complexState: SerializedEditorState = {
        root: {
          children: [
            {
              children: [
                {
                  text: 'Normal text ',
                  format: 0,
                  type: 'text'
                },
                {
                  text: 'bold',
                  format: 1, // Bold
                  type: 'text'
                },
                {
                  text: ' and ',
                  format: 0,
                  type: 'text'
                },
                {
                  text: 'italic',
                  format: 2, // Italic
                  type: 'text'
                },
                {
                  text: ' and ',
                  format: 0,
                  type: 'text'
                },
                {
                  text: 'bold italic',
                  format: 3, // Bold + Italic
                  type: 'text'
                }
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1
            }
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1
        }
      };

      expect(validateSerializedEditorState(complexState)).toBe(true);
    });

    it('should reject invalid root type', () => {
      const invalidState = {
        root: {
          children: [],
          direction: 'ltr' as const,
          format: '',
          indent: 0,
          type: 'invalid', // Should be 'root'
          version: 1
        }
      };

      expect(validateSerializedEditorState(invalidState)).toBe(false);
    });

    it('should reject missing root', () => {
      const invalidState = {} as SerializedEditorState;
      expect(validateSerializedEditorState(invalidState)).toBe(false);
    });

    it('should reject invalid text node format', () => {
      const invalidState: any = {
        root: {
          children: [
            {
              children: [
                {
                  text: 'Hello',
                  format: 'invalid', // Should be number
                  type: 'text'
                }
              ],
              type: 'paragraph',
              version: 1
            }
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1
        }
      };

      expect(validateSerializedEditorState(invalidState)).toBe(false);
    });
  });

  describe('createEmptySerializedEditorState', () => {
    it('should create valid empty state', () => {
      const emptyState = createEmptySerializedEditorState();
      
      expect(emptyState.root.type).toBe('root');
      expect(emptyState.root.children).toHaveLength(0);
      expect(emptyState.root.direction).toBe('ltr');
      expect(emptyState.root.format).toBe('');
      expect(emptyState.root.indent).toBe(0);
      expect(emptyState.root.version).toBe(1);
      
      expect(validateSerializedEditorState(emptyState)).toBe(true);
    });
  });

  describe('ensureValidSerializedEditorState', () => {
    it('should fix missing root', () => {
      const invalidState = {} as SerializedEditorState;
      const fixed = ensureValidSerializedEditorState(invalidState);
      
      expect(validateSerializedEditorState(fixed)).toBe(true);
      expect(fixed.root.type).toBe('root');
    });

    it('should fix missing properties', () => {
      const incompleteState: any = {
        root: {
          children: [
            {
              children: [
                {
                  text: 'Hello'
                  // Missing format, style, type
                }
              ]
              // Missing type, version, etc.
            }
          ]
          // Missing some root properties
        }
      };

      const fixed = ensureValidSerializedEditorState(incompleteState);
      expect(validateSerializedEditorState(fixed)).toBe(true);
      
      // Check that defaults were applied
      expect(fixed.root.format).toBe('');
      expect(fixed.root.indent).toBe(0);
      expect(fixed.root.direction).toBe('ltr');
      expect(fixed.root.version).toBe(1);
      
      const paragraph = fixed.root.children[0];
      expect(paragraph.type).toBe('paragraph');
      expect(paragraph.version).toBe(1);
      
      const textNode = paragraph.children[0];
      expect(textNode.text).toBe('Hello');
      expect(textNode.format).toBe(0);
      expect(textNode.style).toBe('');
      expect(textNode.type).toBe('text');
    });

    it('should preserve valid data', () => {
      const validState = createEmptySerializedEditorState();
      const result = ensureValidSerializedEditorState(validState);
      
      expect(result).toEqual(validState);
    });
  });

  describe('Text formatting bitfields', () => {
    it('should understand format bitfield values', () => {
      // Based on Lexical's TEXT_TYPE_TO_FORMAT constants
      const FORMAT_BOLD = 1;
      const FORMAT_ITALIC = 2;
      const FORMAT_STRIKETHROUGH = 4;
      const FORMAT_UNDERLINE = 8;
      const _FORMAT_CODE = 16;
      const _FORMAT_SUBSCRIPT = 32;
      const _FORMAT_SUPERSCRIPT = 64;

      // Test combinations
      const boldItalic = FORMAT_BOLD | FORMAT_ITALIC;
      expect(boldItalic).toBe(3);

      const allFormats = FORMAT_BOLD | FORMAT_ITALIC | FORMAT_STRIKETHROUGH | FORMAT_UNDERLINE;
      expect(allFormats).toBe(15);

      // Test bit checking
      expect(boldItalic & FORMAT_BOLD).toBeTruthy();
      expect(boldItalic & FORMAT_ITALIC).toBeTruthy();
      expect(boldItalic & FORMAT_UNDERLINE).toBeFalsy();
    });

    it('should validate states with various formatting', () => {
      const formattedState: SerializedEditorState = {
        root: {
          children: [
            {
              children: [
                { text: 'normal', format: 0, type: 'text' },
                { text: 'bold', format: 1, type: 'text' },
                { text: 'italic', format: 2, type: 'text' },
                { text: 'bold+italic', format: 3, type: 'text' },
                { text: 'underline', format: 8, type: 'text' },
                { text: 'code', format: 16, type: 'text' }
              ],
              type: 'paragraph',
              version: 1,
              format: '',
              indent: 0,
              direction: 'ltr'
            }
          ],
          type: 'root',
          version: 1,
          format: '',
          indent: 0,
          direction: 'ltr'
        }
      };

      expect(validateSerializedEditorState(formattedState)).toBe(true);
    });
  });
});