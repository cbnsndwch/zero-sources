# Information Architecture Documentation

## Overview

This document describes the information architecture (IA) for the Zero Sources documentation site. It defines the directory structure, URL hierarchy, navigation patterns, content categories, and naming conventions used throughout the documentation.

## Goals

The information architecture is designed to:

1. **Facilitate Discovery**: Help users find information quickly
2. **Support Learning**: Guide users from beginner to advanced topics
3. **Enable Scalability**: Allow documentation to grow without restructuring
4. **Maintain Consistency**: Ensure predictable patterns across all content
5. **Optimize for SEO**: Use clear, descriptive URLs and proper hierarchy

## Directory Structure

```
apps/docs/content/
├── meta.json                          # Root navigation configuration
├── index.mdx                          # Home page
│
├── getting-started/                   # Onboarding and basics
│   ├── meta.json
│   ├── index.mdx
│   ├── installation.mdx
│   ├── quick-start.mdx
│   ├── concepts.mdx
│   └── troubleshooting.mdx
│
├── packages/                         # Library documentation
│   ├── meta.json
│   ├── index.mdx
│   ├── zero-contracts/
│   ├── zero-source-mongodb/
│   ├── zero-watermark-zqlite/
│   ├── zero-watermark-nats-kv/
│   ├── zero-nest-mongoose/
│   ├── synced-queries/
│   └── zrocket-contracts/
│
├── change-sources/                    # Change source implementations
│   ├── meta.json
│   ├── index.mdx
│   ├── mongodb-server/
│   └── custom-implementation.mdx
│
├── demos/                             # Demo applications
│   ├── meta.json
│   ├── index.mdx
│   └── zrocket/
│
├── guides/                            # Task-oriented how-to guides
│   ├── meta.json
│   ├── index.mdx
│   ├── setting-up-change-source.mdx
│   ├── choosing-watermark-storage.mdx
│   ├── docker-deployment.mdx
│   └── troubleshooting.mdx
│
├── api/                               # API reference (generated)
│   ├── meta.json
│   └── index.mdx
│
└── architecture/                      # System architecture docs
    ├── meta.json
    ├── index.mdx
    ├── change-source-protocol.mdx
    ├── watermark-system.mdx
    └── monorepo-structure.mdx
```

## URL Hierarchy

### Principles

1. **Keep URLs Short**: Max 3-4 levels deep
2. **Use Hyphens**: Separate words with hyphens (kebab-case)
3. **Be Descriptive**: URL should indicate content
4. **Stay Stable**: Avoid changing URLs after publication

### URL Structure

```
/                                    # Home
/getting-started                     # Section overview
/getting-started/installation        # Specific page
/packages                            # Section overview
/packages/zero-source-mongodb        # Package overview
/packages/zero-source-mongodb/api    # Package sub-page
```

### URL Mapping

| Content Type | URL Pattern | Example |
|-------------|-------------|---------|
| Home | `/` | `/` |
| Section | `/section` | `/packages` |
| Page | `/section/page` | `/packages/zero-contracts` |
| Sub-page | `/section/page/sub` | `/packages/zero-contracts/installation` |

## Content Categories

### 1. Getting Started

**Purpose**: Onboard new users

**Content Types**:
- Installation guides
- Quick start tutorials
- Core concepts
- Troubleshooting basics

**Target Audience**: New users, developers

### 2. Libraries

**Purpose**: Document individual packages

**Content Types**:
- Library overviews
- Installation instructions
- Configuration guides
- API references
- Usage examples

**Target Audience**: Developers integrating libraries

### 3. Change Sources

**Purpose**: Document change source implementations

**Content Types**:
- Implementation guides
- Deployment documentation
- Configuration references
- Monitoring guides

**Target Audience**: DevOps, backend developers

### 4. Demos

**Purpose**: Showcase working examples

**Content Types**:
- Demo overviews
- Architecture explanations
- Running instructions
- Deployment guides

**Target Audience**: All users

### 5. Guides

**Purpose**: Task-oriented how-to documentation

**Content Types**:
- Step-by-step tutorials
- Configuration guides
- Deployment guides
- Troubleshooting guides

**Target Audience**: Practitioners, implementers

### 6. API Reference

**Purpose**: Complete API documentation

**Content Types**:
- Auto-generated API docs
- Type definitions
- Method signatures
- Usage examples

**Target Audience**: Developers writing code

### 7. Architecture

**Purpose**: Explain system design

**Content Types**:
- Architecture overviews
- Design decisions
- Protocol specifications
- System diagrams

**Target Audience**: Architects, senior developers

## Navigation Metadata

### Meta.json Schema

```json
{
  "title": "Section Title",
  "description": "Optional section description for SEO",
  "icon": "icon-name",
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

### Fields

- **title**: Section title shown in navigation
- **description**: SEO description (optional)
- **icon**: Icon name for UI (optional)
- **pages**: Array of page slugs or page objects

### Page Objects

Use page objects for:
- Custom titles different from file name
- External links
- Programmatic pages

## Frontmatter Schema

### Standard Frontmatter

```yaml
---
title: Page Title
description: Brief description for SEO (150-160 chars)
icon: optional-icon-name
date: 2025-11-01
lastModified: 2025-11-01
author: Author Name
tags: [tag1, tag2, tag3]
---
```

### Required Fields

- **title**: Page title (required)
- **description**: SEO description (required)

### Optional Fields

- **icon**: Icon for visual distinction
- **date**: Publication date
- **lastModified**: Last update date
- **author**: Content author
- **tags**: Content tags for search/filtering

## Naming Conventions

### File Names

- **Format**: kebab-case (all lowercase, hyphens between words)
- **Pattern**: `descriptive-name.mdx`
- **Examples**: 
  - ✅ `quick-start.mdx`
  - ✅ `docker-deployment.mdx`
  - ❌ `QuickStart.mdx`
  - ❌ `quick_start.mdx`

### Directory Names

- **Format**: kebab-case (all lowercase, hyphens between words)
- **Pattern**: `descriptive-name/`
- **Examples**:
  - ✅ `getting-started/`
  - ✅ `zero-source-mongodb/`
  - ❌ `GettingStarted/`
  - ❌ `zero_source_mongodb/`

### Special Files

- **Index**: `index.mdx` (section overview)
- **Meta**: `meta.json` (navigation config)

## Content Templates

Templates are provided in `apps/docs/templates/`:

- `library-page.template.mdx`: For library documentation
- `guide.template.mdx`: For how-to guides
- `architecture.template.mdx`: For architecture documentation

### Using Templates

```bash
# Copy template
cp apps/docs/templates/library-page.template.mdx \
   apps/docs/content/packages/my-library/index.mdx

# Edit and customize
```

## Cross-Linking Strategy

### Internal Links

Use relative or absolute paths:

```markdown
<!-- Relative link -->
[Installation Guide](/docs/installation)

<!-- Absolute link -->
[Getting Started](/docs/getting-started)

<!-- Cross-section link -->
[Zero Contracts](/docs/packages/zero-contracts)
```

### Link Guidelines

1. **Use Descriptive Text**: Avoid "click here"
2. **Link to Relevant Content**: Don't over-link
3. **Check Links**: Verify all links work
4. **Update When Moving**: Fix links if content moves

## Search Optimization

### SEO Best Practices

1. **Descriptive Titles**: Clear, keyword-rich titles
2. **Meta Descriptions**: 150-160 character summaries
3. **Header Hierarchy**: Use H1, H2, H3 properly
4. **Alt Text**: Describe all images
5. **Internal Linking**: Link related content

### Keywords

Primary keywords:
- Zero Sources
- MongoDB change streams
- Real-time synchronization
- Change source
- Watermark storage

## Content Guidelines

### Writing Style

- **Clear and Concise**: Get to the point quickly
- **Active Voice**: Use active rather than passive voice
- **Present Tense**: Describe current state
- **Consistent Terminology**: Use same terms throughout

### Code Examples

- **Complete**: Show working code
- **Commented**: Explain complex logic
- **Realistic**: Use real-world scenarios
- **Tested**: Verify examples work

### Formatting

- **Code Blocks**: Use syntax highlighting
- **Lists**: Use for sequences and options
- **Tables**: Use for comparisons
- **Callouts**: Highlight important information

## Maintenance

### Review Schedule

- **Quarterly**: Review all content for accuracy
- **On Release**: Update for new features
- **On Issue**: Fix reported problems immediately

### Update Process

1. Identify outdated content
2. Update content and code examples
3. Test all code examples
4. Update `lastModified` date
5. Submit pull request

## Migration Checklist

See `MIGRATION_CHECKLIST.md` for detailed migration steps.

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-01 | Initial information architecture |

## Questions and Feedback

For questions or suggestions about the information architecture:

1. Open an issue on GitHub
2. Discuss in GitHub Discussions
3. Submit a pull request with improvements
