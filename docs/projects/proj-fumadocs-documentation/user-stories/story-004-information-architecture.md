# Story 004: Define Information Architecture

**Story ID**: FDS-STORY-004  
**Epic**: [FDS-EPIC-002 - Content Migration and Organization](../epics/epic-002-content-migration.md)  
**Status**: Not Started  
**Priority**: Critical  
**Estimated Effort**: 0.5 days  
**Sprint**: 1

---

## User Story

**As a** documentation maintainer  
**I want** a well-defined information architecture and content organization strategy  
**So that** content migration is consistent, discoverable, and scalable as the documentation grows

## Background/Context

Before migrating existing documentation and creating new content, we need to establish a clear information architecture. This includes defining the directory structure, URL hierarchy, navigation metadata, content categories, and naming conventions. This foundational work ensures consistency and makes it easier for both maintainers and users to find and organize content.

## Acceptance Criteria

**Given** the Fumadocs project is set up with navigation  
**When** I define the information architecture  
**Then** I should have:

- [ ] Complete content directory structure created
- [ ] URL hierarchy and routing strategy defined
- [ ] `meta.json` files created for all major sections
- [ ] Content categories clearly defined
- [ ] Naming conventions documented
- [ ] File and folder naming standards established
- [ ] Frontmatter schema defined
- [ ] Cross-linking strategy documented
- [ ] Content templates ready for use
- [ ] Migration checklist created

## Definition of Done

- [ ] Directory structure created in `apps/docs/content/`
- [ ] All `meta.json` files created with proper structure
- [ ] Documentation of information architecture written
- [ ] Content organization guide created
- [ ] Templates created for different content types
- [ ] Migration checklist document created
- [ ] Navigation structure approved
- [ ] Code review completed
- [ ] Documentation committed to repository

## Technical Details

### Directory Structure

Create the following structure in `apps/docs/content/`:

```text
apps/docs/content/
├── meta.json                          # Root navigation
├── index.mdx                          # Home page
│
├── getting-started/
│   ├── meta.json
│   ├── index.mdx
│   ├── installation.mdx
│   ├── quick-start.mdx
│   ├── concepts.mdx
│   └── troubleshooting.mdx
│
├── libraries/
│   ├── meta.json
│   ├── index.mdx                      # Libraries overview
│   │
│   ├── zero-contracts/
│   │   ├── meta.json
│   │   ├── index.mdx
│   │   ├── installation.mdx
│   │   ├── usage.mdx
│   │   └── api/                       # Generated API docs
│   │
│   ├── zero-source-mongodb/
│   │   ├── meta.json
│   │   ├── index.mdx
│   │   ├── installation.mdx
│   │   ├── configuration.mdx
│   │   ├── discriminated-unions.mdx
│   │   ├── change-streams.mdx
│   │   └── api/
│   │
│   ├── zero-watermark-zqlite/
│   │   ├── meta.json
│   │   ├── index.mdx
│   │   ├── installation.mdx
│   │   ├── configuration.mdx
│   │   └── api/
│   │
│   ├── zero-watermark-nats-kv/
│   │   ├── meta.json
│   │   ├── index.mdx
│   │   ├── installation.mdx
│   │   ├── configuration.mdx
│   │   └── api/
│   │
│   ├── zero-nest-mongoose/
│   │   ├── meta.json
│   │   ├── index.mdx
│   │   ├── installation.mdx
│   │   ├── usage.mdx
│   │   └── api/
│   │
│   ├── synced-queries/
│   │   ├── meta.json
│   │   ├── index.mdx
│   │   ├── installation.mdx
│   │   ├── usage.mdx
│   │   └── api/
│   │
│   └── zrocket-contracts/
│       ├── meta.json
│       ├── index.mdx
│       └── api/
│
├── change-sources/
│   ├── meta.json
│   ├── index.mdx                      # Change sources overview
│   │
│   ├── mongodb-server/
│   │   ├── meta.json
│   │   ├── index.mdx
│   │   ├── deployment.mdx
│   │   ├── configuration.mdx
│   │   └── monitoring.mdx
│   │
│   └── custom-implementation.mdx
│
├── demos/
│   ├── meta.json
│   ├── index.mdx                      # Demos overview
│   │
│   └── zrocket/
│       ├── meta.json
│       ├── index.mdx
│       ├── architecture.mdx
│       ├── running-locally.mdx
│       └── deployment.mdx
│
├── guides/
│   ├── meta.json
│   ├── index.mdx                      # Guides overview
│   ├── setting-up-change-source.mdx
│   ├── choosing-watermark-storage.mdx
│   ├── docker-deployment.mdx
│   └── troubleshooting.mdx
│
├── api/
│   ├── meta.json
│   └── index.mdx                      # API reference overview
│   # Generated API docs will be added here
│
└── architecture/
    ├── meta.json
    ├── index.mdx                      # Architecture overview
    ├── change-source-protocol.mdx
    ├── watermark-system.mdx
    └── monorepo-structure.mdx
```

### URL Hierarchy

Define clean, predictable URLs:

```text
/ (Home)
/getting-started
/getting-started/installation
/getting-started/quick-start
/getting-started/concepts
/getting-started/troubleshooting

/libraries
/libraries/zero-contracts
/libraries/zero-contracts/installation
/libraries/zero-contracts/usage
/libraries/zero-contracts/api

/change-sources
/change-sources/mongodb-server
/change-sources/mongodb-server/deployment

/demos
/demos/zrocket
/demos/zrocket/architecture

/guides
/guides/setting-up-change-source
/guides/docker-deployment

/api
/api/zero-contracts
/api/zero-source-mongodb

/architecture
/architecture/change-source-protocol
```

### Meta.json Schema

Define standard structure for `meta.json` files:

```json
{
  "title": "Section Title",
  "description": "Optional section description",
  "icon": "optional-icon-name",
  "pages": [
    "page-slug-1",
    "page-slug-2",
    {
      "title": "Custom Title",
      "url": "/custom-url",
      "external": false
    }
  ]
}
```

### Frontmatter Schema

Define standard frontmatter for MDX files:

```yaml
---
title: Page Title
description: Brief description for SEO and previews (150-160 chars)
icon: optional-icon-name
date: 2025-11-01
lastModified: 2025-11-01
author: Author Name
tags: [tag1, tag2, tag3]
---
```

### Naming Conventions

**Files and Directories:**

- Use kebab-case for all file and folder names
- Use descriptive names that match page titles
- Index files: `index.mdx` for section overviews
- No spaces or special characters except hyphens

**Page Slugs:**

- Derived from file names
- Keep URLs short but descriptive
- Use hyphens to separate words
- Avoid deep nesting (max 3 levels preferred)

**Content Categories:**

1. **Getting Started**: Onboarding, installation, quick starts
2. **Libraries**: Individual library documentation
3. **Change Sources**: Change source implementations
4. **Demos**: Example applications and showcases
5. **Guides**: Task-oriented how-to documentation
6. **API Reference**: Auto-generated API documentation
7. **Architecture**: System design and technical architecture

### Content Templates

Create templates in `apps/docs/templates/`:

#### Library Page Template

```markdown
---
title: [Library Name]
description: [Brief description]
---

# [Library Name]

[Brief introduction paragraph]

## Overview

[What this library does and why you would use it]

## Key Features

- Feature 1
- Feature 2
- Feature 3

## Installation

\`\`\`bash
pnpm add @cbnsndwch/[library-name]
\`\`\`

## Quick Start

[Minimal example to get started]

## Next Steps

- [Installation Guide](./installation)
- [Usage Guide](./usage)
- [API Reference](./api)
```

#### Guide Template

```markdown
---
title: [Guide Title]
description: [Brief description]
---

# [Guide Title]

[Introduction explaining what this guide covers]

## Prerequisites

- Prerequisite 1
- Prerequisite 2

## Steps

### Step 1: [Step Title]

[Explanation and code]

### Step 2: [Step Title]

[Explanation and code]

## Troubleshooting

### Issue: [Common Issue]

**Solution**: [How to fix]

## Next Steps

- [Related guide 1]
- [Related guide 2]
```

### Migration Checklist

Create `MIGRATION_CHECKLIST.md`:

```markdown
# Content Migration Checklist

For each library/module being migrated:

- [ ] Create directory structure
- [ ] Create meta.json file
- [ ] Migrate README.md to index.mdx
- [ ] Add proper frontmatter
- [ ] Convert markdown to MDX if needed
- [ ] Add code examples with syntax highlighting
- [ ] Create installation guide
- [ ] Create usage guide
- [ ] Plan API reference integration
- [ ] Add to navigation
- [ ] Test all internal links
- [ ] Test all external links
- [ ] Review for accuracy
- [ ] Verify code examples work
- [ ] Check mobile responsiveness
```

## Testing Requirements

### Manual Testing Scenarios

1. **Directory Structure**
   - Verify all directories created
   - Check permissions are correct
   - Ensure no typos in folder names

2. **Meta.json Files**
   - Validate JSON syntax
   - Verify all referenced pages exist
   - Test navigation rendering

3. **Templates**
   - Create test page from each template
   - Verify templates are complete
   - Check frontmatter works correctly

4. **Documentation**
   - Read through information architecture docs
   - Verify clarity and completeness
   - Test that examples work

### Validation Script

Create a validation script to check the structure:

```typescript
// scripts/validate-structure.ts
import fs from 'fs';
import path from 'path';

const contentDir = 'apps/docs/content';
const requiredDirs = [
  'getting-started',
  'libraries',
  'change-sources',
  'demos',
  'guides',
  'api',
  'architecture',
];

// Validate directory structure
for (const dir of requiredDirs) {
  const dirPath = path.join(contentDir, dir);
  if (!fs.existsSync(dirPath)) {
    console.error(`Missing directory: ${dir}`);
  } else {
    console.log(`✓ Directory exists: ${dir}`);
  }
}

// Validate meta.json files
// Add validation logic
```

## Dependencies

**Depends on:**

- Story 001: Project Setup (provides base infrastructure)

**Blocks:**

- Story 004b: Core Library Documentation
- Story 005: Getting Started Guide
- Story 006: Watermark Libraries Documentation
- Story 007: Change Source Documentation

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Information architecture changes during migration | Keep structure flexible, document changes |
| URL structure not SEO-friendly | Research best practices, get feedback early |
| Too many or too few categories | Start conservative, add categories as needed |
| Inconsistent naming | Create and enforce style guide |

## Notes

- This is foundational work - take time to get it right
- Involve stakeholders in reviewing the structure
- Consider future growth when planning hierarchy
- Keep URLs stable once content is published
- Document the reasoning behind structural decisions
- This structure should last for years, so plan carefully

## Related Links

- [Fumadocs File Conventions](https://fumadocs.dev//docs/ui/page-conventions)
- [Next.js File-based Routing](https://nextjs.org/docs/app/building-your-application/routing)
- [Information Architecture Best Practices](https://www.nngroup.com/articles/information-architecture-101/)

---

**Story Owner**: Product Manager  
**Reviewer**: Development Team  
**Created**: November 1, 2025  
**Last Updated**: November 1, 2025
