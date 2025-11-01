# Story 005: Create Getting Started Guide

**Story ID**: FDS-STORY-005
**Epic**: [FDS-EPIC-002 - Content Migration and Organization](../epics/epic-002-content-migration.md)
**Status**: Not Started
**Priority**: Critical
**Estimated Effort**: 1 day
**Sprint**: 1

---

## User Story

**As a** developer new to zero-sources
**I want** a clear, comprehensive getting started guide
**So that** I can quickly understand what zero-sources offers and integrate it into my project

## Background/Context

The getting started guide is one of the most critical pieces of documentation. It's often the first content new users encounter and sets the tone for their entire experience. We need to create a guide that quickly explains what zero-sources is, helps users install and configure libraries, and gets them productive within 30 minutes.

## Acceptance Criteria

**Given** I am a developer new to zero-sources
**When** I visit the getting started guide
**Then** I should be able to:

- [ ] Understand what zero-sources is and why I would use it
- [ ] See what libraries and tools are available
- [ ] Follow clear installation instructions
- [ ] Complete a "hello world" example in < 15 minutes
- [ ] Understand core concepts (change sources, watermarks, etc.)
- [ ] Know where to go next for more advanced topics
- [ ] Find solutions to common initial problems
- [ ] See links to relevant library documentation

## Definition of Done

- [ ] Getting started guide written in MDX format
- [ ] All code examples tested and verified working
- [ ] Navigation entry added
- [ ] Internal links to library docs working
- [ ] External links to Rocicorp Zero docs included
- [ ] Screenshots or diagrams included (if helpful)
- [ ] Content reviewed for clarity and accuracy
- [ ] Technical review by library maintainer
- [ ] User testing with fresh developer (if possible)
- [ ] Published to documentation site

## Technical Details

### Content Structure

Create the following files:

```text
apps/docs/content/getting-started/
├── meta.json
├── index.mdx
├── installation.mdx
├── quick-start.mdx
├── concepts.mdx
└── troubleshooting.mdx
```

### File Content Templates

#### `apps/docs/content/getting-started/meta.json`

```json
{
  "title": "Getting Started",
  "pages": [
    "index",
    "installation",
    "quick-start",
    "concepts",
    "troubleshooting"
  ]
}
```

#### `apps/docs/content/getting-started/index.mdx`

```mdx
---
title: Getting Started
description: Get up and running with zero-sources in minutes
---

# Getting Started with zero-sources

Welcome to zero-sources! This guide will help you understand what zero-sources offers and get you productive quickly.

## What is zero-sources?

zero-sources is a collection of utilities and custom change source implementations for [Rocicorp Zero](https://github.com/rocicorp/mono), a framework for building real-time, multiplayer applications with client-side caching and automatic synchronization.

### Key Features

- **MongoDB Change Sources**: Stream MongoDB changes to Zero clients in real-time
- **Discriminated Union Support**: Handle complex data structures with type safety
- **Flexible Watermark Storage**: Choose between ZQLite and NATS KV for state management
- **NestJS Integration**: First-class support for NestJS applications
- **TypeScript-First**: Full type safety and excellent developer experience
- **Production-Ready**: Battle-tested utilities and comprehensive testing

## What's Included?

### Libraries

- **[@cbnsndwch/zero-contracts](../libraries/zero-contracts)**: Core contracts and utilities
- **[@cbnsndwch/zero-source-mongodb](../libraries/zero-source-mongodb)**: MongoDB change source implementation
- **[@cbnsndwch/zero-watermark-zqlite](../libraries/zero-watermark-zqlite)**: ZQLite watermark storage
- **[@cbnsndwch/zero-watermark-nats-kv](../libraries/zero-watermark-nats-kv)**: NATS KV watermark storage
- **[@cbnsndwch/zero-nest-mongoose](../libraries/zero-nest-mongoose)**: NestJS/Mongoose utilities
- **[@cbnsndwch/synced-queries](../libraries/synced-queries)**: Query encapsulation utilities
- **[@cbnsndwch/zrocket-contracts](../libraries/zrocket-contracts)**: Example Zero schemas

### Change Sources

- **[source-mongodb-server](../change-sources/mongodb-server)**: Production-ready MongoDB change source server

### Demo Applications

- **[ZRocket](../demos/zrocket)**: Full-featured chat application showcasing all features

## Quick Links

<Cards>
  <Card href="/getting-started/installation" title="Installation" description="Install zero-sources libraries in your project" />
  <Card href="/getting-started/quick-start" title="Quick Start" description="Build your first real-time feature in 15 minutes" />
  <Card href="/getting-started/concepts" title="Core Concepts" description="Learn about change sources, watermarks, and more" />
  <Card href="/guides" title="Guides" description="In-depth guides for common scenarios" />
</Cards>

## Prerequisites

Before getting started, make sure you have:

- **Node.js 22+** installed
- **pnpm** (recommended) or npm/yarn
- **MongoDB** instance (local or Atlas)
- Basic familiarity with **TypeScript** and **React**
- Understanding of **Rocicorp Zero** concepts (recommended)

<Callout type="info">
  New to Rocicorp Zero? Check out the [Zero documentation](https://github.com/rocicorp/mono) first to understand the fundamentals.
</Callout>

## Next Steps

1. **[Install zero-sources](./installation)** - Set up zero-sources in your project
2. **[Quick Start Tutorial](./quick-start)** - Build your first real-time feature
3. **[Learn Core Concepts](./concepts)** - Understand how everything works together
4. **[Explore Libraries](../libraries)** - Dive deep into individual libraries

## Need Help?

- **[Troubleshooting Guide](./troubleshooting)** - Common issues and solutions
- **[GitHub Discussions](https://github.com/cbnsndwch/zero-sources/discussions)** - Ask questions and share ideas
- **[GitHub Issues](https://github.com/cbnsndwch/zero-sources/issues)** - Report bugs or request features

---

Ready to get started? Head to the [installation guide](./installation) →
```

#### `apps/docs/content/getting-started/quick-start.mdx`

Should include:

- Simple "hello world" example
- Step-by-step instructions with code snippets
- Expected output/results
- Links to next steps and more advanced guides

#### `apps/docs/content/getting-started/concepts.mdx`

Should cover:

- Change sources and how they work
- Watermarks and why they matter
- Discriminated unions and type safety
- Zero schema definitions
- Real-time synchronization overview
- Architecture diagrams (if helpful)

#### `apps/docs/content/getting-started/troubleshooting.mdx`

Should include:

- Common installation issues
- MongoDB connection problems
- Build errors and solutions
- Version compatibility issues
- Where to get more help

## Content Guidelines

### Writing Style

- **Clear and Concise**: Use simple language, avoid jargon where possible
- **Action-Oriented**: Focus on what users can do, not just theory
- **Progressive Disclosure**: Start simple, add complexity gradually
- **Working Examples**: Every concept should have a working code example
- **Visual Aids**: Use diagrams, screenshots, or callouts to clarify complex topics

### Code Examples

- Must be tested and verified working
- Include necessary imports and context
- Use syntax highlighting
- Add comments explaining non-obvious parts
- Show expected output when relevant

### Structure

- Use clear headings and subheadings
- Keep paragraphs short (3-4 sentences max)
- Use bullet points and numbered lists
- Include callouts for important information
- Add navigation links between sections

## Testing Requirements

### Content Testing

1. **Accuracy Test**:
   - Follow all instructions from scratch
   - Verify all code examples work
   - Verify all commands succeed
   - Check all links work

2. **Clarity Test**:
   - Have someone unfamiliar with project follow guide
   - Collect feedback on confusing parts
   - Identify gaps or missing steps
   - Revise based on feedback

3. **Completeness Test**:
   - Verify prerequisites are listed
   - Verify all necessary steps included
   - Verify troubleshooting covers common issues
   - Verify next steps are clear

### Verification Checklist

- [ ] Content is accurate and current
- [ ] All code examples tested and work
- [ ] All commands verified on fresh environment
- [ ] All internal links work
- [ ] All external links work
- [ ] Navigation works correctly
- [ ] Search finds relevant content
- [ ] Mobile layout is readable
- [ ] No spelling or grammar errors
- [ ] Technical review completed
- [ ] User testing completed (if possible)

## Notes

- This is one of the most important pieces of documentation
- Invest time in making it excellent
- Update as libraries evolve
- Consider adding video walkthrough later
- Get feedback from actual new users

## Dependencies

### Blocks

- Story 001 (Project Setup) must be complete
- Story 003 (Navigation Structure) must be complete

### Blocked By

- None

## Related Documentation

- [Content Organization Guide](../docs/content-organization.md)
- [Writing Style Guide](../docs/content-organization.md)
- [Fumadocs MDX Guide](https://fumadocs.vercel.app/docs/ui/mdx)

---

**Created**: November 1, 2025
**Last Updated**: November 1, 2025
**Story Owner**: Documentation Specialist / Developer
