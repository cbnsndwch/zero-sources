# Message Editor Keyboard Shortcuts

The Rich Message Editor in ZRocket supports the following keyboard shortcuts for efficient message composition.

## Sending Messages

| Key Combination                  | Action          |
| -------------------------------- | --------------- |
| **Enter**                        | Send message    |
| **Shift + Enter**                | Insert new line |
| **Ctrl + Enter** (Windows/Linux) | Insert new line |
| **Cmd + Enter** (Mac)            | Insert new line |

## Text Formatting

| Key Combination          | Format                 |
| ------------------------ | ---------------------- |
| **Ctrl/Cmd + B**         | **Bold** text          |
| **Ctrl/Cmd + I**         | _Italic_ text          |
| **Ctrl/Cmd + U**         | <u>Underline</u> text  |
| **Ctrl/Cmd + Shift + S** | ~~Strikethrough~~ text |

## Editing

| Key Combination          | Action     |
| ------------------------ | ---------- |
| **Ctrl/Cmd + Z**         | Undo       |
| **Ctrl/Cmd + Shift + Z** | Redo       |
| **Ctrl/Cmd + A**         | Select all |

## Mentions

| Key Combination | Action                         |
| --------------- | ------------------------------ |
| **@**           | Start typing to mention a user |
| **Arrow Keys**  | Navigate mention suggestions   |
| **Enter**       | Select highlighted mention     |
| **Escape**      | Close mention menu             |

## Tips

- **Empty messages won't send**: The editor won't send messages that contain only whitespace
- **Multi-line messages**: Use Shift+Enter or Ctrl+Enter to create paragraphs within a single message
- **Quick formatting**: Select text first, then use keyboard shortcuts to format
- **Undo/Redo**: The editor maintains a history of your changes

## Examples

### Sending a Simple Message

```
Type your message
Press Enter
→ Message sent!
```

### Sending a Multi-line Message

```
This is line 1
Press Shift+Enter
This is line 2
Press Shift+Enter
This is line 3
Press Enter
→ All three lines sent as one message!
```

### Formatting While Typing

```
Type some text
Select the text with mouse or Shift+Arrow keys
Press Ctrl+B
→ Text is now bold!
Press Enter
→ Message with bold text sent!
```

## Implementation Details

The keyboard handling is implemented in the `KeyboardPlugin` component within `RichMessageEditor.tsx`. The plugin:

1. Listens for `keydown` events on the editor's root element
2. Checks for the Enter key
3. If modifiers (Shift/Ctrl/Cmd) are present, allows default behavior (new line)
4. If no modifiers, prevents default and triggers message send
5. Validates the message has content before sending
6. Clears the editor after successful send

This provides a familiar chat interface experience similar to popular messaging apps like Slack, Discord, and Microsoft Teams.
