# Story 015: Create Interactive Code Examples

**Story ID**: FDS-STORY-015  
**Epic**: [FDS-EPIC-005 - Community Features and Enhancements](../epics/epic-005-community-features.md)  
**Status**: ✅ Completed  
**Priority**: Medium  
**Estimated Effort**: 1.5 days  
**Sprint**: 3  
**Completed**: November 2, 2025

---

## User Story

**As a** developer learning zero-sources  
**I want** interactive code examples with syntax highlighting and copy buttons  
**So that** I can quickly try examples and learn effectively

## Acceptance Criteria

- [x] Code syntax highlighting working
- [x] Copy-to-clipboard buttons on code blocks
- [x] Line highlighting supported
- [x] Multiple code tabs working
- [x] At least 3 interactive React examples created
- [x] Code examples mobile-friendly

## Definition of Done

- [x] Code block enhancements implemented
- [x] Interactive examples created
- [x] All features tested
- [x] Mobile responsiveness verified
- [x] Performance acceptable

## Implementation Summary

### Components Created

1. **InteractiveDemo** (`components/fumadocs/interactive-demo.tsx`)
    - Live code execution environment
    - Editable code with syntax highlighting
    - Run and reset functionality
    - Output display with error handling
    - Mobile-responsive design

2. **CodeTabs** (`components/fumadocs/code-tabs.tsx`)
    - Multi-language code examples
    - Tab navigation
    - Syntax highlighted content
    - Responsive layout

### Documentation Created

1. **Interactive Examples** (`content/docs/demos/interactive-examples.mdx`)
    - 3+ interactive React examples
    - Basic Zero Query demo
    - Real-time Subscription demo
    - MongoDB Change Source setup demo
    - Code highlighting examples
    - Multi-language code tabs

2. **Code Block Guide** (`content/docs/contributing/code-blocks.mdx`)
    - Comprehensive guide on using code blocks
    - Syntax highlighting examples
    - Line highlighting patterns
    - File names and titles
    - Copy button documentation
    - Mobile responsiveness best practices

### Enhanced Documentation

- Updated `getting-started/quick-start.mdx` with titles and line highlighting
- Added navigation entries in meta.json files
- All code examples now use enhanced features

### Testing

See [story-015-testing.md](./story-015-testing.md) for detailed test results.

## Technical Details

### Code Block Configuration

Fumadocs provides code block enhancements by default:

```typescript
// apps/docs/mdx-components.tsx
import { Pre, CodeBlock } from 'fumadocs-ui/components/codeblock';

export function useMDXComponents(components) {
    return {
        ...components,
        pre: Pre,
        CodeBlock
    };
}
```

### Interactive Example

```mdx
import { InteractiveDemo } from '@/components/interactive-demo';

<InteractiveDemo
    code={`
const zero = createZero({
  server: 'http://localhost:4848'
});
  `}
/>
```

## Dependencies

- Story 001: Project Setup

---

**Story Owner**: Developer  
**Created**: November 1, 2025
