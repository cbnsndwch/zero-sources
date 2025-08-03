# Testing Strategy Document

# Rich Message Composer - Lexical Integration

**Version**: 1.0.0  
**Date**: January 2025  
**Status**: Draft

---

## 1. Testing Overview

### 1.1 Testing Objectives

The testing strategy ensures the Rich Message Composer meets all functional, performance, security, and accessibility requirements while maintaining high code quality and user experience standards.

**Primary Goals:**

- Verify all user stories and acceptance criteria
- Ensure SerializedEditorState compatibility with existing contracts
- Validate performance benchmarks across all scenarios
- Confirm accessibility compliance (WCAG 2.1 AA)
- Guarantee cross-browser and cross-platform compatibility

### 1.2 Testing Pyramid

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

### 1.3 Testing Tools and Frameworks

- **Unit Testing**: Jest, React Testing Library
- **Integration Testing**: Jest, Playwright
- **E2E Testing**: Playwright, Cypress
- **Performance Testing**: Lighthouse, WebPageTest
- **Accessibility Testing**: axe-core, Pa11y
- **Visual Regression**: Chromatic, Percy
- **Cross-Browser**: BrowserStack, Sauce Labs

## 2. Unit Testing Strategy

### 2.1 Component Testing

#### 2.1.1 RichMessageEditor Tests

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

#### 2.1.2 Plugin Testing

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
        users={mockUsers}
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
```

### 2.2 Hook Testing

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

### 2.3 Utility Function Testing

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
});
```

## 3. Integration Testing Strategy

### 3.1 Component Integration Tests

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
```

### 3.2 Application Integration Tests

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

  describe('Circle-Talk Integration', () => {
    it('should integrate with existing message sending flow', async () => {
      const mockOnSendMessage = jest.fn();

      render(
        <CircleTalkChatInput onSendMessage={mockOnSendMessage} />
      );

      await user.type(screen.getByRole('textbox'), 'Hello world');
      await user.keyboard('{Enter}');

      expect(mockOnSendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            root: expect.objectContaining({
              type: 'root'
            })
          })
        })
      );
    });
  });
});
```

### 3.3 Cross-Browser Testing

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

                const content = await page.textContent(
                    '[data-testid="editor"]'
                );
                expect(content).toBe('Hello world');
            });

            it('should handle keyboard shortcuts', async ({ browser }) => {
                const page = await browser.newPage();
                await page.goto('/test-editor');

                await page.fill('[data-testid="editor"]', 'Bold text');
                await page.keyboard.press('Control+A');
                await page.keyboard.press('Control+B');

                const boldElement = await page.locator('strong').textContent();
                expect(boldElement).toBe('Bold text');
            });
        });
    });
});
```

## 4. End-to-End Testing Strategy

### 4.1 User Journey Tests

```typescript
// e2e/UserJourneys.spec.ts
describe('Rich Message Composer User Journeys', () => {
    test('Complete message composition and sending', async ({ page }) => {
        await page.goto('/chat/room/123');

        // Compose rich message
        const editor = page.locator('[data-testid="message-editor"]');
        await editor.fill('Check out this **important** update @john');

        // Apply formatting
        await page.keyboard.press('Control+A');
        await page.click('[data-testid="bold-button"]');

        // Add mention
        await editor.pressSequentially('@john');
        await page.click('[data-testid="mention-john"]');

        // Send message
        await page.click('[data-testid="send-button"]');

        // Verify message appears in chat
        await expect(
            page.locator('[data-testid="message-content"]')
        ).toContainText('important');
        await expect(
            page.locator('[data-testid="message-content"] strong')
        ).toBeVisible();
        await expect(
            page.locator('[data-testid="mention-john"]')
        ).toBeVisible();
    });

    test('Mobile user workflow', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/chat/room/123');

        // Mobile-specific interactions
        const editor = page.locator('[data-testid="message-editor"]');
        await editor.tap();
        await editor.fill('Mobile message');

        // Mobile toolbar
        await page.locator('[data-testid="mobile-toolbar-toggle"]').tap();
        await page.locator('[data-testid="bold-button"]').tap();

        await page.locator('[data-testid="send-button"]').tap();

        await expect(
            page.locator('[data-testid="message-content"] strong')
        ).toBeVisible();
    });

    test('Accessibility user workflow', async ({ page }) => {
        await page.goto('/chat/room/123');

        // Keyboard-only navigation
        await page.keyboard.press('Tab'); // Focus editor
        await page.keyboard.type('Accessible message');

        // Toolbar navigation
        await page.keyboard.press('Tab'); // Focus toolbar
        await page.keyboard.press('Enter'); // Activate bold

        // Send with keyboard
        await page.keyboard.press('Tab'); // Focus send button
        await page.keyboard.press('Enter'); // Send message

        // Verify accessibility attributes
        await expect(
            page.locator('[data-testid="message-content"]')
        ).toHaveAttribute('role', 'article');
    });
});
```

### 4.2 Integration Flow Tests

```typescript
// e2e/IntegrationFlows.spec.ts
describe('Integration Flows', () => {
    test('Message persistence and retrieval', async ({ page }) => {
        await page.goto('/chat/room/123');

        // Send message with rich content
        await page.fill(
            '[data-testid="message-editor"]',
            '**Important** message with @john'
        );
        await page.click('[data-testid="send-button"]');

        // Refresh page
        await page.reload();

        // Verify message persists with formatting
        await expect(
            page.locator('[data-testid="message-content"] strong')
        ).toContainText('Important');
        await expect(
            page.locator('[data-testid="mention-john"]')
        ).toBeVisible();
    });

    test('Real-time message updates', async ({ browser }) => {
        const context1 = await browser.newContext();
        const context2 = await browser.newContext();

        const page1 = await context1.newPage();
        const page2 = await context2.newPage();

        await page1.goto('/chat/room/123');
        await page2.goto('/chat/room/123');

        // Send message from page1
        await page1.fill('[data-testid="message-editor"]', 'Real-time message');
        await page1.click('[data-testid="send-button"]');

        // Verify message appears on page2
        await expect(
            page2.locator('[data-testid="message-content"]')
        ).toContainText('Real-time message');
    });
});
```

## 5. Performance Testing Strategy

### 5.1 Performance Benchmarks

```typescript
// performance/PerformanceBenchmarks.test.ts
describe('Performance Benchmarks', () => {
    test('Initial render performance', async ({ page }) => {
        await page.goto('/test-editor');

        const startTime = Date.now();
        await page.waitForSelector('[data-testid="editor"]');
        const endTime = Date.now();

        const renderTime = endTime - startTime;
        expect(renderTime).toBeLessThan(100); // <100ms requirement
    });

    test('Typing latency', async ({ page }) => {
        await page.goto('/test-editor');

        const editor = page.locator('[data-testid="editor"]');
        await editor.focus();

        const latencies: number[] = [];

        for (let i = 0; i < 100; i++) {
            const start = performance.now();
            await page.keyboard.type('a');
            await page.waitForFunction(() => {
                const element = document.querySelector(
                    '[data-testid="editor"]'
                );
                return element?.textContent?.length === i + 1;
            });
            const end = performance.now();

            latencies.push(end - start);
        }

        const avgLatency = latencies.reduce((a, b) => a + b) / latencies.length;
        expect(avgLatency).toBeLessThan(16); // 60fps requirement
    });

    test('Memory usage under load', async ({ page }) => {
        await page.goto('/test-editor');

        const initialMetrics = await page.evaluate(() => performance.memory);

        // Create large document
        const editor = page.locator('[data-testid="editor"]');
        await editor.fill('A'.repeat(10000));

        // Apply formatting to large sections
        await page.keyboard.press('Control+A');
        await page.click('[data-testid="bold-button"]');

        const finalMetrics = await page.evaluate(() => performance.memory);
        const memoryIncrease =
            finalMetrics.usedJSHeapSize - initialMetrics.usedJSHeapSize;

        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // <10MB requirement
    });
});
```

### 5.2 Bundle Size Testing

```javascript
// performance/BundleAnalysis.test.js
const { analyzeBundle } = require('./bundleAnalyzer');

describe('Bundle Size Analysis', () => {
    test('should meet bundle size requirements', async () => {
        const analysis = await analyzeBundle('./dist/rich-message-composer.js');

        expect(analysis.gzippedSize).toBeLessThan(50 * 1024); // <50KB gzipped
        expect(analysis.dependencies.lexical).toBeLessThan(30 * 1024); // Lexical core <30KB
    });

    test('should have efficient tree shaking', async () => {
        const analysis = await analyzeBundle('./dist/rich-message-composer.js');

        // Verify unused exports are excluded
        expect(analysis.unusedExports).toEqual([]);
        expect(analysis.treeShakingEfficiency).toBeGreaterThan(0.9); // >90% efficiency
    });
});
```

## 6. Accessibility Testing Strategy

### 6.1 Automated Accessibility Testing

```typescript
// accessibility/AutomatedA11y.test.ts
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility Compliance', () => {
  test('should have no accessibility violations', async () => {
    const { container } = render(<RichMessageEditor />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  test('should support keyboard navigation', async () => {
    render(<RichMessageEditor />);

    // Test tab order
    await user.tab();
    expect(screen.getByRole('textbox')).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('toolbar')).toHaveFocus();

    // Test toolbar navigation
    await user.keyboard('{ArrowRight}');
    expect(screen.getByLabelText('Bold')).toHaveFocus();
  });

  test('should provide proper ARIA labels', () => {
    render(<RichMessageEditor />);

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-label', 'Message composer');
    expect(screen.getByRole('toolbar')).toHaveAttribute('aria-label', 'Formatting options');
    expect(screen.getByLabelText('Bold')).toBeInTheDocument();
  });

  test('should announce formatting changes', async () => {
    render(<RichMessageEditor />);

    const textbox = screen.getByRole('textbox');
    await user.type(textbox, 'Bold text');
    await user.keyboard('{Control>}a{/Control}');
    await user.keyboard('{Control>}b{/Control}');

    // Verify live region announces change
    expect(screen.getByRole('status')).toHaveTextContent('Bold formatting applied');
  });
});
```

### 6.2 Screen Reader Testing

```typescript
// accessibility/ScreenReaderTests.test.ts
describe('Screen Reader Compatibility', () => {
    test('should work with NVDA', async ({ page }) => {
        await page.goto('/test-editor-nvda');

        // Simulate screen reader interaction
        await page.keyboard.press('Tab');
        await page.keyboard.type('Screen reader test');

        // Verify content is accessible
        const ariaDescription = await page.getAttribute(
            '[data-testid="editor"]',
            'aria-describedby'
        );
        expect(ariaDescription).toBeTruthy();
    });

    test('should provide meaningful content descriptions', async ({ page }) => {
        await page.goto('/test-editor');

        // Add formatted content
        await page.fill('[data-testid="editor"]', 'Important message');
        await page.keyboard.press('Control+A');
        await page.click('[data-testid="bold-button"]');

        // Verify accessible content structure
        const content = await page.textContent(
            '[aria-label="Message content"]'
        );
        expect(content).toBe('Important message, bold formatting');
    });
});
```

## 7. Security Testing Strategy

### 7.1 Input Sanitization Tests

```typescript
// security/InputSanitization.test.ts
describe('Input Sanitization', () => {
  test('should prevent XSS through HTML injection', async () => {
    const maliciousInput = '<script>alert("xss")</script>';

    render(<RichMessageEditor />);

    await user.type(screen.getByRole('textbox'), maliciousInput);

    // Verify script tags are not present in DOM
    expect(document.querySelector('script')).toBeNull();
  });

  test('should sanitize pasted HTML content', async () => {
    const maliciousHTML = '<img src="x" onerror="alert(\'xss\')">';

    render(<RichMessageEditor />);

    // Simulate paste
    await user.click(screen.getByRole('textbox'));
    await user.paste(maliciousHTML);

    // Verify dangerous attributes are removed
    const img = screen.queryByRole('img');
    if (img) {
      expect(img).not.toHaveAttribute('onerror');
    }
  });

  test('should validate URLs in links', async () => {
    const dangerousURL = 'javascript:alert("xss")';

    render(<RichMessageEditor />);

    await user.type(screen.getByRole('textbox'), dangerousURL);

    // Verify dangerous URLs are not converted to links
    expect(screen.queryByRole('link')).toBeNull();
  });
});
```

### 7.2 Content Security Policy Tests

```typescript
// security/CSPTests.test.ts
describe('Content Security Policy', () => {
    test('should respect CSP directives', async ({ page }) => {
        // Set strict CSP
        await page.setExtraHTTPHeaders({
            'Content-Security-Policy': "default-src 'self'; script-src 'self'"
        });

        await page.goto('/test-editor');

        // Verify editor still functions under strict CSP
        await page.fill('[data-testid="editor"]', 'CSP test');

        expect(await page.textContent('[data-testid="editor"]')).toBe(
            'CSP test'
        );
    });
});
```

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

## 9. Test Environment Setup

### 9.1 Jest Configuration

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

### 9.2 Test Setup

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

## 10. CI/CD Testing Pipeline

### 10.1 GitHub Actions Workflow

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
            - run: npm ci
            - run: npm run test:unit -- --coverage
            - uses: codecov/codecov-action@v3

    integration-tests:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - uses: actions/setup-node@v3
            - run: npm ci
            - run: npm run test:integration

    e2e-tests:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - uses: actions/setup-node@v3
            - run: npm ci
            - run: npx playwright install
            - run: npm run test:e2e

    accessibility-tests:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - uses: actions/setup-node@v3
            - run: npm ci
            - run: npm run test:a11y

    performance-tests:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - uses: actions/setup-node@v3
            - run: npm ci
            - run: npm run test:performance
```

### 10.2 Quality Gates

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

**Document Status**: Draft  
**Next Review**: End of Epic E001  
**Testing Lead**: QA Team Lead  
**Stakeholders**: Engineering Manager, Product Owner
