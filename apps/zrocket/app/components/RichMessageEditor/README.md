# RichMessageEditor Component

A React component that provides a rich text editor for message input using Lexical. This component is designed to replace simple textarea inputs with a more powerful editing experience while maintaining a clean and intuitive interface.

## Features

- **Rich Text Editing**: Built on Lexical for modern, extensible rich text editing
- **Keyboard Shortcuts**:
    - `Enter` to send message
    - `Shift+Enter` for new lines
- **Undo/Redo**: Full history support with `Ctrl+Z` / `Ctrl+Y`
- **Character Limits**: Optional character count and validation
- **Error Handling**: Built-in error boundary for graceful error recovery
- **TypeScript**: Fully typed with comprehensive interfaces
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Usage

### Basic Usage

```tsx
import { RichMessageEditor } from '@/components/RichMessageEditor';
import type { SerializedEditorState } from 'lexical';

function ChatInput() {
    const handleSendMessage = (content: SerializedEditorState) => {
        console.log('Sending message:', content);
        // Send message to your backend or state management
    };

    return (
        <RichMessageEditor
            onSendMessage={handleSendMessage}
            placeholder="Type your message..."
        />
    );
}
```

### With Character Limit

```tsx
<RichMessageEditor
    onSendMessage={handleSendMessage}
    placeholder="Type your message..."
    maxLength={500}
/>
```

### With Initial Content

```tsx
const initialContent: SerializedEditorState = {
    root: {
        children: [
            {
                children: [
                    {
                        detail: 0,
                        format: 0,
                        mode: 'normal',
                        style: '',
                        text: 'Hello, world!',
                        type: 'text',
                        version: 1
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

<RichMessageEditor
    onSendMessage={handleSendMessage}
    initialContent={initialContent}
/>;
```

## Props

| Prop             | Type                                       | Default               | Description                                        |
| ---------------- | ------------------------------------------ | --------------------- | -------------------------------------------------- |
| `onSendMessage`  | `(content: SerializedEditorState) => void` | **Required**          | Callback when user sends a message (presses Enter) |
| `placeholder`    | `string`                                   | `"Type a message..."` | Placeholder text shown when editor is empty        |
| `initialContent` | `SerializedEditorState`                    | `undefined`           | Initial content to populate the editor             |
| `disabled`       | `boolean`                                  | `false`               | Whether the editor is disabled                     |
| `maxLength`      | `number`                                   | `undefined`           | Maximum character count (shows counter when set)   |

## Integration with Existing Chat Components

To integrate with the existing `ChatInput` component:

```tsx
// Before (with textarea)
<Textarea
  value={message}
  onChange={e => setMessage(e.target.value)}
  onKeyPress={handleKeyPress}
  placeholder="Type a message..."
/>

// After (with RichMessageEditor)
<RichMessageEditor
  onSendMessage={handleSendMessage}
  placeholder="Type a message..."
  maxLength={1000}
/>
```

## Styling

The component uses Tailwind CSS classes and follows the existing design system:

- Uses `border-input` and `bg-background` for consistent theming
- Responsive design with `min-h-[40px]` and `max-h-32`
- Error states use `text-destructive` and `border-destructive/50`

## Error Handling

The component includes a built-in error boundary that catches Lexical-specific errors and displays a user-friendly fallback message. You can also handle errors programmatically:

```tsx
<RichMessageEditor
    onSendMessage={handleSendMessage}
    onError={error => {
        console.error('Editor error:', error);
        // Handle error (e.g., show toast notification)
    }}
/>
```

## Technical Implementation

- **LexicalComposer**: Core editor setup with theme configuration
- **RichTextPlugin**: Handles rich text editing capabilities
- **HistoryPlugin**: Provides undo/redo functionality
- **OnChangePlugin**: Monitors content changes for character counting
- **Custom Plugins**:
    - `KeyboardPlugin`: Handles Enter/Shift+Enter behavior
    - `CharacterLimitPlugin`: Enforces character limits

## Performance Considerations

- Editor state is managed internally by Lexical
- Only serializes content when sending (not on every keystroke)
- Error boundary prevents crashes from propagating to parent components
- Minimal re-renders through optimized state management
