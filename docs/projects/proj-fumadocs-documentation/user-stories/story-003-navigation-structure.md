# Story 003: Navigation Structure Implementation

**Story ID**: FDS-STORY-003  
**Epic**: [FDS-EPIC-001 - Initial Setup and Configuration](../epics/epic-001-initial-setup.md)  
**Status**: Not Started  
**Priority**: Critical  
**Estimated Effort**: 1 day  
**Sprint**: 1

---

## User Story

**As a** user browsing the zero-sources documentation  
**I want** intuitive navigation with sidebar, breadcrumbs, and table of contents  
**So that** I can easily find related content, understand my location, and quickly jump to sections

## Background/Context

After the basic Fumadocs project is set up and themed, we need to implement a comprehensive navigation structure that helps users discover content and understand the documentation hierarchy. This includes sidebar navigation for the full content tree, breadcrumbs for context, table of contents for long pages, and mobile-friendly navigation.

## Acceptance Criteria

**Given** the Fumadocs project is set up and themed (Stories 001-002 complete)  
**When** I implement the navigation structure  
**Then** I should have:

- [ ] Multi-level sidebar navigation showing all documentation sections
- [ ] Collapsible/expandable navigation groups
- [ ] Active page highlighting in sidebar
- [ ] Breadcrumb navigation showing current page hierarchy
- [ ] Table of contents (TOC) for pages with multiple sections
- [ ] TOC auto-highlights current section while scrolling
- [ ] Mobile-responsive hamburger menu
- [ ] Smooth scrolling to TOC anchors
- [ ] Navigation persistence (remembers expanded/collapsed state)
- [ ] Search integration in navigation bar (placeholder)
- [ ] Clear visual hierarchy in navigation items

## Definition of Done

- [ ] Sidebar navigation configured with all planned sections
- [ ] Navigation structure defined in `meta.json` files
- [ ] Breadcrumbs rendering correctly on all pages
- [ ] Table of contents generated automatically for long pages
- [ ] Mobile navigation tested on multiple device sizes
- [ ] Navigation state persists across page loads
- [ ] Active page correctly highlighted
- [ ] Code review completed
- [ ] Accessibility tested (keyboard navigation, screen readers)
- [ ] No console errors or warnings

## Technical Details

### Navigation Structure

Define the information architecture in `meta.json` files:

```json
// apps/docs/content/meta.json (root)
{
  "title": "zero-sources Documentation",
  "pages": ["index", "getting-started", "libraries", "change-sources", "demos", "guides", "api", "architecture"]
}
```

```json
// apps/docs/content/libraries/meta.json
{
  "title": "Libraries",
  "pages": [
    "zero-contracts",
    "zero-source-mongodb",
    "zero-watermark-zqlite",
    "zero-watermark-nats-kv",
    "zero-nest-mongoose",
    "synced-queries",
    "zrocket-contracts"
  ]
}
```

```json
// apps/docs/content/libraries/zero-contracts/meta.json
{
  "title": "zero-contracts",
  "pages": [
    "index",
    "installation",
    "usage",
    "api"
  ]
}
```

### Sidebar Configuration

Configure the sidebar in the root layout:

```typescript
// apps/docs/app/layout.tsx
import { DocsLayout } from 'fumadocs-ui/layout';
import { pageTree } from '@/app/source';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <DocsLayout
          tree={pageTree}
          nav={{
            title: 'zero-sources',
            url: '/',
          }}
          sidebar={{
            collapsible: true,
            defaultOpenLevel: 1,
          }}
        >
          {children}
        </DocsLayout>
      </body>
    </html>
  );
}
```

### Table of Contents Configuration

Configure TOC in the docs page component:

```typescript
// apps/docs/app/docs/[[...slug]]/page.tsx
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import { getPage, getPages } from '@/app/source';

export default async function Page({
  params,
}: {
  params: { slug?: string[] };
}) {
  const page = getPage(params.slug);

  if (!page) notFound();

  const MDX = page.data.exports.default;

  return (
    <DocsPage
      toc={page.data.exports.toc}
      full={page.data.full}
    >
      <DocsBody>
        <h1>{page.data.title}</h1>
        <MDX />
      </DocsBody>
    </DocsPage>
  );
}
```

### Breadcrumb Implementation

Breadcrumbs should be automatically generated from the page tree:

```typescript
// Fumadocs provides breadcrumbs automatically through DocsPage
// Configure in layout or page component:
<DocsPage
  breadcrumb={{
    enabled: true,
    separator: '/',
  }}
>
  {/* page content */}
</DocsPage>
```

### Mobile Navigation

Configure responsive navigation:

```typescript
// apps/docs/app/layout.tsx
<DocsLayout
  tree={pageTree}
  nav={{
    title: 'zero-sources',
    url: '/',
    transparentMode: 'top',
  }}
  sidebar={{
    collapsible: true,
    banner: <SidebarBanner />,
    footer: <SidebarFooter />,
  }}
>
  {children}
</DocsLayout>
```

### Navigation Icons

Add icons to navigation items:

```typescript
// apps/docs/lib/source.ts
import { loader } from 'fumadocs-core/source';
import { createMDXSource } from 'fumadocs-mdx';
import { icons } from 'lucide-react';

export const { getPage, getPages, pageTree } = loader({
  baseUrl: '/docs',
  rootDir: 'docs',
  icon(icon) {
    if (icon && icon in icons)
      return createElement(icons[icon as keyof typeof icons]);
  },
  source: createMDXSource(/* ... */),
});
```

## Testing Requirements

### Manual Testing Scenarios

1. **Desktop Navigation**
   - Verify sidebar displays all sections
   - Test expanding/collapsing navigation groups
   - Verify active page highlighting
   - Test clicking navigation links
   - Verify breadcrumbs update correctly
   - Test TOC links and smooth scrolling
   - Verify TOC highlighting while scrolling

2. **Mobile Navigation**
   - Test hamburger menu open/close
   - Verify navigation slides in from correct side
   - Test closing navigation after link click
   - Verify touch gestures work correctly
   - Test on various mobile screen sizes

3. **Accessibility Testing**
   - Test keyboard navigation (Tab, Enter, Escape)
   - Verify focus indicators are visible
   - Test with screen reader (announce navigation structure)
   - Verify ARIA labels are correct
   - Test heading hierarchy (outline)

4. **Edge Cases**
   - Very long page titles in navigation
   - Deeply nested navigation (3+ levels)
   - Pages with no sections (no TOC needed)
   - Pages with many sections (long TOC)
   - Navigation with special characters in titles

### Automated Testing

```typescript
// Example test for navigation structure
describe('Navigation Structure', () => {
  it('should render sidebar with all main sections', () => {
    // Test navigation rendering
  });

  it('should highlight active page in sidebar', () => {
    // Test active page highlighting
  });

  it('should generate breadcrumbs correctly', () => {
    // Test breadcrumb generation
  });

  it('should generate TOC for pages with headings', () => {
    // Test TOC generation
  });
});
```

## Dependencies

**Depends on:**
- Story 001: Project Setup (infrastructure)
- Story 002: Theme Configuration (styling foundation)

**Blocks:**
- Story 005: Getting Started Guide (needs navigation to organize content)
- Story 004b: Core Library Documentation (needs navigation structure)

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Navigation structure too complex | Start with simple 2-level hierarchy, expand as needed |
| Mobile navigation UX issues | Test early and often on real devices |
| TOC performance on very long pages | Limit TOC depth or use virtual scrolling |
| Navigation state management bugs | Use Fumadocs built-in state management |

## Notes

- Fumadocs provides most navigation features out of the box
- Focus on configuration and customization rather than building from scratch
- Consider adding navigation search in a future story
- Keep navigation structure shallow (max 3 levels) for better UX
- Use consistent naming conventions for navigation labels
- Consider adding icons to main navigation sections for visual appeal

## Related Links

- [Fumadocs Navigation Documentation](https://fumadocs.dev//docs/ui/navigation)
- [Fumadocs Table of Contents](https://fumadocs.dev//docs/ui/table-of-contents)
- [Next.js App Router Layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts)

---

**Story Owner**: Developer  
**Tester**: QA Team  
**Created**: November 1, 2025  
**Last Updated**: November 1, 2025
