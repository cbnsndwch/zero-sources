# AutoLink Plugin Implementation

## Overview

This implementation adds automatic URL detection and conversion to clickable links using Lexical's AutoLinkPlugin. The feature provides seamless link sharing in messages with proper security attributes and validation.

## Implementation Details

### Core Components

1. **Enhanced RichMessageEditor.tsx**
   - Added `LinkNode` and `AutoLinkNode` from `@lexical/link`
   - Configured `AutoLinkPlugin` from `@lexical/react/LexicalAutoLinkPlugin`
   - Added link styling to the theme configuration
   - Implemented comprehensive URL matchers with validation

2. **URL Matchers**
   The implementation supports all required URL formats:
   - `https://example.com` - Direct HTTPS URLs
   - `http://example.com` - Direct HTTP URLs  
   - `www.example.com` - WWW URLs (converted to HTTPS)
   - `example.com` - Domain-only URLs (converted to HTTPS)
   - `user@example.com` - Email addresses (converted to mailto)

3. **Security Features**
   - All external links include `rel="noopener noreferrer"`
   - All external links open in new tab/window with `target="_blank"`
   - URL validation prevents invalid URLs from being converted
   - Email links include security attributes

### Technical Implementation

#### URL Matching Patterns

```typescript
const HTTPS_MATCHER = /https:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
const HTTP_MATCHER = /http:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
const WWW_MATCHER = /www\.[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
const DOMAIN_MATCHER = /(?!https?:\/\/)(?!www\.)[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
const EMAIL_MATCHER = /([\w._%+-]+@[\w.-]+\.[A-Z]{2,})/i;
```

#### Editor Configuration

```typescript
const initialConfig = {
    namespace: 'RichMessageEditor',
    nodes: [MentionNode, LinkNode, AutoLinkNode], // Added link nodes
    theme: {
        paragraph: 'mb-1',
        text: {
            bold: 'font-bold',
            italic: 'italic', 
            underline: 'underline',
            strikethrough: 'line-through'
        },
        link: 'text-blue-600 hover:text-blue-800 hover:underline cursor-pointer' // Link styling
    },
    // ...other config
};
```

#### Plugin Integration

```typescript
<AutoLinkPlugin matchers={AUTOLINK_MATCHERS} />
```

### URL Validation

The implementation includes comprehensive URL validation:

```typescript
function validateUrl(url: string): boolean {
    try {
        new URL(url.startsWith('http') ? url : `https://${url}`);
        return true;
    } catch {
        return false;
    }
}
```

This prevents invalid text from being converted to links and ensures only properly formatted URLs become clickable.

### Performance Considerations

- URL detection uses efficient regex patterns that don't interfere with typing performance
- Validation is performed only on matched patterns, not all text
- The AutoLinkPlugin is optimized for real-time text input

### Testing

#### Automated Tests (`AutoLinkPlugin.test.tsx`)

Comprehensive test suite covering:
- HTTPS URL detection and conversion
- HTTP URL detection and conversion
- WWW URL detection with HTTPS prefix
- Domain-only URL detection with HTTPS prefix
- Email address detection with mailto links
- Invalid URL rejection
- Link preservation in message serialization
- CSS class application

#### Manual Testing (`AutoLinkDemo.tsx`)

Interactive demo component for visual testing:
- Real-time URL detection demonstration
- Test URL examples for each supported format
- Message serialization display
- Copy-to-clipboard functionality for easy testing

### Usage Examples

#### Basic Usage

```typescript
import { RichMessageEditor } from '@/components/RichMessageEditor';

<RichMessageEditor 
    onSendMessage={handleSendMessage}
    placeholder="Type a message with URLs..."
/>
```

#### Demo Integration

```typescript
import { AutoLinkDemo } from '@/components/RichMessageEditor';

<AutoLinkDemo />
```

### CSS Styling

Links are styled with Tailwind CSS classes:
- `text-blue-600` - Blue link color
- `hover:text-blue-800` - Darker blue on hover
- `hover:underline` - Underline on hover
- `cursor-pointer` - Pointer cursor

### Security Attributes

All links automatically include security attributes:
- `rel="noopener noreferrer"` - Prevents window.opener access and referrer leakage
- `target="_blank"` - Opens links in new tab/window (external links only)

### Supported URL Formats

| Format | Example | Converted To | Notes |
|--------|---------|--------------|-------|
| HTTPS | `https://example.com` | `https://example.com` | Direct link |
| HTTP | `http://example.com` | `http://example.com` | Direct link |
| WWW | `www.example.com` | `https://www.example.com` | HTTPS prefix added |
| Domain | `example.com` | `https://example.com` | HTTPS prefix added |
| Email | `user@example.com` | `mailto:user@example.com` | Mailto protocol |

### Error Handling

- Invalid URLs are not converted to links
- URL validation prevents malformed links
- Error boundaries protect against plugin failures
- Graceful degradation if plugins fail to load

### Browser Compatibility

The implementation is compatible with all modern browsers that support:
- ES2015+ features (startsWith, includes)
- Lexical editor framework
- CSS hover states

### Future Enhancements

Potential improvements for future iterations:
- Custom link validation rules
- Link preview functionality
- Configurable link styling
- International domain support
- Phone number detection
- Social media handle detection

## Demo Access

The AutoLink functionality can be tested at:
- Route: `/rich-editor-demo`
- Component: `AutoLinkDemo`
- Integration: Added to existing RichMessageEditor demo page

## Dependencies

Required packages (already included in package.json):
- `@lexical/link` - LinkNode and AutoLinkNode
- `@lexical/react` - AutoLinkPlugin
- `lexical` - Core Lexical functionality