# Epic E004: Interactive Features (Links, Mentions)

**Epic ID**: E004  
**Epic Name**: Interactive Features (Links, Mentions)  
**Priority**: P1 (High)  
**Estimated Effort**: 14 story points  
**Sprint Duration**: 2.5 weeks  
**Team**: Features Team  
**Dependencies**: E001, E002

## Epic Summary

Implement interactive features that make messages more engaging and functional, including automatic link detection, manual link creation, user mentions with autocomplete, hashtag support, and emoji integration. These features transform static text into dynamic, interactive content that enhances communication effectiveness.

## Epic Goals

### Primary Objectives

1. **Link Management**: Automatic URL detection and manual link creation with preview
2. **User Mentions**: @username functionality with autocomplete and user directory integration
3. **Hashtag Support**: #hashtag recognition and standardization
4. **Emoji Integration**: Emoji picker and shortcode support (:smile:)
5. **Interactive Rendering**: Clickable, functional elements in message display

### Success Criteria

- ✅ **FOUNDATION COMPLETE** - Lexical Rich Text Editor fully integrated (PR #39 merged)
- 🔄 **IN PROGRESS** - Text formatting toolbar (Bold, Italic, Underline, Strikethrough) - PR #42
- ⏳ Advanced copy/paste support for rich content - PR #40
- ⏳ Performance optimization and cross-browser testing - PR #41
- ⏳ Links are automatically detected and rendered as clickable elements
- ⏳ User mentions work with autocomplete and proper user resolution
- ⏳ Hashtags are recognized and consistently formatted
- ⏳ Emoji picker provides comprehensive emoji selection
- ⏳ All interactive elements maintain accessibility standards

**Current Status (Aug 4, 2025):** Foundation complete, 3 PRs in active development

## User Stories

### Story E004-US01: Automatic Link Detection

**As a** user  
**I want** URLs to be automatically detected and converted to clickable links  
**So that** I can easily share and access web content

**Acceptance Criteria:**

- [ ] URLs (http, https, www) are automatically detected while typing
- [ ] Valid URLs are highlighted and made clickable
- [ ] Link detection works for common URL formats
- [ ] Links have appropriate visual styling (color, underline)
- [ ] Links open in new tab/window with security attributes
- [ ] Invalid URLs are not converted to links
- [ ] Link detection doesn't interfere with typing performance

**Definition of Done:**

- AutoLinkPlugin is configured and functional
- Link styling matches design system
- Security attributes (rel="noopener noreferrer") are applied
- Performance impact is minimal (<10ms for URL detection)
- Cross-browser compatibility verified

### Story E004-US02: Manual Link Creation

**As a** user  
**I want** to create custom links with display text  
**So that** I can create more readable and professional-looking messages

**Acceptance Criteria:**

- [ ] Link creation via toolbar button or keyboard shortcut (Ctrl+K)
- [ ] Modal/popup for entering URL and display text
- [ ] Edit existing links by clicking or using context menu
- [ ] Remove link formatting while preserving text
- [ ] Validate URLs before creating links
- [ ] Support for email addresses (mailto:) and other protocols

**Definition of Done:**

- Link creation UI is intuitive and accessible
- Link validation prevents broken or malicious links
- Editing workflow is smooth and discoverable
- Keyboard shortcuts work consistently
- Link data is properly serialized

### Story E004-US03: User Mentions with Autocomplete

**As a** user  
**I want** to mention other users by typing @username  
**So that** I can notify specific people and reference them in conversations

**Acceptance Criteria:**

- [ ] @ symbol triggers mention autocomplete
- [ ] User list appears with fuzzy search capability
- [ ] Arrow keys and Enter for selection
- [ ] Mentions are visually distinct (highlighted, colored)
- [ ] Mentions are interactive (clickable to view profile)
- [ ] Support for display names and usernames
- [ ] Integration with existing user directory/API

**Definition of Done:**

- Mention autocomplete is responsive and accurate
- User search works with partial names
- Visual design matches design system
- Mention data includes proper user IDs
- Accessibility requirements met (screen reader support)

### Story E004-US04: Hashtag Support

**As a** user  
**I want** hashtags to be recognized and formatted consistently  
**So that** I can categorize and discover related conversations

**Acceptance Criteria:**

- [ ] # symbol followed by alphanumeric text creates hashtag
- [ ] Hashtags are visually distinct (color, styling)
- [ ] Hashtags are clickable for search/filtering
- [ ] Support for Unicode characters in hashtags
- [ ] Hashtag validation (length limits, character restrictions)
- [ ] Case-insensitive hashtag recognition

**Definition of Done:**

- Hashtag detection works reliably
- Visual styling is consistent and accessible
- Hashtag data is properly structured for search
- Performance impact is minimal
- International character support verified

### Story E004-US05: Emoji Integration

**As a** user  
**I want** to easily add emojis to my messages  
**So that** I can express emotions and make communication more engaging

**Acceptance Criteria:**

- [ ] Emoji picker accessible via toolbar button
- [ ] Emoji categories and search functionality
- [ ] Shortcode support (:smile: becomes 😊)
- [ ] Recently used emojis section
- [ ] Skin tone selection for applicable emojis
- [ ] Keyboard navigation within emoji picker
- [ ] Mobile-optimized emoji selection

**Definition of Done:**

- Emoji picker loads quickly (<200ms)
- Search functionality works accurately
- Shortcodes are converted reliably
- Mobile experience is touch-friendly
- Emoji data is properly serialized

### Story E004-US06: Interactive Message Display

**As a** user  
**I want** interactive elements in messages to be functional  
**So that** I can click links, view user profiles, and interact with content

**Acceptance Criteria:**

- [ ] Links are clickable and open appropriately
- [ ] Mentions are clickable and show user information
- [ ] Hashtags are clickable for search/filtering
- [ ] Hover states provide additional information
- [ ] Right-click context menus for interactive elements
- [ ] Keyboard navigation for interactive elements
- [ ] Security measures for external links

**Definition of Done:**

- All interactive elements work correctly
- Security review passes for link handling
- Accessibility standards met
- Performance is acceptable for message lists
- Error handling for broken/invalid elements

## Technical Implementation

### Plugin Architecture

```typescript
// Required Lexical plugins
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';

// Custom plugins to implement
import { MentionsPlugin } from './plugins/MentionsPlugin';
import { HashtagPlugin } from './plugins/HashtagPlugin';
import { EmojiPlugin } from './plugins/EmojiPlugin';
import { LinkEditorPlugin } from './plugins/LinkEditorPlugin';
```

### Node Types

```typescript
// Custom node definitions
import { MentionNode } from './nodes/MentionNode';
import { HashtagNode } from './nodes/HashtagNode';
import { EmojiNode } from './nodes/EmojiNode';
import { LinkNode } from '@lexical/link';

const editorConfig = {
    nodes: [
        LinkNode,
        MentionNode,
        HashtagNode,
        EmojiNode
        // ... other nodes
    ]
};
```

### Mention System Implementation

```typescript
interface MentionData {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
}

interface MentionsPluginProps {
    users: MentionData[];
    onUserSearch: (query: string) => Promise<MentionData[]>;
    onMentionSelect: (user: MentionData) => void;
    maxResults?: number;
}
```

### Link Processing

```typescript
const URL_MATCHERS = [
    (text: string) => {
        const match = URL_REGEX.exec(text);
        if (match) {
            return {
                index: match.index,
                length: match[0].length,
                text: match[0],
                url: normalizeUrl(match[0]),
                attributes: {
                    rel: 'noopener noreferrer',
                    target: '_blank'
                }
            };
        }
        return null;
    }
];
```

### Emoji System

**Selected Component: [Frimousse](https://frimousse.liveblocks.io/)**

**Rationale for Selection:**
- Lightweight, unstyled, and composable architecture
- Built-in virtualization for performance with large emoji datasets
- Comprehensive TypeScript support with detailed API
- shadcn/ui integration available for consistent design system integration
- Accessibility-first design with keyboard navigation
- Mobile-optimized touch interactions
- Based on Emojibase data with Unicode standards compliance

**Installation:**
```bash
npm install frimousse
# OR via shadcn CLI
npx shadcn@latest add https://frimousse.liveblocks.io/r/emoji-picker
```

**Core Components Integration:**
```typescript
import { EmojiPicker } from 'frimousse';

// Frimousse implementation
interface FrimousseEmojiPickerProps {
    onEmojiSelect: ({ emoji }: { emoji: string }) => void;
    locale?: string;
    skinTone?: 'none' | 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark';
    columns?: number;
    sticky?: boolean;
    emojiVersion?: number;
    className?: string;
}

// Legacy interface for compatibility
interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
    recentEmojis: string[];
    categories: EmojiCategory[];
    searchEnabled?: boolean;
}

interface EmojiCategory {
    name: string;
    emojis: string[];
    icon: string;
}

// Frimousse-based implementation
const RichMessageEmojiPicker = ({ onEmojiSelect, className }: FrimousseEmojiPickerProps) => (
    <EmojiPicker.Root 
        onEmojiSelect={onEmojiSelect}
        className={className}
        columns={10}
        skinTone="none"
        sticky={true}
    >
        <EmojiPicker.Search />
        <EmojiPicker.Viewport>
            <EmojiPicker.Loading>Loading emojis...</EmojiPicker.Loading>
            <EmojiPicker.Empty>No emoji found.</EmojiPicker.Empty>
            <EmojiPicker.List />
        </EmojiPicker.Viewport>
    </EmojiPicker.Root>
);
```

**Key Features:**
- **Virtualized Performance**: Built-in virtualization handles thousands of emojis efficiently
- **Search & Filtering**: Native search functionality with category-based organization
- **Skin Tone Support**: `EmojiPicker.SkinToneSelector` for customizable skin tones
- **Keyboard Navigation**: Full accessibility with arrow keys and Enter selection
- **Mobile Optimization**: Touch-friendly interactions and responsive design
- **Emoji Data**: Powered by Emojibase with Unicode compliance and version control
- **Custom Styling**: CSS variables and attribute selectors for complete customization

## Design Requirements

### Visual Design

- **Link Styling**: Blue color, underline on hover, consistent with web standards
- **Mention Styling**: Highlighted background, distinct color, readable contrast
- **Hashtag Styling**: Subtle highlighting, consistent with social media conventions
- **Emoji Integration**: Native emoji rendering, consistent sizing

### Interaction Design

- **Autocomplete UX**: Smooth animation, logical ordering, easy selection
- **Hover States**: Informative tooltips and previews
- **Click Actions**: Immediate response, appropriate target handling
- **Context Menus**: Right-click options for power users

### Mobile Considerations

- **Touch Targets**: Large enough for touch interaction
- **Autocomplete**: Mobile-optimized dropdown positioning
- **Emoji Picker**: Touch-friendly categories and search
- **Link Preview**: Mobile-appropriate preview display

## Performance Requirements

### Interactive Element Performance

- **Link Detection**: <10ms for URL pattern matching
- **Mention Search**: <100ms for user lookup
- **Emoji Loading**: <200ms for picker initialization
- **Autocomplete**: <50ms response time for suggestions

### Memory Management

- **User Cache**: Efficient caching of user data
- **Emoji Data**: Lazy loading of emoji categories
- **Event Cleanup**: Proper removal of event listeners
- **Component Lifecycle**: Clean unmounting of interactive components

## Security Considerations

### Link Security

- **URL Validation**: Prevent javascript: and data: URLs
- **External Links**: Add security attributes (rel="noopener noreferrer")
- **Protocol Filtering**: Allow only safe protocols (http, https, mailto)
- **Content Security**: Prevent XSS through link manipulation

### User Data Protection

- **Mention Privacy**: Respect user privacy settings
- **Data Sanitization**: Clean user input before processing
- **API Security**: Secure user lookup endpoints
- **PII Protection**: Avoid exposing sensitive user information

## Accessibility Requirements

### Interactive Element Accessibility

- **Keyboard Navigation**: All features accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Focus Management**: Logical focus order and visible indicators
- **Color Independence**: Don't rely solely on color for distinction

### Autocomplete Accessibility

- **ARIA Combobox**: Proper combobox pattern implementation
- **Live Regions**: Announce search results and selections
- **Keyboard Shortcuts**: Standard arrow key and Enter navigation
- **Screen Reader Compatibility**: Works with major screen readers

## Testing Strategy

### Unit Tests

- Link detection and validation
- Mention autocomplete functionality
- Hashtag recognition patterns
- Emoji shortcode conversion
- Security filtering for URLs

### Integration Tests

- User directory integration
- Cross-browser link handling
- Mobile touch interactions
- Performance with large user lists
- Accessibility compliance

### E2E Tests

- Complete mention workflow
- Link creation and editing
- Emoji selection and insertion
- Message display with interactive elements
- Cross-platform functionality

## Risk Assessment

### High Risk

1. **User Data Integration**: Complex integration with user directory systems
    - _Mitigation_: Early integration testing and API validation
    - _Contingency_: Fallback to simple mention system

2. **Performance Impact**: Interactive features may slow down editor
    - _Mitigation_: Performance monitoring and optimization
    - _Contingency_: Progressive loading and feature toggles

### Medium Risk

3. **Security Vulnerabilities**: Link and user data handling security risks
    - _Mitigation_: Comprehensive security review and testing
    - _Contingency_: Conservative security defaults and restrictions

4. **Cross-Platform Consistency**: Different behavior across platforms/browsers
    - _Mitigation_: Extensive cross-platform testing
    - _Contingency_: Platform-specific implementations

### Low Risk

5. **User Experience Complexity**: Too many interactive features may confuse users
    - _Mitigation_: User testing and progressive disclosure
    - _Contingency_: Simplified default configuration

## Acceptance Criteria

### Epic Completion Checklist

- [ ] All user stories completed and tested
- [ ] Link detection and creation works reliably
- [ ] Mention system integrates with user directory
- [ ] Hashtag recognition and formatting is consistent
- [ ] Emoji picker provides comprehensive functionality
- [ ] Interactive message display is fully functional
- [ ] Security review completed and passed
- [ ] Performance requirements met
- [ ] Accessibility standards achieved

### Quality Gates

- [ ] Unit test coverage >90%
- [ ] Integration tests pass with real user data
- [ ] Security penetration testing completed
- [ ] Cross-browser compatibility verified
- [ ] Mobile usability testing passed
- [ ] Accessibility audit successful

## Handoff Documentation

### For Epic E005 (Mobile Optimization)

- Touch interaction patterns
- Mobile autocomplete strategies
- Performance optimization techniques
- Mobile-specific test cases

### For Epic E006 (Testing & QA)

- Interactive element test scenarios
- Security test cases
- Performance benchmarks
- Accessibility test requirements

---

**Epic Owner**: Features Team Lead  
**Stakeholders**: Security Engineer, UX Designer  
**Review Date**: End of Sprint 5  
**Dependencies**: E001 (Core Lexical Integration), E002 (Component Architecture)  
**Dependents**: E005, E006
