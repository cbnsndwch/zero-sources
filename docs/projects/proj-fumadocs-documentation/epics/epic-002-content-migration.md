# Epic 002: Content Migration and Organization

**Epic ID**: FDS-EPIC-002
**Status**: Not Started
**Priority**: High
**Estimated Effort**: 5-7 days
**Sprint**: 1-2

---

## Epic Summary

Migrate existing documentation from scattered README files across the zero-sources monorepo into the Fumadocs content structure. This includes organizing content with a clear information architecture, converting markdown to MDX where needed, and ensuring all libraries, change sources, and guides are properly documented and discoverable.

## User Value Proposition

**As a** developer using zero-sources libraries
**I want** comprehensive, well-organized documentation for all libraries and features
**So that** I can quickly find information, understand capabilities, and implement solutions

## Success Metrics

- All 9 libraries have complete documentation
- All 2 change sources have complete documentation
- Getting started guide reduces onboarding time by 50%
- Search returns relevant results within top 5
- Internal link success rate > 95%
- Average documentation page has clear examples
- User satisfaction score > 4/5 for documentation clarity

## User Stories Breakdown

### Phase 1: Foundation and Structure

1. **[Story 004: Define Information Architecture](../user-stories/story-004-library-docs-migration.md)** - Priority: Critical
   - Create content directory structure
   - Define navigation hierarchy
   - Plan URL structure
   - Create content templates

2. **[Story 005: Create Getting Started Guide](../user-stories/story-005-getting-started-guide.md)** - Priority: Critical
   - Write comprehensive getting started guide
   - Include installation instructions
   - Add quick start examples
   - Create troubleshooting section

### Phase 2: Library Documentation

3. **Migrate Core Libraries** - Priority: High
   - `@cbnsndwch/zero-contracts`
   - `@cbnsndwch/zero-source-mongodb`
   - `@cbnsndwch/synced-queries`

4. **Migrate Watermark Storage Libraries** - Priority: High
   - `@cbnsndwch/zero-watermark-zqlite`
   - `@cbnsndwch/zero-watermark-nats-kv`

5. **Migrate Integration Libraries** - Priority: High
   - `@cbnsndwch/zero-nest-mongoose`
   - `@cbnsndwch/zrocket-contracts`

### Phase 3: Application Documentation

6. **Migrate Change Source Documentation** - Priority: High
   - `source-mongodb-server`
   - Custom change source guides

7. **Migrate Demo Application Documentation** - Priority: Medium
   - ZRocket demo application
   - Architecture documentation
   - Deployment guides

### Phase 4: Guides and Advanced Content

8. **Create How-To Guides** - Priority: Medium
   - Setting up a change source
   - Choosing watermark storage
   - Docker deployment
   - MongoDB configuration
   - Troubleshooting common issues

9. **Migrate Architecture Documentation** - Priority: Medium
   - Change source protocol
   - Watermark system architecture
   - Discriminated unions
   - Monorepo structure

## Technical Requirements

### Content Structure

```text
apps/docs/content/
├── index.mdx                              # Home page
├── meta.json                              # Root navigation
├── getting-started/
│   ├── meta.json
│   ├── index.mdx                          # Overview
│   ├── installation.mdx                   # Installation guide
│   ├── quick-start.mdx                    # Quick start tutorial
│   ├── concepts.mdx                       # Core concepts
│   └── troubleshooting.mdx                # Common issues
├── libraries/
│   ├── meta.json
│   ├── index.mdx                          # Libraries overview
│   ├── zero-contracts/
│   │   ├── meta.json
│   │   ├── index.mdx                      # Library overview
│   │   ├── installation.mdx               # Installation
│   │   ├── usage.mdx                      # Usage examples
│   │   ├── configuration.mdx              # Configuration
│   │   └── examples.mdx                   # Code examples
│   ├── zero-source-mongodb/
│   │   ├── meta.json
│   │   ├── index.mdx
│   │   ├── installation.mdx
│   │   ├── configuration.mdx
│   │   ├── change-streams.mdx
│   │   ├── discriminated-unions.mdx
│   │   ├── metadata-api.mdx
│   │   └── examples.mdx
│   ├── zero-watermark-zqlite/
│   │   └── ...
│   ├── zero-watermark-nats-kv/
│   │   └── ...
│   ├── zero-nest-mongoose/
│   │   └── ...
│   ├── synced-queries/
│   │   └── ...
│   └── zrocket-contracts/
│       └── ...
├── change-sources/
│   ├── meta.json
│   ├── index.mdx                          # Overview
│   ├── mongodb-server/
│   │   ├── meta.json
│   │   ├── index.mdx
│   │   ├── installation.mdx
│   │   ├── configuration.mdx
│   │   ├── deployment.mdx
│   │   └── monitoring.mdx
│   └── custom-implementation.mdx          # Build custom source
├── demos/
│   ├── meta.json
│   ├── index.mdx                          # Demos overview
│   └── zrocket/
│       ├── meta.json
│       ├── index.mdx                      # ZRocket overview
│       ├── architecture.mdx               # Architecture
│       ├── running-locally.mdx            # Local setup
│       └── deployment.mdx                 # Deployment
├── guides/
│   ├── meta.json
│   ├── index.mdx                          # Guides overview
│   ├── setting-up-change-source.mdx
│   ├── choosing-watermark-storage.mdx
│   ├── docker-deployment.mdx
│   ├── mongodb-configuration.mdx
│   ├── production-considerations.mdx
│   └── troubleshooting.mdx
└── architecture/
    ├── meta.json
    ├── index.mdx                          # Architecture overview
    ├── change-source-protocol.mdx
    ├── watermark-system.mdx
    ├── discriminated-unions.mdx
    └── monorepo-structure.mdx
```

### Content Templates

#### Library Documentation Template

```mdx
---
title: [Library Name]
description: Brief description of the library
---

# [Library Name]

Brief overview paragraph explaining what the library does.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

```bash
pnpm add @cbnsndwch/[library-name]
```

## Quick Start

```typescript
// Simple usage example
import { Something } from '@cbnsndwch/[library-name]';

const example = new Something();
```

## Usage

Detailed usage instructions...

## Configuration

Configuration options and examples...

## Examples

Real-world examples...

## API Reference

Link to auto-generated API documentation...

## Related

- [Related Library 1](../other-library)
- [Guide: How to...](../../guides/something)
```

### Migration Checklist Per Library

For each library:

- [ ] Create directory structure
- [ ] Migrate README.md to index.mdx
- [ ] Add frontmatter metadata
- [ ] Create installation.mdx
- [ ] Create usage.mdx
- [ ] Add code examples with syntax highlighting
- [ ] Create configuration.mdx (if applicable)
- [ ] Add meta.json for navigation
- [ ] Link to API reference (Epic 003)
- [ ] Add cross-references to related content
- [ ] Test all internal links
- [ ] Review for clarity and completeness
- [ ] Add to search index

## Acceptance Criteria

### Epic-Level Acceptance Criteria

**Content Completeness**:

- [ ] All 9 libraries documented
- [ ] All 2 change sources documented
- [ ] Getting started guide complete
- [ ] At least 10 how-to guides created
- [ ] Architecture documentation migrated
- [ ] All existing README content preserved

**Quality Standards**:

- [ ] All pages have frontmatter metadata
- [ ] All code examples have syntax highlighting
- [ ] All internal links work correctly
- [ ] No broken external links
- [ ] Consistent formatting across all pages
- [ ] Clear, concise writing style
- [ ] Examples tested and verified

**Navigation and Discoverability**:

- [ ] Navigation hierarchy reflects content structure
- [ ] All pages accessible from navigation
- [ ] Breadcrumbs work on all pages
- [ ] Search finds relevant content
- [ ] Related content linked appropriately

**User Experience**:

- [ ] Average page load time < 2 seconds
- [ ] Mobile-responsive content
- [ ] Code blocks have copy button
- [ ] Callouts used for important information
- [ ] Step-by-step guides have clear progression

### Definition of Done

- [ ] All user stories completed
- [ ] Content review by documentation specialist
- [ ] Technical review by library maintainers
- [ ] Link checking passed
- [ ] Spell checking passed
- [ ] Lighthouse SEO score > 90
- [ ] User testing completed (sample audience)
- [ ] Feedback incorporated

## Dependencies

### External Dependencies

- Epic 001 (Initial Setup) must be complete

### Internal Dependencies

- Existing README files in libs/ and apps/
- Existing documentation in docs/

### Blocks

- None identified

## Assumptions

1. Existing README content is accurate and up-to-date
2. Library maintainers available for technical review
3. Code examples in existing docs still work
4. Screenshots and images available or can be created

## Risk Factors

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Content migration takes longer than estimated | Medium | High | Prioritize libraries by usage, migrate incrementally |
| Existing documentation outdated | Medium | Medium | Verify examples during migration, update as needed |
| Inconsistent quality across libraries | Low | Medium | Use templates, establish style guide, review process |
| Broken links after migration | Medium | Low | Automated link checking, thorough testing |
| Poor search results | Medium | Low | Test search during migration, adjust content structure |

## Technical Design Decisions

### Decision 1: MDX vs Markdown

**Decision**: Use MDX for all content
**Rationale**: Allows embedding React components, more flexibility for interactive content

### Decision 2: Content Organization

**Decision**: Organize by user journey (getting started → libraries → guides → architecture)
**Rationale**: Progressive disclosure, matches user mental model

### Decision 3: Code Example Format

**Decision**: Use executable, tested code examples
**Rationale**: Ensures examples work, builds user confidence

### Decision 4: URL Structure

**Decision**: Mirror content directory structure in URLs
**Rationale**: Predictable, SEO-friendly, easy to maintain

## Migration Priority Order

### Phase 1 (Week 1): MVP

1. Home page
2. Getting started guide
3. `zero-contracts` (foundational)
4. `zero-source-mongodb` (most used)
5. `source-mongodb-server` (change source)

### Phase 2 (Week 2): Core Libraries

6. `zero-watermark-zqlite`
7. `zero-watermark-nats-kv`
8. `zero-nest-mongoose`
9. `synced-queries`

### Phase 3 (Week 3): Demos and Guides

10. ZRocket demo
11. How-to guides (5-10 guides)
12. Architecture documentation

### Phase 4 (Week 4): Polish

13. Remaining libraries
14. Advanced guides
15. Troubleshooting content
16. Cross-linking optimization

## Notes

- Focus on quality over speed - better to have fewer excellent pages than many mediocre ones
- Involve library maintainers in content review
- Test examples as you migrate them
- Consider adding video tutorials for complex topics (future)
- Keep original READMEs updated with link to documentation site

## Related Documentation

- [Style Guide](../docs/content-organization.md)
- [Content Templates](../docs/content-organization.md)
- [MDX Guide](https://mdxjs.com/)
- [Fumadocs Content](https://fumadocs.vercel.app/docs/headless/mdx)

---

**Created**: November 1, 2025
**Last Updated**: November 1, 2025
**Epic Owner**: Product Manager
