# Story 014: Add Analytics and SEO

**Story ID**: FDS-STORY-014  
**Epic**: [FDS-EPIC-005 - Community Features and Enhancements](../epics/epic-005-community-features.md)  
**Status**: Not Started  
**Priority**: Medium  
**Estimated Effort**: 1 day  
**Sprint**: 3

---

## User Story

**As a** product manager  
**I want** analytics tracking and SEO optimization  
**So that** we can measure documentation usage and improve discoverability

## Acceptance Criteria

- [ ] Analytics tracking configured
- [ ] Meta tags optimized on all pages
- [ ] Open Graph tags added
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] Structured data added
- [ ] Performance verified

## Definition of Done

- [ ] Analytics tracking confirmed working
- [ ] SEO meta tags verified
- [ ] Sitemap submitted to search engines
- [ ] Lighthouse score > 90
- [ ] Documentation updated

## Technical Details

### Vercel Analytics

```typescript
// apps/docs/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### SEO Configuration

Add to each page frontmatter:

```yaml
---
title: Page Title
description: SEO-optimized description (150-160 chars)
---
```

### Sitemap Generation

```typescript
// apps/docs/app/sitemap.ts
import { getPages } from '@/app/source';

export default function sitemap() {
  const pages = getPages();
  
  return pages.map((page) => ({
    url: `https://docs.zero-sources.dev${page.url}`,
    lastModified: new Date(),
  }));
}
```

## Dependencies

- Story 011: Vercel Deployment

---

**Story Owner**: Developer  
**Created**: November 1, 2025
