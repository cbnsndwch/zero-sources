# Comprehensive Testing Strategy & Quality Assurance

# Rich Message Composer - Lexical Integration

**Project**: Rich Message Composer  
**Version**: 1.0.0  
**Date**: January 2025  
**Status**: Draft  
**Document Type**: Consolidated Testing Strategy

---

## 1. Testing Overview

### 1.1 Testing Philosophy & Objectives

Our testing strategy follows a **comprehensive, multi-layered approach** to ensure the Rich Message Composer meets the highest standards of quality, reliability, and user experience.

**Core Principles**:

- **Prevention over Detection**: Catch issues early in development
- **User-Centric**: Focus on real user scenarios and workflows
- **Automation First**: Prioritize automated testing for efficiency
- **Accessibility Priority**: Ensure inclusive design from the start
- **Performance Vigilance**: Monitor performance impacts continuously

**Primary Goals:**

- Verify all user stories and acceptance criteria
- Ensure SerializedEditorState compatibility with existing contracts
- Validate performance benchmarks across all scenarios
- Confirm accessibility compliance (WCAG 2.1 AA)
- Guarantee cross-browser and cross-platform compatibility

### 1.2 Testing Pyramid & Strategy

```
                    E2E Tests (10%)
                 ┌─────────────────┐
                 │  User Journeys  │
                 │  Integration    │
                 └─────────────────┘

            Integration Tests (30%)
         ┌─────────────────────────────┐
         │    Component Integration    │
         │    API Integration         │
         │    Cross-Browser Testing   │
         └─────────────────────────────┘

      Unit Tests (60%)
   ┌─────────────────────────────────────┐
   │     Component Tests                  │
   │     Hook Tests                      │
   │     Utility Function Tests          │
   │     Plugin Tests                    │
   └─────────────────────────────────────┘
```

### 1.3 Quality Targets

| Metric                          | Target                  | Critical Threshold |
| ------------------------------- | ----------------------- | ------------------ |
| Unit Test Coverage              | >90%                    | >85%               |
| Integration Test Coverage       | >80%                    | >75%               |
| E2E Critical Path Coverage      | 100%                    | 100%               |
| Accessibility Compliance        | WCAG 2.1 AA             | WCAG 2.1 A         |
| Performance (Keystroke Latency) | <16ms                   | <50ms              |
| Performance (Initial Load)      | <100ms                  | <200ms             |
| Cross-browser Compatibility     | 100% on target browsers | 95%                |

### 1.4 Testing Tools and Frameworks

- **Unit Testing**: Jest, React Testing Library, Vitest
- **Integration Testing**: Jest, Playwright
- **E2E Testing**: Playwright, Cypress
- **Performance Testing**: Lighthouse, WebPageTest
- **Accessibility Testing**: axe-core, Pa11y
- **Visual Regression**: Chromatic, Percy
- **Cross-Browser**: BrowserStack, Sauce Labs

---

## 2. Test Pyramid Strategy

### 2.1 Unit Tests (70% of total tests)

**Focus**: Individual components, functions, and plugins in isolation

**Coverage Areas**:

- Component rendering and props handling
- Plugin functionality and edge cases
- Utility functions and helpers
- State management logic
- Serialization/deserialization accuracy

**Tools**: Vitest, React Testing Library, Jest DOM

### 2.2 Integration Tests (20% of total tests)

**Focus**: Component interactions and system integration

**Coverage Areas**:

- Editor plugin interactions
- Component communication
- Data flow between layers
- Error handling across components
- Feature integration scenarios

**Tools**: Vitest, React Testing Library, MSW for API mocking

### 2.3 End-to-End Tests (10% of total tests)

**Focus**: Complete user workflows and critical paths

**Coverage Areas**:

- Complete message composition and sending
- Rich text formatting workflows
- Mention system functionality
- Cross-browser behavior
- Accessibility user journeys

**Tools**: Playwright, Axe-core for accessibility

---

## 3. Unit Testing Strategy

### 3.1 Component Testing

#### 3.1.1 RichMessageEditor Tests

```typescript
// components/RichMessageEditor/RichMessageEditor.test.tsx
describe('RichMessageEditor', () => {
  describe('Basic Functionality', () => {
    it('should render with placeholder text', () => {
      render(<RichMessageEditor placeholder="Type a message..." />);
      expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    });

    it('should emit SerializedEditorState on content change', async () => {
      const onContentChange = jest.fn();
      render(<RichMessageEditor onContentChange={onContentChange} />);

      await user.type(screen.getByRole('textbox'), 'Hello world');

      expect(onContentChange).toHaveBeenCalledWith(
        expect.objectContaining({
          root: expect.objectContaining({
            type: 'root',
            children: expect.arrayContaining([
              expect.objectContaining({
                type: 'paragraph'
              })
            ])
          })
        })
      );
    });

    it('should handle send message on Enter key', async () => {
      const onSendMessage = jest.fn();
      render(<RichMessageEditor onSendMessage={onSendMessage} />);

      const textbox = screen.getByRole('textbox');
      await user.type(textbox, 'Hello world');
      await user.keyboard('{Enter}');

      expect(onSendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          root: expect.objectContaining({
            type: 'root'
          })
        })
      );
    });
  });

  describe('Rich Text Formatting', () => {
    it('should apply bold formatting with Ctrl+B', async () => {
      render(<RichMessageEditor />);

      const textbox = screen.getByRole('textbox');
      await user.type(textbox, 'Hello world');
      await user.keyboard('{Control>}a{/Control}');
      await user.keyboard('{Control>}b{/Control}');

      // Verify bold formatting is applied
      expect(screen.getByRole('textbox')).toHaveTextContent('Hello world');
      // Additional assertion for bold formatting in DOM
    });

    it('should create lists with toolbar buttons', async () => {
      render(<RichMessageEditor />);

      await user.type(screen.getByRole('textbox'), 'Item 1');
      await user.click(screen.getByLabelText('Bulleted list'));

      // Verify list is created
      expect(screen.getByRole('listitem')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid initial content gracefully', () => {
      const invalidContent = { invalid: 'data' } as any;

      expect(() => {
        render(<RichMessageEditor initialContent={invalidContent} />);
      }).not.toThrow();
    });

    it('should recover from plugin errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Simulate plugin error
      render(<RichMessageEditor />);

      // Verify component still renders
      expect(screen.getByRole('textbox')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });
});
```

#### RichMessageEditor Component

```typescript
describe('RichMessageEditor', () => {
    describe('Initialization', () => {
        it('should render with default configuration', () => {});
        it('should apply custom theme correctly', () => {});
        it('should handle initialization errors gracefully', () => {});
        it('should restore content from initialContent prop', () => {});
    });

    describe('User Interaction', () => {
        it('should handle keyboard shortcuts correctly', () => {});
        it('should call onSendMessage when Enter is pressed', () => {});
        it('should create new line when Shift+Enter is pressed', () => {});
        it('should handle text selection and formatting', () => {});
    });

    describe('Content Management', () => {
        it('should serialize content to correct format', () => {});
        it('should validate content before sending', () => {});
        it('should handle empty content appropriately', () => {});
        it('should preserve formatting in serialization', () => {});
    });

    describe('Error Handling', () => {
        it('should recover from serialization errors', () => {});
        it('should fallback to plain text on critical errors', () => {});
        it('should preserve user content during errors', () => {});
    });
});
```

#### Plugin Testing

```typescript
// plugins/MentionsPlugin/MentionsPlugin.test.tsx
describe('MentionsPlugin', () => {
  const mockUsers = [
    { id: '1', username: 'john', displayName: 'John Doe' },
    { id: '2', username: 'jane', displayName: 'Jane Smith' }
  ];

  it('should trigger autocomplete on @ symbol', async () => {
    render(<TestEditor plugins={[MentionsPlugin]} users={mockUsers} />);

    await user.type(screen.getByRole('textbox'), '@jo');

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should create mention node on selection', async () => {
    const onMentionCreate = jest.fn();
    render(
      <TestEditor
        plugins={[MentionsPlugin]}
        onMentionCreate={onMentionCreate}
      />
    );

    await user.type(screen.getByRole('textbox'), '@jo');
    await user.click(screen.getByText('John Doe'));

    expect(onMentionCreate).toHaveBeenCalledWith({
      id: '1',
      username: 'john',
      displayName: 'John Doe'
    });
  });

  it('should handle keyboard navigation in autocomplete', async () => {
    render(<TestEditor plugins={[MentionsPlugin]} users={mockUsers} />);

    await user.type(screen.getByRole('textbox'), '@');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    // Verify first user is selected
    expect(screen.getByText('@john')).toBeInTheDocument();
  });
});

describe('MentionsPlugin', () => {
    describe('Mention Detection', () => {
        it('should trigger autocomplete on @ character', () => {});
        it('should filter users based on typed text', () => {});
        it('should handle keyboard navigation in dropdown', () => {});
        it('should create mention node on selection', () => {});
    });

    describe('Mention Rendering', () => {
        it('should render mentions with correct styling', () => {});
        it('should handle mention click events', () => {});
        it('should serialize mention data correctly', () => {});
    });

    describe('Edge Cases', () => {
        it('should handle @ at end of message', () => {});
        it('should handle multiple @ characters', () => {});
        it('should handle mention deletion', () => {});
    });
});

describe('ToolbarPlugin', () => {
    describe('Toolbar Visibility', () => {
        it('should show toolbar on text selection', () => {});
        it('should hide toolbar when selection is lost', () => {});
        it('should position toolbar correctly', () => {});
        it('should handle off-screen positioning', () => {});
    });

    describe('Formatting Actions', () => {
        it('should apply bold formatting on button click', () => {});
        it('should remove formatting when already applied', () => {});
        it('should update button states based on selection', () => {});
    });
});
```

### 3.2 Hook Testing

```typescript
// hooks/useMessageEditor.test.ts
describe('useMessageEditor', () => {
    it('should initialize with empty editor state', () => {
        const { result } = renderHook(() => useMessageEditor());

        expect(result.current.editorState).toBeNull();
        expect(result.current.isDirty).toBe(false);
    });

    it('should track dirty state on content change', () => {
        const { result } = renderHook(() => useMessageEditor());

        act(() => {
            result.current.handleContentChange(mockEditorState);
        });

        expect(result.current.isDirty).toBe(true);
        expect(result.current.editorState).toBe(mockEditorState);
    });

    it('should clear editor and reset dirty state', () => {
        const { result } = renderHook(() => useMessageEditor());

        act(() => {
            result.current.handleContentChange(mockEditorState);
            result.current.clearEditor();
        });

        expect(result.current.editorState).toBeNull();
        expect(result.current.isDirty).toBe(false);
    });
});
```

### 3.2 Hook Testing

```typescript
// hooks/useMessageEditor.test.ts
describe('useMessageEditor', () => {
    it('should initialize with empty editor state', () => {
        const { result } = renderHook(() => useMessageEditor());

        expect(result.current.editorState).toBeNull();
        expect(result.current.isDirty).toBe(false);
    });

    it('should track dirty state on content change', () => {
        const { result } = renderHook(() => useMessageEditor());

        act(() => {
            result.current.handleContentChange(mockEditorState);
        });

        expect(result.current.isDirty).toBe(true);
        expect(result.current.editorState).toBe(mockEditorState);
    });

    it('should clear editor and reset dirty state', () => {
        const { result } = renderHook(() => useMessageEditor());

        act(() => {
            result.current.handleContentChange(mockEditorState);
            result.current.clearEditor();
        });

        expect(result.current.editorState).toBeNull();
        expect(result.current.isDirty).toBe(false);
    });
});
```

### 3.3 Utility Function Testing

```typescript
// utils/serialization.test.ts
describe('Serialization Utils', () => {
    describe('normalizeContent', () => {
        it('should convert plain text to SerializedEditorState', () => {
            const plainText = 'Hello world';
            const result = normalizeContent(plainText);

            expect(result).toMatchObject({
                root: {
                    type: 'root',
                    children: [
                        {
                            type: 'paragraph',
                            children: [
                                {
                                    type: 'text',
                                    text: 'Hello world'
                                }
                            ]
                        }
                    ]
                }
            });
        });

        it('should pass through valid SerializedEditorState', () => {
            const validState = createMockEditorState();
            const result = normalizeContent(validState);

            expect(result).toBe(validState);
        });
    });

    describe('validateEditorState', () => {
        it('should return true for valid editor state', () => {
            const validState = createMockEditorState();
            expect(validateEditorState(validState)).toBe(true);
        });

        it('should return false for invalid editor state', () => {
            const invalidState = { invalid: 'data' };
            expect(validateEditorState(invalidState)).toBe(false);
        });
    });

    describe('SerializedEditorState Compliance', () => {
        it('should generate valid SerializedEditorState structure', () => {
            const input = createTestEditorState();
            const result = serializeEditorState(input);
            expect(result).toMatchSerializedEditorStateSchema();
        });

        it('should handle plain text serialization', () => {});
        it('should serialize rich text with formatting', () => {});
        it('should serialize mentions correctly', () => {});
        it('should serialize lists and links', () => {});
    });

    describe('Deserialization', () => {
        it('should deserialize valid SerializedEditorState', () => {});
        it('should handle malformed input gracefully', () => {});
        it('should preserve all formatting information', () => {});
        it('should handle version compatibility', () => {});
    });

    describe('Backward Compatibility', () => {
        it('should convert plain text to SerializedEditorState', () => {});
        it('should handle legacy message formats', () => {});
    });
});
```

### 3.4 Test Data and Fixtures

```typescript
// Test fixtures for consistent testing
export const testFixtures = {
    plainTextMessage: 'Hello, this is a plain text message.',

    richTextMessage: {
        root: {
            children: [
                {
                    children: [
                        { text: 'This is ' },
                        { text: 'bold', format: 1 },
                        { text: ' and ' },
                        { text: 'italic', format: 2 },
                        { text: ' text.' }
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
    },

    messageWithMentions: {
        // SerializedEditorState with mention nodes
    },

    messageWithLinks: {
        // SerializedEditorState with link nodes
    },

    invalidSerializedState: {
        // Malformed data for error handling tests
    }
};

// testUtils/factories.ts
export const createMockEditorState = (
    content = 'Test content'
): SerializedEditorState => ({
    root: {
        type: 'root',
        version: 1,
        children: [
            {
                type: 'paragraph',
                children: [
                    {
                        type: 'text',
                        text: content
                    }
                ]
            }
        ],
        direction: 'ltr',
        format: '',
        indent: 0
    }
});

export const createMockUser = (overrides = {}): User => ({
    id: '1',
    username: 'testuser',
    displayName: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    ...overrides
});
```
                    version: 1
                }
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1
        }
    },

    messageWithMentions: {
        // SerializedEditorState with mention nodes
    },

    messageWithLinks: {
        // SerializedEditorState with link nodes
    },

    invalidSerializedState: {
        // Malformed data for error handling tests
    }
};
```

---

## 4. Integration Testing Strategy

### 4.1 Component Integration Tests

```typescript
// integration/EditorIntegration.test.tsx
describe('Editor Integration', () => {
  it('should work with complete plugin setup', async () => {
    const plugins = [
      RichTextPlugin,
      HistoryPlugin,
      AutoLinkPlugin,
      MentionsPlugin,
      ListPlugin
    ];

    render(<RichMessageEditor plugins={plugins} />);

    // Test multiple features working together
    const textbox = screen.getByRole('textbox');
    await user.type(textbox, 'Check out https://example.com @john');

    // Verify link detection
    expect(screen.getByRole('link', { name: 'https://example.com' })).toBeInTheDocument();

    // Verify mention creation
    expect(screen.getByText('@john')).toBeInTheDocument();
  });

  it('should maintain serialization consistency across features', async () => {
    const onContentChange = jest.fn();
    render(<RichMessageEditor onContentChange={onContentChange} />);

    // Create complex content with multiple features
    await user.type(screen.getByRole('textbox'), '**Bold** text with @mention');
    await user.keyboard('{Control>}b{/Control}'); // Bold formatting

    const calls = onContentChange.mock.calls;
    const finalState = calls[calls.length - 1][0];

    // Verify complex state is valid
    expect(validateEditorState(finalState)).toBe(true);

    // Test round-trip serialization
    const roundTrip = JSON.parse(JSON.stringify(finalState));
    expect(validateEditorState(roundTrip)).toBe(true);
  });
});

describe('Plugin Integration', () => {
    describe('Rich Text + History Integration', () => {
        it('should undo/redo formatting changes correctly', () => {});
        it('should maintain history across different plugins', () => {});
    });

    describe('Mentions + AutoLink Integration', () => {
        it('should not conflict when @ appears in URLs', () => {});
        it('should handle mentions followed by links', () => {});
    });

    describe('Toolbar + All Plugins', () => {
        it('should show correct state for all formatting types', () => {});
        it('should work with mentions and links', () => {});
    });
});
```

### 4.2 Application Integration Tests

```typescript
// integration/ApplicationIntegration.test.tsx
describe('Application Integration', () => {
  describe('ZRocket Integration', () => {
    it('should send message through Zero mutation', async () => {
      const mockSendMessage = jest.fn();

      render(
        <ZRocketChatInput
          roomId="room-123"
          roomType="channel"
          sendMessage={mockSendMessage}
        />
      );

      await user.type(screen.getByRole('textbox'), 'Hello world');
      await user.keyboard('{Enter}');

      expect(mockSendMessage).toHaveBeenCalledWith({
        roomId: 'room-123',
        content: expect.objectContaining({
          root: expect.objectContaining({
            type: 'root'
          })
        })
      });
    });
  });
});
```

### 4.3 Editor State Flow Tests

```typescript
describe('Editor State Flow', () => {
    describe('Serialization Pipeline', () => {
        it('should maintain data integrity through full pipeline', async () => {
            // Type content -> serialize -> send -> receive -> deserialize -> render
            const editor = renderEditor();

            // User types formatted content
            await userEvent.type(editor, 'Hello **world**');
            await userEvent.keyboard('{Control>}b{/Control}'); // Bold

            // Serialize content
            const serialized = await getSerializedContent(editor);

            // Simulate sending and receiving
            const received = await simulateMessageFlow(serialized);

            // Deserialize and render in new editor
            const newEditor = renderEditor({ initialContent: received });

            // Verify content is identical
            expect(getEditorContent(newEditor)).toBe(getEditorContent(editor));
        });
    });

    describe('Draft Persistence Flow', () => {
        it('should save and restore drafts correctly', () => {});
        it('should clear drafts on message send', () => {});
        it('should handle storage failures gracefully', () => {});
    });
});
```

### 4.4 Cross-Browser Testing

```typescript
// integration/CrossBrowser.test.ts
describe('Cross-Browser Compatibility', () => {
    const browsers = ['chromium', 'firefox', 'webkit'];

    browsers.forEach(browserName => {
        describe(`${browserName}`, () => {
            it('should handle basic text input', async ({ browser }) => {
                const page = await browser.newPage();
                await page.goto('/test-editor');

                await page.fill('[data-testid="editor"]', 'Hello world');
                expect(await page.textContent('[data-testid="editor"]')).toBe(
                    'Hello world'
                );
            });

            it('should support keyboard shortcuts', async ({ browser }) => {
                const page = await browser.newPage();
                await page.goto('/test-editor');

                await page.fill('[data-testid="editor"]', 'Bold text');
                await page.keyboard.press('Control+A');
                await page.keyboard.press('Control+B');

                // Verify bold formatting applied
                expect(
                    await page.locator('[data-testid="editor"] strong').count()
                ).toBe(1);
            });

            it('should handle performance requirements', async ({ browser }) => {
                const page = await browser.newPage();
                await page.goto('/test-editor');

                const startTime = Date.now();
                await page.fill('[data-testid="editor"]', 'A'.repeat(1000));
                const endTime = Date.now();

                expect(endTime - startTime).toBeLessThan(100); // <100ms
            });
        });
    });
});
```

### 4.5 Error Handling Integration

```typescript
describe('Error Handling Integration', () => {
    describe('Plugin Error Recovery', () => {
        it('should isolate plugin errors from core editor', () => {});
        it('should continue functioning when plugin fails', () => {});
        it('should log errors appropriately', () => {});
    });

    describe('Serialization Error Recovery', () => {
        it('should fallback to plain text on serialization error', () => {});
        it('should preserve user content during recovery', () => {});
        it('should notify user of content degradation', () => {});
    });
});
```

---

## 5. End-to-End Testing Strategy

### 5.0 Application Route Structure

**Note**: The following E2E tests reference the actual application routes as defined in `apps/zrocket/app/routes.ts`:

**Chat Routes**:
- **Direct Messages**: `/d/[:chatId]` - One-on-one conversations. If no is is specified, the most recently visited one will be loaded
- **Private Groups**: `/p/[:chatId]` - Private group conversations. If no is is specified, the most recently visited one will be loaded
- **Public Channels**: `/c/[:channelId]` - Public channel conversations. If no is is specified, the most recently visited one will be loaded

**Other Routes**:
- **Home**: `/` - Landing page
- **Files**: `/files` - File management
- **Preferences**: `/preferences` - User settings
- **Support**: `/support` - Help and support
- **Demos**: `/demos/rich-message-editor`, `/demos/copy-paste` - Development demos

### 5.1 Critical User Journeys

#### Journey 1: Basic Message Composition

```typescript
test('User can compose and send a basic message', async ({ page }) => {
    // Navigate to a public channel (actual route format: /c/:channelId)
    await page.goto('/c');

    // Type a simple message
    const editor = page.locator('[data-testid="message-editor"]');
    await editor.click();
    await editor.type('Hello everyone!');

    // Send the message
    await page.keyboard.press('Enter');

    // Verify message appears in chat
    await expect(page.locator('[data-testid="message"]').last()).toContainText(
        'Hello everyone!'
    );
});
```

#### Journey 2: Rich Text Formatting

```typescript
test('User can apply rich text formatting', async ({ page }) => {
    // Navigate to a public channel
    await page.goto('/c');

    const editor = page.locator('[data-testid="message-editor"]');
    await editor.click();
    await editor.type('This is important text');

    // Select text
    await page.keyboard.press('Control+a');

    // Apply bold formatting
    await page.keyboard.press('Control+b');

    // Verify formatting is applied
    await expect(editor.locator('.editor-text-bold')).toContainText(
        'This is important text'
    );

    // Send message
    await page.keyboard.press('Enter');

    // Verify formatting persists in sent message
    await expect(
        page.locator('[data-testid="message"]').last().locator('strong')
    ).toContainText('This is important text');
});
```

#### Journey 3: Mention System

```typescript
test('User can mention another user', async ({ page }) => {
    // Navigate to a private group chat
    await page.goto('/p');

    const editor = page.locator('[data-testid="message-editor"]');
    await editor.click();
    await editor.type('Hey @');

    // Wait for mention dropdown
    await expect(
        page.locator('[data-testid="mention-dropdown"]')
    ).toBeVisible();

    // Type to filter users
    await editor.type('alice');

    // Select user from dropdown
    await page.locator('[data-testid="mention-option"]').first().click();

    // Verify mention is inserted
    await expect(editor.locator('.editor-mention')).toContainText('@alice');

    // Send message
    await page.keyboard.press('Enter');

    // Verify mention in sent message
    await expect(
        page
            .locator('[data-testid="message"]')
            .last()
            .locator('[data-mention-id]')
    ).toBeVisible();
});
```

#### Journey 4: Draft Persistence

```typescript
test('User drafts are saved and restored', async ({ page }) => {
    // Navigate to a public channel
    await page.goto('/c');

    // Type a draft message
    const editor = page.locator('[data-testid="message-editor"]');
    await editor.click();
    await editor.type('This is a draft message');

    // Navigate away to another channel
    await page.goto('/c');

    // Return to original channel
    await page.goto('/c');

    // Verify draft is restored
    await expect(editor).toHaveText('This is a draft message');

    // Send the message
    await page.keyboard.press('Enter');

    // Verify draft is cleared
    await expect(editor).toHaveText('');
});
```

### 5.2 Cross-Browser Testing

```typescript
// Browser-specific test configurations
const browsers = ['chromium', 'firefox', 'webkit'];

browsers.forEach(browserName => {
    test.describe(`${browserName} browser tests`, () => {
        test.use({ browserName });

        test('Rich text editor works correctly', async ({ page }) => {
            // Test all critical features in this browser
        });

        test('Keyboard shortcuts work correctly', async ({ page }) => {
            // Test browser-specific keyboard behavior
        });

        test('Performance meets targets', async ({ page }) => {
            // Browser-specific performance testing
        });
    });
});
```

### 5.3 Accessibility E2E Tests

```typescript
test.describe('Accessibility', () => {
    test('Editor is keyboard navigable', async ({ page }) => {
        // Navigate to a direct message conversation
        await page.goto('/d');

        // Navigate to editor using Tab
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab'); // Assuming editor is 2nd tabbable element

        // Verify editor receives focus
        await expect(
            page.locator('[data-testid="message-editor"]')
        ).toBeFocused();

        // Test keyboard shortcuts
        await page.keyboard.type('Bold text');
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Control+b');

        // Navigate to send button with Tab
        await page.keyboard.press('Tab');
        await expect(page.locator('[data-testid="send-button"]')).toBeFocused();

        // Send with Enter
        await page.keyboard.press('Enter');
    });

    test('Screen reader announcements work correctly', async ({ page }) => {
        // Test with virtual screen reader - navigate to a public channel
        await page.goto('/c');

        const editor = page.locator('[data-testid="message-editor"]');
        await editor.click();

        // Verify ARIA labels and descriptions
        await expect(editor).toHaveAttribute('role', 'textbox');
        await expect(editor).toHaveAttribute('aria-label');
        await expect(editor).toHaveAttribute('aria-describedby');
    });

    test('High contrast mode works correctly', async ({ page }) => {
        // Enable high contrast mode
        await page.emulateMedia({
            colorScheme: 'dark',
            reducedMotion: 'reduce'
        });

        await page.goto('/c');

        // Verify editor is visible and functional
        const editor = page.locator('[data-testid="message-editor"]');
        await expect(editor).toBeVisible();

        // Test functionality in high contrast mode
        await editor.click();
        await editor.type('High contrast test');
        await page.keyboard.press('Enter');
    });
});
```

---

## 6. Performance Testing

### 6.1 Performance Benchmarks

```typescript
describe('Performance Benchmarks', () => {
  test('Editor initialization time', async () => {
    const startTime = performance.now();

    render(<RichMessageEditor onSendMessage={jest.fn()} />);

    // Wait for editor to be ready
    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    const initTime = performance.now() - startTime;
    expect(initTime).toBeLessThan(100); // <100ms target
  });

  test('Keystroke latency', async () => {
    const { user } = setup(<RichMessageEditor onSendMessage={jest.fn()} />);
    const editor = screen.getByRole('textbox');

    const latencies: number[] = [];

    for (let i = 0; i < 100; i++) {
      const startTime = performance.now();
      await user.type(editor, 'a');
      const latency = performance.now() - startTime;
      latencies.push(latency);
    }

    const averageLatency = latencies.reduce((a, b) => a + b) / latencies.length;
    expect(averageLatency).toBeLessThan(16); // <16ms for 60fps
  });

  test('Memory usage during extended use', async () => {
    const { user } = setup(<RichMessageEditor onSendMessage={jest.fn()} />);
    const editor = screen.getByRole('textbox');

    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

    // Simulate extended typing session
    for (let i = 0; i < 1000; i++) {
      await user.type(editor, 'This is a test message. ');
      if (i % 100 === 0) {
        // Clear content periodically
        await user.clear(editor);
      }
    }

    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;

    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // <10MB increase
  });
});
```

### 6.2 Bundle Size Testing

```typescript
// Bundle analysis test
test('Bundle size meets targets', () => {
    const bundleStats = require('../dist/bundle-stats.json');

    const richTextEditorSize = bundleStats.chunks
        .filter(chunk => chunk.names.includes('RichMessageEditor'))
        .reduce((total, chunk) => total + chunk.size, 0);

    expect(richTextEditorSize).toBeLessThan(50 * 1024); // <50KB gzipped
});
```

---

## 7. Accessibility Testing

### 7.1 Automated Accessibility Testing

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility Compliance', () => {
  test('Editor meets WCAG 2.1 AA standards', async () => {
    const { container } = render(<RichMessageEditor onSendMessage={jest.fn()} />);

    const results = await axe(container, {
      rules: {
        // Configure for WCAG 2.1 AA compliance
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'focus-management': { enabled: true },
      }
    });

    expect(results).toHaveNoViolations();
  });

  test('Toolbar is accessible', async () => {
    const { container, user } = setup(<RichMessageEditor onSendMessage={jest.fn()} />);
    const editor = screen.getByRole('textbox');

    // Select text to show toolbar
    await user.type(editor, 'Test text');
    await user.keyboard('{Control>}a{/Control}');

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('Mention dropdown is accessible', async () => {
    const { container, user } = setup(<RichMessageEditor onSendMessage={jest.fn()} />);
    const editor = screen.getByRole('textbox');

    // Trigger mention dropdown
    await user.type(editor, '@');

    // Verify dropdown accessibility
    const dropdown = screen.getByRole('listbox');
    expect(dropdown).toHaveAttribute('aria-label');

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 7.2 Manual Accessibility Testing

**Screen Reader Testing Checklist**:

- [ ] Editor purpose clearly announced
- [ ] Formatting changes announced
- [ ] Mention suggestions read correctly
- [ ] Toolbar buttons have clear labels
- [ ] Error messages are announced
- [ ] Draft status communicated

**Keyboard Navigation Testing**:

- [ ] Tab navigates through all interactive elements
- [ ] Enter and Space activate buttons appropriately
- [ ] Arrow keys navigate mention dropdown
- [ ] Escape closes dropdowns and dialogs
- [ ] All features accessible without mouse

**Visual Accessibility Testing**:

- [ ] High contrast mode support
- [ ] Text scaling up to 200% works
- [ ] Focus indicators clearly visible
- [ ] Color information not sole indicator
- [ ] Motion respects user preferences

---

## 8. Test Data Management

### 8.1 Test Data Factories

```typescript
// testUtils/factories.ts
export const createMockEditorState = (
    content = 'Test content'
): SerializedEditorState => ({
    root: {
        type: 'root',
        version: 1,
        children: [
            {
                type: 'paragraph',
                version: 1,
                children: [
                    {
                        type: 'text',
                        version: 1,
                        text: content,
                        format: 0,
                        style: '',
                        mode: 'normal',
                        detail: 0
                    }
                ],
                direction: 'ltr',
                format: '',
                indent: 0
            }
        ],
        direction: 'ltr',
        format: '',
        indent: 0
    }
});

export const createMockUser = (overrides = {}): User => ({
    id: '1',
    username: 'testuser',
    displayName: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    ...overrides
});
```

### 8.2 Test Utilities

```typescript
// testUtils/testHelpers.ts
export const setupEditorTest = (props = {}) => {
  const defaultProps = {
    onSendMessage: jest.fn(),
    onContentChange: jest.fn(),
    ...props
  };

  return render(<RichMessageEditor {...defaultProps} />);
};

export const typeAndFormat = async (text: string, formatting: string[]) => {
  const textbox = screen.getByRole('textbox');
  await user.type(textbox, text);
  await user.keyboard('{Control>}a{/Control}');

  for (const format of formatting) {
    await user.click(screen.getByLabelText(format));
  }
};

export const waitForEditorReady = () => {
  return waitFor(() => {
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
};
```

---

## 9. Security Testing

### 8.1 Input Sanitization Tests

```typescript
describe('Security - Input Sanitization', () => {
  test('Prevents XSS through pasted content', async () => {
    const { user } = setup(<RichMessageEditor onSendMessage={jest.fn()} />);
    const editor = screen.getByRole('textbox');

    // Attempt to paste malicious content
    const maliciousContent = '<script>alert("XSS")</script>';
    await user.click(editor);

    // Simulate paste event
    fireEvent.paste(editor, {
      clipboardData: {
        getData: () => maliciousContent,
        types: ['text/html']
      }
    });

    // Verify script tags are removed/escaped
    const serializedContent = getSerializedContent(editor);
    expect(JSON.stringify(serializedContent)).not.toContain('<script>');
    expect(JSON.stringify(serializedContent)).not.toContain('alert');
  });

  test('Validates URLs in links', async () => {
    const { user } = setup(<RichMessageEditor onSendMessage={jest.fn()} />);
    const editor = screen.getByRole('textbox');

    // Type various URL patterns
    const testUrls = [
      'javascript:alert("XSS")',
      'data:text/html,<script>alert("XSS")</script>',
      'https://legitimate-site.com',
      'http://example.com'
    ];

    for (const url of testUrls) {
      await user.clear(editor);
      await user.type(editor, url);

      const serializedContent = getSerializedContent(editor);
      const hasJavaScriptUrl = JSON.stringify(serializedContent).includes('javascript:');
      const hasDataUrl = JSON.stringify(serializedContent).includes('data:');

      if (url.startsWith('javascript:') || url.startsWith('data:')) {
        expect(hasJavaScriptUrl || hasDataUrl).toBe(false);
      } else {
        // Legitimate URLs should be preserved
        expect(JSON.stringify(serializedContent)).toContain(url);
      }
    }
  });

  test('Validates mention references', async () => {
    const mockUsers = [
      { id: 'user1', username: 'alice' },
      { id: 'user2', username: 'bob' }
    ];

    const { user } = setup(
      <RichMessageEditor
        onSendMessage={jest.fn()}
        availableUsers={mockUsers}
      />
    );
    const editor = screen.getByRole('textbox');

    // Attempt to create mention for non-existent user
    await user.type(editor, '@nonexistentuser');

    // Verify invalid mentions are not created
    const serializedContent = getSerializedContent(editor);
    const hasMentionNodes = JSON.stringify(serializedContent).includes('"type":"mention"');
    expect(hasMentionNodes).toBe(false);
  });
});
```

### 8.2 Content Validation Tests

```typescript
describe('Security - Content Validation', () => {
  test('Enforces message length limits', async () => {
    const maxLength = 1000;
    const onSendMessage = jest.fn();

    const { user } = setup(
      <RichMessageEditor
        onSendMessage={onSendMessage}
        maxLength={maxLength}
      />
    );
    const editor = screen.getByRole('textbox');

    // Type message exceeding limit
    const longMessage = 'a'.repeat(maxLength + 100);
    await user.type(editor, longMessage);

    // Attempt to send
    await user.keyboard('{Enter}');

    // Verify message was not sent
    expect(onSendMessage).not.toHaveBeenCalled();

    // Verify error message is shown
    expect(screen.getByText(/message too long/i)).toBeInTheDocument();
  });

  test('Sanitizes serialized output', async () => {
    const onSendMessage = jest.fn();
    const { user } = setup(<RichMessageEditor onSendMessage={onSendMessage} />);
    const editor = screen.getByRole('textbox');

    await user.type(editor, 'Test message');
    await user.keyboard('{Enter}');

    expect(onSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        // Verify output structure is safe
        root: expect.objectContaining({
          type: 'root',
          children: expect.any(Array)
        })
      })
    );

    const serializedContent = onSendMessage.mock.calls[0][0];
    const serializedString = JSON.stringify(serializedContent);

    // Verify no dangerous content in serialized output
    expect(serializedString).not.toContain('<script>');
    expect(serializedString).not.toContain('javascript:');
    expect(serializedString).not.toContain('onload');
    expect(serializedString).not.toContain('onerror');
  });
});
```

---

## 10. Test Environment Setup

### 10.1 Jest Configuration

```javascript
// jest.config.js
module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/testUtils/setupTests.ts'],
    moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/*.stories.tsx',
        '!src/testUtils/**'
    ],
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
        }
    }
};
```

### 10.2 Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/testUtils/setupTests.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/testUtils/',
                '**/*.d.ts',
                '**/*.config.*'
            ],
            thresholds: {
                global: {
                    branches: 90,
                    functions: 90,
                    lines: 90,
                    statements: 90
                }
            }
        }
    }
});
```

### 10.3 Test Setup

```typescript
// testUtils/setupTests.ts
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { TextEncoder, TextDecoder } from 'util';

// Configure testing library
configure({ testIdAttribute: 'data-testid' });

// Polyfills for test environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
}));

// Suppress console errors in tests
const originalConsoleError = console.error;
beforeAll(() => {
    console.error = (...args) => {
        if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
            return;
        }
        originalConsoleError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalConsoleError;
});
```

### 10.4 Testing Utilities

```typescript
// src/testUtils/test-utils.tsx
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock providers for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {children}
    </div>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const user = userEvent.setup();
  return {
    user,
    ...render(ui, { wrapper: AllTheProviders, ...options })
  };
};

export * from '@testing-library/react';
export { customRender as render };
```
    unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
};
```

### 9.2 Testing Utilities

```typescript
// src/test/test-utils.tsx
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock providers for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {children}
    </div>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const user = userEvent.setup();
  return {
    user,
    ...render(ui, { wrapper: AllTheProviders, ...options })
  };
};

export * from '@testing-library/react';
export { customRender as render };
```

### 9.3 CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
    push:
        branches: [main, develop]
    pull_request:
        branches: [main, develop]

jobs:
    unit-tests:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - uses: actions/setup-node@v3
              with:
                  node-version: '22'
                  cache: 'pnpm'

            - name: Install dependencies
              run: pnpm install

            - name: Run unit tests
              run: pnpm test:unit --coverage

            - name: Upload coverage
              uses: codecov/codecov-action@v3

    e2e-tests:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - uses: actions/setup-node@v3
              with:
                  node-version: '22'
                  cache: 'pnpm'

            - name: Install dependencies
              run: pnpm install

            - name: Install Playwright
              run: npx playwright install

            - name: Run E2E tests
              run: pnpm test:e2e

            - name: Upload test results
              uses: actions/upload-artifact@v3
              if: always()
              with:
                  name: e2e-results
                  path: test-results/

    accessibility-tests:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - uses: actions/setup-node@v3
              with:
                  node-version: '22'
                  cache: 'pnpm'

            - name: Install dependencies
              run: pnpm install

            - name: Run accessibility tests
              run: pnpm test:a11y

            - name: Generate accessibility report
              run: pnpm test:a11y:report
```

---

## 11. CI/CD Testing Pipeline

### 11.1 GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
    unit-tests:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - uses: actions/setup-node@v3
              with:
                node-version: '18'
                cache: 'npm'
            - run: npm ci
            - run: npm run test:unit -- --coverage
            - uses: codecov/codecov-action@v3

    integration-tests:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - uses: actions/setup-node@v3
              with:
                node-version: '18'
                cache: 'npm'
            - run: npm ci
            - run: npm run test:integration

    e2e-tests:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - uses: actions/setup-node@v3
              with:
                node-version: '18'
                cache: 'npm'
            - run: npm ci
            - run: npx playwright install
            - run: npm run test:e2e

    accessibility-tests:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - uses: actions/setup-node@v3
              with:
                node-version: '18'
                cache: 'npm'
            - run: npm ci
            - run: npm run test:a11y

    performance-tests:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - uses: actions/setup-node@v3
              with:
                node-version: '18'
                cache: 'npm'
            - run: npm ci
            - run: npm run test:performance
```

### 11.2 Quality Gates

```yaml
# Quality gate requirements
quality_gates:
    unit_test_coverage: 90%
    integration_test_coverage: 80%
    e2e_test_coverage: 100% # Critical user journeys
    accessibility_compliance: 100% # WCAG 2.1 AA
    performance_benchmarks: 100% # All benchmarks must pass
    security_scans: 100% # No high/critical vulnerabilities
```

---

## 12. Quality Gates & Release Criteria

### 12.1 Pre-merge Quality Gates

**Automated Checks**:

- [ ] All unit tests pass (>90% coverage)
- [ ] All integration tests pass
- [ ] Performance benchmarks met
- [ ] Bundle size within limits
- [ ] Accessibility tests pass
- [ ] Security scans clear
- [ ] Code quality metrics met

**Manual Review Requirements**:

- [ ] Code review by 2+ team members
- [ ] UX review for user-facing changes
- [ ] Accessibility review for a11y changes
- [ ] Performance review for optimization changes

### 12.2 Release Readiness Criteria

**Functional Requirements**:

- [ ] All P0 user stories implemented and tested
- [ ] Critical user journeys E2E tested
- [ ] Cross-browser compatibility verified
- [ ] Error handling and recovery tested
- [ ] Backward compatibility maintained

**Quality Requirements**:

- [ ] Unit test coverage >90%
- [ ] Integration test coverage >80%
- [ ] E2E test coverage for all critical paths
- [ ] Performance targets met
- [ ] Accessibility compliance achieved
- [ ] Security validation passed

**Operational Requirements**:

- [ ] Monitoring and alerting configured
- [ ] Feature flags implemented
- [ ] Rollback procedures tested
- [ ] Documentation completed
- [ ] Support team trained

### 12.3 Post-release Monitoring

**Quality Metrics to Monitor**:

- Message send success rate
- Editor initialization success rate
- Keystroke latency in production
- Memory usage patterns
- Error rates by browser/device
- User adoption of rich text features

**Alert Thresholds**:

- Editor failure rate >1%
- Message send failure rate >0.1%
- Performance degradation >50%
- Memory leaks detected
- Accessibility errors reported

---

## 13. Risk Mitigation Testing

### 13.1 Edge Case Testing

**Data Edge Cases**:

- Empty messages
- Very long messages
- Messages with only formatting
- Malformed serialized states
- Unicode and emoji content
- RTL language content

**User Interaction Edge Cases**:

- Rapid typing and formatting
- Multiple simultaneous selections
- Copy/paste from external sources
- Keyboard shortcut combinations
- Mobile touch interactions
- Network interruptions during send

**Browser Edge Cases**:

- Memory-constrained devices
- Slow network connections
- Older browser versions
- Disabled JavaScript features
- Limited storage availability

### 13.2 Stress Testing

```typescript
describe('Stress Testing', () => {
  test('Handles rapid user input', async () => {
    const { user } = setup(<RichMessageEditor onSendMessage={jest.fn()} />);
    const editor = screen.getByRole('textbox');

    // Simulate very rapid typing
    const rapidInputs = Array(1000).fill('a');

    for (const input of rapidInputs) {
      await user.type(editor, input, { delay: 1 }); // 1ms delay
    }

    // Verify editor remains responsive
    await expect(editor).toHaveValue(expect.stringContaining('a'.repeat(1000)));
  });

  test('Handles large document editing', async () => {
    const largeContent = 'word '.repeat(10000); // ~50KB of text

    const { user } = setup(
      <RichMessageEditor
        onSendMessage={jest.fn()}
        initialContent={createLargeSerializedState(largeContent)}
      />
    );

    const editor = screen.getByRole('textbox');

    // Add more content to large document
    await user.click(editor);
    await user.keyboard('{Control>}End{/Control}'); // Go to end
    await user.type(editor, ' additional content');

    // Verify editor remains responsive
    expect(editor).toContainText('additional content');
  });
});
```

---

## 14. Documentation & Training

### 14.1 Test Documentation Requirements

**Test Plan Documentation**:

- Test strategy overview
- Test environment setup instructions
- Test data and fixture descriptions
- Known issues and workarounds

**Test Case Documentation**:

- Detailed test procedures
- Expected results
- Pass/fail criteria
- Test data requirements

**Bug Documentation**:

- Bug reporting templates
- Severity and priority guidelines
- Regression testing procedures
- Resolution verification steps

### 14.2 Team Training Requirements

**QA Team Training**:

- Rich text editor functionality
- Accessibility testing procedures
- Performance testing tools
- Security testing approaches

**Development Team Training**:

- Testing best practices
- Test-driven development for Lexical
- Accessibility development guidelines
- Performance optimization techniques

---

## Document Control & Summary

### Consolidation Notes

This document represents a comprehensive merger of two previous testing strategy documents:
- `TESTING_STRATEGY.md` (original comprehensive version)
- `testing-strategy.md` (enhanced implementation details)

The consolidation includes:
- ✅ **Enhanced test implementation examples** with actual TypeScript code
- ✅ **Comprehensive application integration** for ZRocket
- ✅ **Detailed cross-browser testing strategy** with Playwright examples
- ✅ **Advanced test data management** with factories and utilities
- ✅ **Complete CI/CD pipeline configuration** with GitHub Actions
- ✅ **Expanded accessibility testing** with screen reader compatibility
- ✅ **Performance benchmarking** with specific metrics and thresholds

### Document Status

| Version | Date         | Author         | Changes                                    |
| ------- | ------------ | -------------- | ------------------------------------------ |
| 1.0.0   | Jan 2025     | GitHub Copilot | Initial testing strategy                   |
| 1.1.0   | Aug 4, 2025  | GitHub Copilot | Consolidated and enhanced testing strategy |

### Key Improvements

1. **Comprehensive Test Examples**: Real TypeScript test implementations
2. **Application-Specific Integration**: ZRocket specific testing
3. **Enhanced Route Testing**: Actual application routes (/d/, /p/, /c/)
4. **Advanced Mock Strategies**: Complete factory patterns and utilities
5. **Performance Monitoring**: Detailed benchmarks and monitoring setup
6. **Quality Gate Integration**: CI/CD pipeline with quality gates

---

_This consolidated testing strategy document serves as the definitive guide for ensuring the quality, reliability, and user experience of the Rich Message Composer. All team members involved in development, testing, and quality assurance should refer to this single document for testing guidelines, procedures, and standards._
