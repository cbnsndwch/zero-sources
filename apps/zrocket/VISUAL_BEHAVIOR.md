## AutoLink Plugin Visual Behavior

When the AutoLink Plugin is working in the ZRocket chat interface, users will see:

### 1. Real-time URL Detection
As users type URLs, they are automatically converted to blue, clickable links:

```
User types: "Check out https://github.com/rocicorp/zero"
Result: "Check out [https://github.com/rocicorp/zero]" (blue, clickable)
```

### 2. Auto-prefixing for Domain URLs
Domain-only URLs get automatically prefixed with HTTPS:

```
User types: "Visit example.com"
Result: "Visit [example.com]" (links to https://example.com)
```

### 3. Email Detection
Email addresses become mailto links:

```
User types: "Contact support@example.com"
Result: "Contact [support@example.com]" (opens email client)
```

### 4. Visual Styling
- **Normal state**: Blue text (text-blue-600)
- **Hover state**: Darker blue with underline
- **Cursor**: Pointer cursor on hover
- **Target**: External links open in new tab

### 5. Security Features
All links include proper security attributes:
- `rel="noopener noreferrer"` for security
- `target="_blank"` for external links
- Proper URL validation to prevent XSS

### 6. Integration Points
The AutoLink functionality works in:
- Main chat input area
- Direct message conversations  
- Channel discussions
- Group chats
- Demo/testing interface at `/rich-editor-demo`

### 7. Message Serialization
When messages are sent, the link information is preserved in the SerializedEditorState:

```json
{
  "root": {
    "children": [
      {
        "children": [
          {
            "text": "Check out ",
            "type": "text"
          },
          {
            "type": "autolink",
            "url": "https://github.com/rocicorp/zero",
            "text": "https://github.com/rocicorp/zero",
            "rel": "noopener noreferrer",
            "target": "_blank"
          }
        ],
        "type": "paragraph"
      }
    ],
    "type": "root"
  }
}
```

This ensures that links are preserved and displayed correctly when messages are displayed to other users.

### Browser Screenshot Simulation

```
┌─────────────────────────────────────────────────────────────┐
│ ZRocket Chat - #general                               [×] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Alice: Hey, check out this cool library!                   │
│                                                             │
│ Bob: Visit https://github.com/rocicorp/zero for more info  │
│      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~               │
│      (blue, underlined on hover)                           │
│                                                             │
│ Carol: You can also email support@rocicorp.com             │
│        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~                  │
│        (blue, mailto link)                                  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ [+] Type a message... Press Enter to send           [📎][😊]│
│     ┌─ User typing: "Check example.com"                     │
│     └─ Shows: "Check [example.com]" (auto-linked)          │
└─────────────────────────────────────────────────────────────┘
```

The implementation provides a seamless, intuitive experience where URLs are automatically detected and converted to proper links without disrupting the user's typing flow.