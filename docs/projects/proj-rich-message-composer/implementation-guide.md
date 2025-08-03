# Implementation Guide
# Rich Message Composer - Lexical Integration

**Version**: 1.0.0  
**Date**: January 2025  
**Status**: Draft  

---

## 1. Implementation Overview

This guide provides step-by-step instructions for implementing the Rich Message Composer using Lexical. It's designed for developers who will be executing the epics and user stories outlined in the project documentation.

### 1.1 Prerequisites

**Required Knowledge:**
- React 18+ and TypeScript
- Modern JavaScript (ES6+)
- CSS-in-JS or CSS Modules
- Git workflow and pull request process

**Development Environment:**
- Node.js 18+ and npm/pnpm
- VS Code or similar IDE with TypeScript support
- Git and GitHub access
- Browser developer tools familiarity

**Project Context:**
- Familiarity with existing ZRocket and Circle-Talk codebases
- Understanding of message contracts and SerializedEditorState
- Knowledge of the project's design system and component patterns

## 2. Development Setup

### 2.1 Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd zero-sources

# Install dependencies
pnpm install

# Create feature branch
git checkout -b feature/rich-message-composer

# Navigate to workspace
cd libs/rich-message-composer
```

### 2.2 Package Installation

```bash
# Install core Lexical packages
pnpm add lexical @lexical/react @lexical/rich-text @lexical/history @lexical/utils

# Install additional plugins
pnpm add @lexical/link @lexical/list @lexical/markdown

# Install development dependencies
pnpm add -D @types/react @types/react-dom jest @testing-library/react @testing-library/jest-dom

# Install peer dependencies (if not already present)
pnpm add react react-dom
```

### 2.3 Project Structure Setup

```bash
# Create project structure
mkdir -p src/{components,hooks,plugins,nodes,utils,types}
mkdir -p src/components/{RichMessageEditor,RichMessageDisplay,Toolbar}
mkdir -p src/plugins/{MentionsPlugin,HashtagPlugin,EmojiPlugin}

# Create initial files
touch src/index.ts
touch src/components/RichMessageEditor/index.ts
touch src/types/index.ts
```

## 3. Epic E001: Core Lexical Integration

### 3.1 Story E001-US02: Basic Editor Configuration

**File: `src/config/editorConfig.ts`**

```typescript
import { InitialConfigType } from '@lexical/react/LexicalComposer';
import { HeadingNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';

import { editorTheme } from './editorTheme';
import { MentionNode } from '../nodes/MentionNode';
import { HashtagNode } from '../nodes/HashtagNode';

export const createEditorConfig = (namespace: string = 'RichMessageEditor'): InitialConfigType => ({
  namespace,
  theme: editorTheme,
  onError: (error: Error) => {
    console.error('Lexical Editor Error:', error);
    // TODO: Integrate with error reporting service
  },
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    LinkNode,
    MentionNode,
    HashtagNode,
  ],
  editorState: null, // Start with empty state
});
```

**File: `src/config/editorTheme.ts`**

```typescript
import { EditorThemeClasses } from 'lexical';

export const editorTheme: EditorThemeClasses = {
  root: 'rich-editor-root',
  paragraph: 'rich-editor-paragraph',
  text: {
    bold: 'rich-editor-text-bold',
    italic: 'rich-editor-text-italic',
    underline: 'rich-editor-text-underline',
    strikethrough: 'rich-editor-text-strikethrough',
  },
  heading: {
    h1: 'rich-editor-heading-h1',
    h2: 'rich-editor-heading-h2',
    h3: 'rich-editor-heading-h3',
  },
  list: {
    ol: 'rich-editor-list-ol',
    ul: 'rich-editor-list-ul',
    listitem: 'rich-editor-list-item',
  },
  link: 'rich-editor-link',
  // Custom node themes
  mention: 'rich-editor-mention',
  hashtag: 'rich-editor-hashtag',
};
```

### 3.2 Story E001-US03: SerializedEditorState Output

**File: `src/utils/serialization.ts`**

```typescript
import { EditorState, SerializedEditorState } from 'lexical';
import { $isTextNode, $isParagraphNode } from 'lexical';

export const normalizeContent = (content: string | SerializedEditorState): SerializedEditorState => {
  if (typeof content === 'string') {
    // Convert plain text to SerializedEditorState
    return {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: content,
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    };
  }
  return content;
};

export const validateEditorState = (state: any): state is SerializedEditorState => {
  return (
    state &&
    typeof state === 'object' &&
    state.root &&
    state.root.type === 'root' &&
    Array.isArray(state.root.children)
  );
};

export const extractPlainText = (editorState: SerializedEditorState): string => {
  const extractTextFromNode = (node: any): string => {
    if (node.type === 'text') {
      return node.text || '';
    }
    
    if (node.children && Array.isArray(node.children)) {
      return node.children.map(extractTextFromNode).join('');
    }
    
    return '';
  };

  return editorState.root.children.map(extractTextFromNode).join('\n');
};
```

### 3.3 Story E001-US05: Basic Editor Instance

**File: `src/components/RichMessageEditor/RichMessageEditor.tsx`**

```typescript
import React, { useState, useCallback } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { EditorState, SerializedEditorState, $getRoot } from 'lexical';

import { createEditorConfig } from '../../config/editorConfig';
import { normalizeContent } from '../../utils/serialization';
import './RichMessageEditor.css';

export interface RichMessageEditorProps {
  onSendMessage?: (content: SerializedEditorState) => void;
  onContentChange?: (content: SerializedEditorState) => void;
  placeholder?: string;
  initialContent?: SerializedEditorState | string;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}

// Inner component that has access to the Lexical context
function EditorInner({
  onSendMessage,
  onContentChange,
  placeholder = 'Type a message...',
  disabled = false,
}: Pick<RichMessageEditorProps, 'onSendMessage' | 'onContentChange' | 'placeholder' | 'disabled'>) {
  const [editor] = useLexicalComposerContext();

  const handleChange = useCallback(
    (editorState: EditorState) => {
      const serializedState = editorState.toJSON();
      onContentChange?.(serializedState);
    },
    [onContentChange]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        
        if (onSendMessage) {
          const editorState = editor.getEditorState();
          const serializedState = editorState.toJSON();
          
          // Check if editor has content
          const hasContent = editorState.read(() => {
            const root = $getRoot();
            return root.getTextContent().trim().length > 0;
          });

          if (hasContent) {
            onSendMessage(serializedState);
            
            // Clear editor after sending
            editor.update(() => {
              const root = $getRoot();
              root.clear();
            });
          }
        }
      }
    },
    [editor, onSendMessage]
  );

  return (
    <div className="rich-message-editor">
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className="rich-message-editor__content"
            aria-label="Message composer"
            placeholder={placeholder}
            onKeyDown={handleKeyDown}
            readOnly={disabled}
          />
        }
        placeholder={
          <div className="rich-message-editor__placeholder">
            {placeholder}
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <OnChangePlugin onChange={handleChange} />
      <HistoryPlugin />
    </div>
  );
}

export function RichMessageEditor({
  initialContent,
  className,
  ...props
}: RichMessageEditorProps) {
  const [editorConfig] = useState(() => {
    const config = createEditorConfig();
    
    if (initialContent) {
      const normalizedContent = normalizeContent(initialContent);
      config.editorState = JSON.stringify(normalizedContent);
    }
    
    return config;
  });

  return (
    <div className={`rich-message-editor-container ${className || ''}`}>
      <LexicalComposer initialConfig={editorConfig}>
        <EditorInner {...props} />
      </LexicalComposer>
    </div>
  );
}
```

**File: `src/components/RichMessageEditor/RichMessageEditor.css`**

```css
.rich-message-editor-container {
  position: relative;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  min-height: 40px;
}

.rich-message-editor {
  position: relative;
}

.rich-message-editor__content {
  padding: 12px 16px;
  min-height: 40px;
  outline: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  overflow-y: auto;
  max-height: 120px;
}

.rich-message-editor__content:focus {
  outline: none;
}

.rich-message-editor__placeholder {
  position: absolute;
  top: 12px;
  left: 16px;
  color: #999;
  pointer-events: none;
  font-size: 14px;
}

/* Text formatting styles */
.rich-editor-text-bold {
  font-weight: bold;
}

.rich-editor-text-italic {
  font-style: italic;
}

.rich-editor-text-underline {
  text-decoration: underline;
}

.rich-editor-text-strikethrough {
  text-decoration: line-through;
}

/* Heading styles */
.rich-editor-heading-h1 {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0.5em 0;
}

.rich-editor-heading-h2 {
  font-size: 1.3em;
  font-weight: bold;
  margin: 0.4em 0;
}

.rich-editor-heading-h3 {
  font-size: 1.1em;
  font-weight: bold;
  margin: 0.3em 0;
}

/* List styles */
.rich-editor-list-ol,
.rich-editor-list-ul {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.rich-editor-list-item {
  margin: 0.2em 0;
}

/* Link styles */
.rich-editor-link {
  color: #0066cc;
  text-decoration: underline;
  cursor: pointer;
}

.rich-editor-link:hover {
  text-decoration: none;
}

/* Custom node styles */
.rich-editor-mention {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 2px 4px;
  border-radius: 3px;
  text-decoration: none;
  cursor: pointer;
}

.rich-editor-hashtag {
  color: #1976d2;
  font-weight: 500;
  cursor: pointer;
}

.rich-editor-hashtag:hover {
  text-decoration: underline;
}
```

### 3.4 Story E001-US06: Error Handling and Debugging

**File: `src/components/ErrorBoundary/ErrorBoundary.tsx`**

```typescript
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Rich Message Editor Error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="rich-editor-error">
            <p>Something went wrong with the message editor.</p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              type="button"
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

## 4. Epic E002: Basic Component Architecture

### 4.1 Story E002-US01: Rich Message Editor Component

**File: `src/components/RichMessageEditor/index.ts`**

```typescript
export { RichMessageEditor } from './RichMessageEditor';
export type { RichMessageEditorProps } from './RichMessageEditor';
```

**Update: `src/components/RichMessageEditor/RichMessageEditor.tsx`**

```typescript
// Add these imports and enhance the component
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';

// Add to EditorInner component
function EditorInner({ 
  onSendMessage,
  onContentChange,
  placeholder = 'Type a message...',
  disabled = false,
  autoFocus = false,
}: Pick<RichMessageEditorProps, 'onSendMessage' | 'onContentChange' | 'placeholder' | 'disabled'> & {
  autoFocus?: boolean;
}) {
  // ... existing code ...

  return (
    <div className="rich-message-editor">
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className="rich-message-editor__content"
            aria-label="Message composer"
            placeholder={placeholder}
            onKeyDown={handleKeyDown}
            readOnly={disabled}
          />
        }
        placeholder={
          <div className="rich-message-editor__placeholder">
            {placeholder}
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <OnChangePlugin onChange={handleChange} />
      <HistoryPlugin />
      <ClearEditorPlugin />
      {autoFocus && <AutoFocusPlugin />}
    </div>
  );
}

// Update props interface
export interface RichMessageEditorProps {
  onSendMessage?: (content: SerializedEditorState) => void;
  onContentChange?: (content: SerializedEditorState) => void;
  placeholder?: string;
  initialContent?: SerializedEditorState | string;
  disabled?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
  className?: string;
}
```

### 4.2 Story E002-US02: Message Display Component

**File: `src/components/RichMessageDisplay/RichMessageDisplay.tsx`**

```typescript
import React from 'react';
import { createEditor, EditorState } from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';

import { createEditorConfig } from '../../config/editorConfig';
import { normalizeContent, validateEditorState } from '../../utils/serialization';
import './RichMessageDisplay.css';

export interface RichMessageDisplayProps {
  content: SerializedEditorState | string;
  className?: string;
  onMentionClick?: (userId: string) => void;
  onHashtagClick?: (hashtag: string) => void;
  onLinkClick?: (url: string) => void;
}

export function RichMessageDisplay({
  content,
  className,
  onMentionClick,
  onHashtagClick,
  onLinkClick,
}: RichMessageDisplayProps) {
  const htmlContent = React.useMemo(() => {
    try {
      const normalizedContent = normalizeContent(content);
      
      if (!validateEditorState(normalizedContent)) {
        // Fallback to plain text if content is invalid
        return typeof content === 'string' ? content : JSON.stringify(content);
      }

      // Create a temporary editor to generate HTML
      const config = createEditorConfig('RichMessageDisplay');
      const editor = createEditor(config);
      
      const editorState = editor.parseEditorState(JSON.stringify(normalizedContent));
      
      return editorState.read(() => {
        return $generateHtmlFromNodes(editor, null);
      });
    } catch (error) {
      console.error('Error rendering message content:', error);
      return typeof content === 'string' ? content : 'Error displaying message';
    }
  }, [content]);

  const handleClick = React.useCallback(
    (event: React.MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Handle mention clicks
      if (target.classList.contains('rich-editor-mention')) {
        event.preventDefault();
        const userId = target.getAttribute('data-user-id');
        if (userId && onMentionClick) {
          onMentionClick(userId);
        }
        return;
      }
      
      // Handle hashtag clicks
      if (target.classList.contains('rich-editor-hashtag')) {
        event.preventDefault();
        const hashtag = target.textContent?.replace('#', '') || '';
        if (hashtag && onHashtagClick) {
          onHashtagClick(hashtag);
        }
        return;
      }
      
      // Handle link clicks
      if (target.tagName === 'A') {
        const href = target.getAttribute('href');
        if (href && onLinkClick) {
          event.preventDefault();
          onLinkClick(href);
        }
      }
    },
    [onMentionClick, onHashtagClick, onLinkClick]
  );

  return (
    <div
      className={`rich-message-display ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      onClick={handleClick}
      role="article"
      aria-label="Message content"
    />
  );
}
```

**File: `src/components/RichMessageDisplay/RichMessageDisplay.css`**

```css
.rich-message-display {
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.rich-message-display p {
  margin: 0.5em 0;
}

.rich-message-display p:first-child {
  margin-top: 0;
}

.rich-message-display p:last-child {
  margin-bottom: 0;
}

/* Inherit all styles from editor theme */
.rich-message-display .rich-editor-text-bold {
  font-weight: bold;
}

.rich-message-display .rich-editor-text-italic {
  font-style: italic;
}

.rich-message-display .rich-editor-text-underline {
  text-decoration: underline;
}

.rich-message-display .rich-editor-text-strikethrough {
  text-decoration: line-through;
}

.rich-message-display .rich-editor-heading-h1 {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0.5em 0;
}

.rich-message-display .rich-editor-heading-h2 {
  font-size: 1.3em;
  font-weight: bold;
  margin: 0.4em 0;
}

.rich-message-display .rich-editor-heading-h3 {
  font-size: 1.1em;
  font-weight: bold;
  margin: 0.3em 0;
}

.rich-message-display .rich-editor-list-ol,
.rich-message-display .rich-editor-list-ul {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.rich-message-display .rich-editor-list-item {
  margin: 0.2em 0;
}

.rich-message-display .rich-editor-link {
  color: #0066cc;
  text-decoration: underline;
  cursor: pointer;
}

.rich-message-display .rich-editor-link:hover {
  text-decoration: none;
}

.rich-message-display .rich-editor-mention {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 2px 4px;
  border-radius: 3px;
  text-decoration: none;
  cursor: pointer;
}

.rich-message-display .rich-editor-mention:hover {
  background-color: #bbdefb;
}

.rich-message-display .rich-editor-hashtag {
  color: #1976d2;
  font-weight: 500;
  cursor: pointer;
}

.rich-message-display .rich-editor-hashtag:hover {
  text-decoration: underline;
}
```

### 4.3 Story E002-US05: State Management Architecture

**File: `src/hooks/useMessageEditor.ts`**

```typescript
import { useState, useCallback, useEffect } from 'react';
import { EditorState, SerializedEditorState } from 'lexical';

interface UseMessageEditorOptions {
  autoSave?: boolean;
  autoSaveKey?: string;
  onDraftSave?: (content: SerializedEditorState | null) => void;
}

interface UseMessageEditorReturn {
  editorState: SerializedEditorState | null;
  isDirty: boolean;
  error: Error | null;
  handleContentChange: (editorState: SerializedEditorState) => void;
  clearEditor: () => void;
  setError: (error: Error | null) => void;
  saveDraft: () => void;
  clearDraft: () => void;
}

export function useMessageEditor(options: UseMessageEditorOptions = {}): UseMessageEditorReturn {
  const { autoSave = true, autoSaveKey = 'rich-editor-draft', onDraftSave } = options;
  
  const [editorState, setEditorState] = useState<SerializedEditorState | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load draft on mount
  useEffect(() => {
    if (autoSave && autoSaveKey) {
      try {
        const savedDraft = localStorage.getItem(autoSaveKey);
        if (savedDraft) {
          const parsedDraft = JSON.parse(savedDraft);
          setEditorState(parsedDraft);
        }
      } catch (err) {
        console.warn('Failed to load draft:', err);
      }
    }
  }, [autoSave, autoSaveKey]);

  const handleContentChange = useCallback(
    (newEditorState: SerializedEditorState) => {
      setEditorState(newEditorState);
      setIsDirty(true);
      setError(null);

      // Auto-save draft
      if (autoSave && autoSaveKey) {
        try {
          localStorage.setItem(autoSaveKey, JSON.stringify(newEditorState));
          onDraftSave?.(newEditorState);
        } catch (err) {
          console.warn('Failed to save draft:', err);
        }
      }
    },
    [autoSave, autoSaveKey, onDraftSave]
  );

  const clearEditor = useCallback(() => {
    setEditorState(null);
    setIsDirty(false);
    setError(null);

    if (autoSave && autoSaveKey) {
      localStorage.removeItem(autoSaveKey);
      onDraftSave?.(null);
    }
  }, [autoSave, autoSaveKey, onDraftSave]);

  const saveDraft = useCallback(() => {
    if (editorState && autoSaveKey) {
      try {
        localStorage.setItem(autoSaveKey, JSON.stringify(editorState));
        onDraftSave?.(editorState);
      } catch (err) {
        console.error('Failed to save draft:', err);
        setError(new Error('Failed to save draft'));
      }
    }
  }, [editorState, autoSaveKey, onDraftSave]);

  const clearDraft = useCallback(() => {
    if (autoSaveKey) {
      localStorage.removeItem(autoSaveKey);
      onDraftSave?.(null);
    }
  }, [autoSaveKey, onDraftSave]);

  return {
    editorState,
    isDirty,
    error,
    handleContentChange,
    clearEditor,
    setError,
    saveDraft,
    clearDraft,
  };
}
```

## 5. Testing Implementation

### 5.1 Basic Test Setup

**File: `src/components/RichMessageEditor/RichMessageEditor.test.tsx`**

```typescript
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { RichMessageEditor } from './RichMessageEditor';

describe('RichMessageEditor', () => {
  const user = userEvent.setup();

  it('renders with placeholder text', () => {
    render(<RichMessageEditor placeholder="Type a message..." />);
    expect(screen.getByText('Type a message...')).toBeInTheDocument();
  });

  it('accepts text input', async () => {
    render(<RichMessageEditor />);
    
    const textbox = screen.getByRole('textbox');
    await user.type(textbox, 'Hello world');
    
    expect(textbox).toHaveTextContent('Hello world');
  });

  it('calls onSendMessage when Enter is pressed', async () => {
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

  it('calls onContentChange when content changes', async () => {
    const onContentChange = jest.fn();
    render(<RichMessageEditor onContentChange={onContentChange} />);
    
    await user.type(screen.getByRole('textbox'), 'Hello');
    
    await waitFor(() => {
      expect(onContentChange).toHaveBeenCalledWith(
        expect.objectContaining({
          root: expect.objectContaining({
            type: 'root'
          })
        })
      );
    });
  });

  it('handles Shift+Enter for new lines', async () => {
    const onSendMessage = jest.fn();
    render(<RichMessageEditor onSendMessage={onSendMessage} />);
    
    const textbox = screen.getByRole('textbox');
    await user.type(textbox, 'First line');
    await user.keyboard('{Shift>}{Enter}{/Shift}');
    await user.type(textbox, 'Second line');
    
    // Should not send message yet
    expect(onSendMessage).not.toHaveBeenCalled();
    
    // Should contain both lines
    expect(textbox).toHaveTextContent('First line\nSecond line');
  });
});
```

### 5.2 Hook Testing

**File: `src/hooks/useMessageEditor.test.ts`**

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMessageEditor } from './useMessageEditor';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useMessageEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useMessageEditor());
    
    expect(result.current.editorState).toBeNull();
    expect(result.current.isDirty).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('updates state on content change', () => {
    const { result } = renderHook(() => useMessageEditor());
    
    const mockEditorState = { root: { type: 'root', children: [] } };
    
    act(() => {
      result.current.handleContentChange(mockEditorState as any);
    });
    
    expect(result.current.editorState).toBe(mockEditorState);
    expect(result.current.isDirty).toBe(true);
  });

  it('saves draft to localStorage when autoSave is enabled', () => {
    const { result } = renderHook(() => 
      useMessageEditor({ autoSave: true, autoSaveKey: 'test-draft' })
    );
    
    const mockEditorState = { root: { type: 'root', children: [] } };
    
    act(() => {
      result.current.handleContentChange(mockEditorState as any);
    });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'test-draft',
      JSON.stringify(mockEditorState)
    );
  });

  it('clears editor and draft', () => {
    const { result } = renderHook(() => 
      useMessageEditor({ autoSave: true, autoSaveKey: 'test-draft' })
    );
    
    // Set some content first
    act(() => {
      result.current.handleContentChange({ root: { type: 'root', children: [] } } as any);
    });
    
    // Clear editor
    act(() => {
      result.current.clearEditor();
    });
    
    expect(result.current.editorState).toBeNull();
    expect(result.current.isDirty).toBe(false);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-draft');
  });
});
```

## 6. Integration with Applications

### 6.1 ZRocket Integration

**File: `apps/zrocket/app/components/chat/ChatInput.tsx`**

```typescript
import React from 'react';
import { RichMessageEditor } from '@zero/rich-message-composer';
import { SerializedEditorState } from 'lexical';

interface ChatInputProps {
  roomId: string;
  roomType: 'channel' | 'group' | 'dm';
}

export function ChatInput({ roomId, roomType }: ChatInputProps) {
  const handleSendMessage = (content: SerializedEditorState) => {
    // TODO: Integrate with Zero mutation
    console.log('Sending message:', { roomId, roomType, content });
    
    // Example integration:
    // sendMessage.mutate({
    //   roomId,
    //   roomType,
    //   content,
    //   timestamp: new Date(),
    // });
  };

  return (
    <div className="chat-input-container">
      <RichMessageEditor
        onSendMessage={handleSendMessage}
        placeholder="Type a message..."
        autoFocus
      />
    </div>
  );
}
```

### 6.2 Circle-Talk Integration

**File: `apps/circle-talk/src/components/ChatInput.tsx`**

```typescript
import React from 'react';
import { RichMessageEditor } from '@zero/rich-message-composer';
import { SerializedEditorState } from 'lexical';

interface Message {
  id: string;
  content: SerializedEditorState;
  timestamp: Date;
  sender: string;
}

interface ChatInputProps {
  onSendMessage: (message: Message) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const handleSendMessage = (content: SerializedEditorState) => {
    const message: Message = {
      id: crypto.randomUUID(),
      content,
      timestamp: new Date(),
      sender: 'current-user', // TODO: Get from auth context
    };
    
    onSendMessage(message);
  };

  return (
    <div className="chat-input-container">
      <RichMessageEditor
        onSendMessage={handleSendMessage}
        placeholder="Type a message..."
      />
    </div>
  );
}
```

## 7. Build and Deployment

### 7.1 Package Configuration

**File: `libs/rich-message-composer/package.json`**

```json
{
  "name": "@zero/rich-message-composer",
  "version": "1.0.0",
  "description": "Rich text message composer powered by Lexical",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0",
    "lexical": ">=0.22.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "rollup": "^3.0.0",
    "@rollup/plugin-typescript": "^11.0.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^13.0.0"
  }
}
```

### 7.2 Build Configuration

**File: `libs/rich-message-composer/rollup.config.js`**

```javascript
import typescript from '@rollup/plugin-typescript';
import { resolve } from 'path';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
  external: [
    'react',
    'react-dom',
    'lexical',
    '@lexical/react',
    '@lexical/rich-text',
    '@lexical/history',
    '@lexical/utils',
    '@lexical/link',
    '@lexical/list',
  ],
  plugins: [
    typescript({
      tsconfig: resolve('./tsconfig.json'),
      declaration: true,
      declarationDir: 'dist',
    }),
  ],
};
```

### 7.3 TypeScript Configuration

**File: `libs/rich-message-composer/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["DOM", "DOM.Iterable"],
    "allowJs": false,
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist",
    "strict": true,
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.*", "**/*.spec.*"]
}
```

## 8. Debugging and Troubleshooting

### 8.1 Common Issues and Solutions

**Issue: Editor not rendering**
```typescript
// Check if Lexical config is properly set up
const debugConfig = () => {
  console.log('Editor config:', editorConfig);
  console.log('Nodes registered:', editorConfig.nodes);
};

// Verify all required packages are installed
// npm ls lexical @lexical/react @lexical/rich-text
```

**Issue: SerializedEditorState compatibility**
```typescript
// Add validation before sending
const validateBeforeSend = (editorState: SerializedEditorState) => {
  if (!validateEditorState(editorState)) {
    console.error('Invalid editor state:', editorState);
    throw new Error('Invalid editor state');
  }
  
  // Check for required message contract fields
  const textContent = extractPlainText(editorState);
  if (!textContent.trim()) {
    throw new Error('Empty message not allowed');
  }
};
```

**Issue: Performance problems**
```typescript
// Add performance monitoring
const measurePerformance = (operation: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${operation} took ${end - start}ms`);
};

// Monitor editor updates
const handleChange = measurePerformance('Editor update', (editorState) => {
  // Handle change logic
});
```

### 8.2 Development Tools

**Debug Component:**
```typescript
// Development-only debug overlay
function DebugOverlay({ editorState }: { editorState: SerializedEditorState | null }) {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      right: 0, 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white',
      padding: '1rem',
      maxWidth: '300px',
      maxHeight: '400px',
      overflow: 'auto',
      fontSize: '12px',
      zIndex: 9999 
    }}>
      <h4>Debug Info</h4>
      <pre>{JSON.stringify(editorState, null, 2)}</pre>
    </div>
  );
}
```

**Performance Monitor:**
```typescript
// Hook for monitoring performance
function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    updateCount: 0,
    averageUpdateTime: 0,
  });

  const measureRender = useCallback((fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    
    setMetrics(prev => ({
      renderTime: end - start,
      updateCount: prev.updateCount + 1,
      averageUpdateTime: (prev.averageUpdateTime * prev.updateCount + (end - start)) / (prev.updateCount + 1),
    }));
  }, []);

  return { metrics, measureRender };
}
```

---

**Document Status**: Draft  
**Next Review**: After Epic E001 Implementation  
**Implementation Lead**: Features Team Lead  
**Stakeholders**: Engineering Team, QA Lead
