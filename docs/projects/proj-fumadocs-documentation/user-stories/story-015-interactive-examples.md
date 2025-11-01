# Story 015: Create Interactive Code Examples

**Story ID**: FDS-STORY-015  
**Epic**: [FDS-EPIC-005 - Community Features and Enhancements](../epics/epic-005-community-features.md)  
**Status**: Not Started  
**Priority**: Medium  
**Estimated Effort**: 1.5 days  
**Sprint**: 3

---

## User Story

**As a** developer learning zero-sources  
**I want** interactive code examples with syntax highlighting and copy buttons  
**So that** I can quickly try examples and learn effectively

## Acceptance Criteria

- [ ] Code syntax highlighting working
- [ ] Copy-to-clipboard buttons on code blocks
- [ ] Line highlighting supported
- [ ] Multiple code tabs working
- [ ] At least 3 interactive React examples created
- [ ] Code examples mobile-friendly

## Definition of Done

- [ ] Code block enhancements implemented
- [ ] Interactive examples created
- [ ] All features tested
- [ ] Mobile responsiveness verified
- [ ] Performance acceptable

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
    CodeBlock,
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
