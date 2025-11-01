# Story 006: Migrate Watermark Storage Libraries

**Story ID**: FDS-STORY-006  
**Epic**: [FDS-EPIC-002 - Content Migration and Organization](../epics/epic-002-content-migration.md)  
**Status**: Not Started  
**Priority**: High  
**Estimated Effort**: 1 day  
**Sprint**: 2

---

## User Story

**As a** developer implementing watermark storage  
**I want** clear documentation comparing ZQLite and NATS KV watermark implementations  
**So that** I can choose the right storage backend and implement it correctly

## Background/Context

zero-sources provides two watermark storage implementations: `@cbnsndwch/zero-watermark-zqlite` and `@cbnsndwch/zero-watermark-nats-kv`. These libraries need comprehensive documentation including usage guides, configuration options, and a comparison guide to help developers choose the right solution.

## Acceptance Criteria

**Given** the information architecture is defined  
**When** I migrate the watermark storage documentation  
**Then** I should have:

- [ ] zero-watermark-zqlite documentation complete
- [ ] zero-watermark-nats-kv documentation complete
- [ ] Comparison guide explaining when to use each
- [ ] Installation and configuration guides
- [ ] Performance characteristics documented
- [ ] Migration guide between storage backends
- [ ] Code examples for both implementations
- [ ] Troubleshooting sections

## Definition of Done

- [ ] Documentation files created for both libraries
- [ ] Comparison guide written
- [ ] Code examples tested
- [ ] Navigation updated
- [ ] Technical review completed
- [ ] Cross-references to change source docs added
- [ ] Content committed to repository

## Technical Details

### Directory Structure

```
apps/docs/content/libraries/zero-watermark-zqlite/
├── meta.json
├── index.mdx
├── installation.mdx
├── configuration.mdx
├── performance.mdx
└── api/

apps/docs/content/libraries/zero-watermark-nats-kv/
├── meta.json
├── index.mdx
├── installation.mdx
├── configuration.mdx
├── performance.mdx
└── api/

apps/docs/content/guides/
└── choosing-watermark-storage.mdx      # Comparison guide
```

### Comparison Guide Content

Create a comprehensive comparison in `choosing-watermark-storage.mdx`:

| Feature | ZQLite | NATS KV |
|---------|--------|---------|
| **Best For** | Single-server deployments | Distributed systems |
| **Persistence** | SQLite file | NATS JetStream |
| **Setup Complexity** | Low | Medium |
| **Dependencies** | None (built-in) | NATS server |
| **Performance** | Excellent for single node | Excellent for distributed |
| **Scalability** | Vertical only | Horizontal |
| **High Availability** | Manual | Built-in |
| **Data Durability** | File-based | Replicated |

## Dependencies

- Story 004: Information Architecture

---

**Story Owner**: Developer  
**Created**: November 1, 2025
