# Story 004b: Migrate Core Library Documentation

**Story ID**: FDS-STORY-004b  
**Epic**: [FDS-EPIC-002 - Content Migration and Organization](../epics/epic-002-content-migration.md)  
**Status**: Not Started  
**Priority**: High  
**Estimated Effort**: 2 days  
**Sprint**: 2

---

## User Story

**As a** developer using zero-sources core libraries  
**I want** comprehensive documentation for zero-contracts and zero-source-mongodb  
**So that** I can understand their APIs, integrate them into my project, and follow best practices

## Background/Context

The core libraries (`@cbnsndwch/zero-contracts` and `@cbnsndwch/zero-source-mongodb`) are fundamental to the zero-sources ecosystem. Their documentation must be migrated from existing README files to the new Fumadocs site with enhanced examples, clearer structure, and integration with the overall documentation system.

## Acceptance Criteria

**Given** the information architecture is defined (Story 004 complete)  
**When** I migrate the core library documentation  
**Then** I should have:

- [ ] zero-contracts documentation migrated and enhanced
- [ ] zero-source-mongodb documentation migrated and enhanced
- [ ] Installation guides for both libraries
- [ ] Usage guides with code examples
- [ ] Configuration documentation
- [ ] Best practices sections
- [ ] Troubleshooting guides
- [ ] Links to API reference (placeholder for Story 009)
- [ ] All code examples tested and working
- [ ] Internal cross-references working

## Definition of Done

- [ ] All content files created in correct directories
- [ ] Frontmatter properly configured
- [ ] Navigation entries added
- [ ] Code examples tested
- [ ] All links verified
- [ ] Mobile responsiveness checked
- [ ] Technical review completed
- [ ] Content proofread for clarity
- [ ] Changes committed to repository

## Technical Details

### zero-contracts Documentation Structure

```
apps/docs/content/libraries/zero-contracts/
├── meta.json
├── index.mdx                    # Overview
├── installation.mdx             # Installation guide
├── usage.mdx                    # Usage examples
├── schemas.mdx                  # Schema utilities
├── types.mdx                    # Type definitions
└── api/                         # API reference (Story 009)
```

### zero-source-mongodb Documentation Structure

```
apps/docs/content/libraries/zero-source-mongodb/
├── meta.json
├── index.mdx                    # Overview
├── installation.mdx             # Installation guide
├── configuration.mdx            # Configuration options
├── discriminated-unions.mdx     # Discriminated union support
├── change-streams.mdx           # MongoDB change streams
├── advanced.mdx                 # Advanced topics
├── troubleshooting.mdx          # Common issues
└── api/                         # API reference (Story 009)
```

### Content to Migrate

**From existing READMEs:**
- `libs/zero-contracts/README.md`
- `libs/zero-source-mongodb/README.md`
- Related documentation from `docs/` directory

**Enhancement Requirements:**
- Add more code examples
- Include configuration examples
- Add "Next Steps" sections
- Create comparison tables where useful
- Add callout boxes for important information
- Include links to related documentation

## Dependencies

**Depends on:**
- Story 004: Information Architecture (provides structure)

**Related:**
- Story 009: API Documentation Generation (will add API references)

## Libraries to Document

### @cbnsndwch/zero-contracts

**Key Topics:**
- Contract definitions for Zero protocol
- Schema utilities
- Type definitions
- Shared interfaces
- Utility functions

**Example Content Outline:**

```markdown
# zero-contracts

Core contracts and utilities for building Zero-based applications.

## Overview

@cbnsndwch/zero-contracts provides shared TypeScript contracts...

## Key Features

- Type-safe schema definitions
- Shared interfaces for change sources
- Utility functions for Zero protocol
- Full TypeScript support

## Installation

\`\`\`bash
pnpm add @cbnsndwch/zero-contracts
\`\`\`

## Quick Start

\`\`\`typescript
import { defineSchema } from '@cbnsndwch/zero-contracts';

const schema = defineSchema({
  // schema definition
});
\`\`\`

## Use Cases

- Building custom change sources
- Defining data schemas
- Implementing Zero clients

## Next Steps

- [Usage Guide](./usage)
- [Schema Guide](./schemas)
- [API Reference](./api)
```

### @cbnsndwch/zero-source-mongodb

**Key Topics:**
- MongoDB change source implementation
- Configuration options
- Discriminated union support
- Change stream handling
- Performance optimization
- Troubleshooting

**Example Content Outline:**

```markdown
# zero-source-mongodb

Production-ready MongoDB change source for Rocicorp Zero.

## Overview

@cbnsndwch/zero-source-mongodb enables real-time synchronization...

## Key Features

- MongoDB change stream integration
- Discriminated union support for polymorphic data
- Configurable watermark storage
- Production-tested performance
- Full TypeScript support

## Installation

\`\`\`bash
pnpm add @cbnsndwch/zero-source-mongodb
\`\`\`

## Quick Start

\`\`\`typescript
import { createMongoDBSource } from '@cbnsndwch/zero-source-mongodb';

const source = createMongoDBSource({
  mongoUrl: process.env.MONGO_URL,
  dbName: 'myapp',
});
\`\`\`

## Architecture

[Diagram showing change stream → Zero protocol flow]

## Next Steps

- [Configuration Guide](./configuration)
- [Discriminated Unions](./discriminated-unions)
- [Troubleshooting](./troubleshooting)
```

## Testing Requirements

### Content Quality Checks

- [ ] All code examples include proper imports
- [ ] Code examples use realistic variable names
- [ ] Examples show common use cases
- [ ] Configuration examples are complete
- [ ] Error handling is demonstrated
- [ ] TypeScript types are shown

### Technical Verification

- [ ] Code examples compile without errors
- [ ] Configuration examples are valid
- [ ] All links resolve correctly
- [ ] Navigation works properly
- [ ] Search indexing includes content
- [ ] Mobile layout is readable

### Review Checklist

- [ ] Technical accuracy verified by library maintainer
- [ ] Examples tested in real environment
- [ ] Documentation is comprehensive but not overwhelming
- [ ] Clear progression from basic to advanced topics
- [ ] Troubleshooting section addresses common issues

## Migration Process

1. **Preparation**
   - Review existing README files
   - Identify gaps in current documentation
   - Gather additional examples from code/issues

2. **Content Creation**
   - Create directory structure
   - Set up meta.json files
   - Migrate and enhance README content
   - Add new sections as needed
   - Create code examples
   - Add cross-references

3. **Testing**
   - Test all code examples
   - Verify all links
   - Check navigation
   - Mobile testing
   - Technical review

4. **Refinement**
   - Address review feedback
   - Improve clarity
   - Add missing information
   - Final proofread

## Notes

- These are the most important libraries - documentation quality is critical
- Work closely with library maintainers during migration
- Consider adding diagrams for complex concepts
- Link to relevant external resources (MongoDB docs, Zero docs)
- Keep examples simple but realistic
- Document common pitfalls and how to avoid them

---

**Story Owner**: Documentation Specialist / Developer  
**Technical Reviewer**: Library Maintainer  
**Created**: November 1, 2025  
**Last Updated**: November 1, 2025
