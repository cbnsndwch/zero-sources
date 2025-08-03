import { describe, it, expect } from 'vitest';
import type { SerializedEditorState } from 'lexical';
import { 
  validateSerializedEditorState, 
  createEmptySerializedEditorState,
  ensureValidSerializedEditorState,
  type ValidSerializedEditorState
} from './serialization-utils';

describe('RichMessageEditor - Complete Integration Scenarios', () => {
  describe('Message Database Scenarios', () => {
    it('should handle message data as it would come from database', () => {
      // Simulate message data that might come from MongoDB
      const messageFromDB = {
        _id: '507f1f77bcf86cd799439011',
        roomId: 'room123',
        sender: {
          _id: 'user456',
          username: 'johndoe',
          name: 'John Doe'
        },
        contents: {
          root: {
            children: [
              {
                children: [
                  {
                    text: 'Hello everyone! ',
                    format: 0,
                    type: 'text'
                  },
                  {
                    text: 'This is important',
                    format: 1, // Bold
                    type: 'text'
                  },
                  {
                    text: ' and ',
                    format: 0,
                    type: 'text'
                  },
                  {
                    text: 'urgent',
                    format: 2, // Italic
                    type: 'text'
                  },
                  {
                    text: '!',
                    format: 0,
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
        } as SerializedEditorState,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Validate the contents field
      expect(validateSerializedEditorState(messageFromDB.contents)).toBe(true);

      // Ensure it can be safely used for editing
      const editableContent = ensureValidSerializedEditorState(messageFromDB.contents);
      expect(validateSerializedEditorState(editableContent)).toBe(true);
    });

    it('should handle legacy message formats and normalize them', () => {
      // Simulate old message format that might be missing some properties
      const legacyMessage = {
        contents: {
          root: {
            children: [
              {
                children: [
                  {
                    text: 'Legacy message text'
                    // Missing format, type, etc.
                  }
                ]
                // Missing type, version, etc.
              }
            ]
            // Missing some root properties
          }
        }
      };

      const normalizedContent = ensureValidSerializedEditorState(legacyMessage.contents as any);
      expect(validateSerializedEditorState(normalizedContent)).toBe(true);
      
      // Check that proper defaults were applied
      expect(normalizedContent.root.type).toBe('root');
      expect(normalizedContent.root.version).toBe(1);
      expect(normalizedContent.root.direction).toBe('ltr');
      
      const paragraph = normalizedContent.root.children[0];
      expect(paragraph.type).toBe('paragraph');
      expect(paragraph.version).toBe(1);
      
      const textNode = paragraph.children[0];
      expect(textNode.text).toBe('Legacy message text');
      expect(textNode.format).toBe(0);
      expect(textNode.type).toBe('text');
    });

    it('should handle empty/null messages from database', () => {
      const emptyMessages = [
        null,
        undefined,
        {},
        { root: null },
        { root: {} },
        { root: { children: null } }
      ];

      emptyMessages.forEach((emptyMessage, index) => {
        const normalized = ensureValidSerializedEditorState(emptyMessage as any);
        expect(validateSerializedEditorState(normalized), `Failed for empty message at index ${index}`).toBe(true);
        expect(normalized.root.children).toHaveLength(0);
      });
    });
  });

  describe('Real-world Message Content Scenarios', () => {
    it('should handle complex chat message with multiple formatting', () => {
      const complexMessage: SerializedEditorState = {
        root: {
          children: [
            {
              children: [
                { text: 'Hey team! Quick update on the project:', format: 0, type: 'text' }
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1
            },
            {
              children: [
                { text: '', format: 0, type: 'text' }
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1
            },
            {
              children: [
                { text: '• ', format: 0, type: 'text' },
                { text: 'Backend API', format: 1, type: 'text' }, // Bold
                { text: ' is complete ✅', format: 0, type: 'text' }
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1
            },
            {
              children: [
                { text: '• ', format: 0, type: 'text' },
                { text: 'Frontend', format: 1, type: 'text' }, // Bold
                { text: ' needs ', format: 0, type: 'text' },
                { text: 'review', format: 2, type: 'text' }, // Italic
                { text: ' 🔍', format: 0, type: 'text' }
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1
            },
            {
              children: [
                { text: '• ', format: 0, type: 'text' },
                { text: 'Testing', format: 1, type: 'text' }, // Bold
                { text: ' is ', format: 0, type: 'text' },
                { text: 'in progress', format: 9, type: 'text' } // Bold + Underline
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1
            },
            {
              children: [
                { text: '', format: 0, type: 'text' }
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1
            },
            {
              children: [
                { text: 'Next meeting: ', format: 0, type: 'text' },
                { text: 'Tomorrow at 2pm', format: 3, type: 'text' } // Bold + Italic
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

      expect(validateSerializedEditorState(complexMessage)).toBe(true);
      
      // Should handle all the different text formatting combinations
      const root = complexMessage.root;
      expect(root.children).toHaveLength(7); // 7 paragraphs
      
      // Check specific formatting
      const testingParagraph = root.children[4];
      const inProgressText = testingParagraph.children[3];
      expect(inProgressText.format).toBe(9); // Bold (1) + Underline (8) = 9
      
      const meetingParagraph = root.children[6];
      const dateText = meetingParagraph.children[1];
      expect(dateText.format).toBe(3); // Bold (1) + Italic (2) = 3
    });

    it('should handle code snippets and technical content', () => {
      const codeMessage: SerializedEditorState = {
        root: {
          children: [
            {
              children: [
                { text: 'Here\'s the fix for the bug:', format: 0, type: 'text' }
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1
            },
            {
              children: [
                { text: '', format: 0, type: 'text' }
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1
            },
            {
              children: [
                { text: 'const validateUser = (user) => {', format: 16, type: 'text' } // Code formatting
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1
            },
            {
              children: [
                { text: '  return user && user.id;', format: 16, type: 'text' } // Code formatting
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1
            },
            {
              children: [
                { text: '};', format: 16, type: 'text' } // Code formatting
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1
            },
            {
              children: [
                { text: '', format: 0, type: 'text' }
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1
            },
            {
              children: [
                { text: 'This should fix the ', format: 0, type: 'text' },
                { text: 'TypeError', format: 16, type: 'text' }, // Code formatting
                { text: ' we were seeing.', format: 0, type: 'text' }
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

      expect(validateSerializedEditorState(codeMessage)).toBe(true);
      
      // Verify code formatting (16 = code bit flag)
      const codeLines = [
        codeMessage.root.children[2].children[0], // const validateUser...
        codeMessage.root.children[3].children[0], // return user...
        codeMessage.root.children[4].children[0], // };
        codeMessage.root.children[6].children[1]  // TypeError
      ];
      
      codeLines.forEach(textNode => {
        expect(textNode.format).toBe(16); // Code formatting
      });
    });
  });

  describe('Performance and Scalability', () => {
    it('should efficiently validate and normalize large messages', () => {
      // Create a message with 100 paragraphs, each with multiple text nodes
      const children = Array.from({ length: 100 }, (_, i) => ({
        children: Array.from({ length: 10 }, (_, j) => ({
          text: `Paragraph ${i + 1}, text node ${j + 1} `,
          format: j % 8, // Cycle through different formats
          type: 'text'
        })),
        direction: 'ltr' as const,
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1
      }));

      const largeMessage: SerializedEditorState = {
        root: {
          children,
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1
        }
      };

      const startTime = performance.now();
      const isValid = validateSerializedEditorState(largeMessage);
      const endTime = performance.now();
      
      expect(isValid).toBe(true);
      expect(endTime - startTime).toBeLessThan(50); // Should validate in under 50ms
      
      // Test normalization performance
      const normalizeStartTime = performance.now();
      const normalized = ensureValidSerializedEditorState(largeMessage);
      const normalizeEndTime = performance.now();
      
      expect(validateSerializedEditorState(normalized)).toBe(true);
      expect(normalizeEndTime - normalizeStartTime).toBeLessThan(100); // Should normalize in under 100ms
    });
  });

  describe('Contract Compliance', () => {
    it('should match the exact format specified in the issue requirements', () => {
      // This is the exact format from the issue
      const issueFormat: ValidSerializedEditorState = {
        root: {
          children: [
            {
              children: [
                {
                  text: 'Hello world',
                  format: 1, // Bitfield for formatting
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

      expect(validateSerializedEditorState(issueFormat)).toBe(true);
      
      // Verify all required properties are present and correctly typed
      expect(typeof issueFormat.root.type).toBe('string');
      expect(issueFormat.root.type).toBe('root');
      expect(typeof issueFormat.root.version).toBe('number');
      expect(typeof issueFormat.root.format).toBe('string');
      expect(typeof issueFormat.root.indent).toBe('number');
      expect(issueFormat.root.direction).toMatch(/^(ltr|rtl)$/);
      expect(Array.isArray(issueFormat.root.children)).toBe(true);
      
      const paragraph = issueFormat.root.children[0];
      expect(typeof paragraph.type).toBe('string');
      expect(typeof paragraph.version).toBe('number');
      expect(Array.isArray(paragraph.children)).toBe(true);
      
      const textNode = paragraph.children[0];
      expect(typeof textNode.text).toBe('string');
      expect(typeof textNode.format).toBe('number');
      expect(typeof textNode.type).toBe('string');
    });
  });
});