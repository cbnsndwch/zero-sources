# Epic 003: API Documentation Generation

**Epic ID**: FDS-EPIC-003  
**Status**: Not Started  
**Priority**: High  
**Estimated Total Effort**: 2 days

---

## Epic Summary

Implement automated API documentation generation using TypeDoc for all zero-sources TypeScript libraries. This epic focuses on creating comprehensive, searchable, and well-linked API reference documentation that integrates seamlessly with the narrative documentation.

## User Value Proposition

**As a** developer integrating zero-sources libraries  
**I want** comprehensive, auto-generated API documentation  
**So that** I can quickly find type definitions, method signatures, and usage examples without diving into source code

## Business Value

- **Reduced Support Burden**: Comprehensive API docs reduce questions about method signatures and types
- **Faster Integration**: Developers can integrate libraries more quickly with clear API references
- **Better Developer Experience**: Professional API documentation increases library adoption
- **Reduced Maintenance**: Automated generation keeps docs in sync with code
- **Enhanced Discoverability**: Searchable API docs help developers find what they need

## Success Metrics

- API documentation generated for all 7 libraries
- API doc pages indexed by search functionality
- Average time to find API method < 30 seconds
- Cross-references between narrative docs and API reference working
- API docs rebuild automatically on library changes
- TypeDoc build time < 2 minutes for all libraries

## User Stories Breakdown

1. **[Story 008: Configure TypeDoc Integration](../user-stories/story-008-typedoc-integration.md)** - Priority: High
   - Set up TypeDoc for each library
   - Configure output formatting and themes
   - Integrate with Turborepo build process
   - Estimated: 1 day

2. **[Story 009: Generate and Link API Documentation](../user-stories/story-009-api-docs-generation.md)** - Priority: High
   - Generate API docs for all libraries
   - Add navigation entries for API references
   - Create cross-references from narrative docs
   - Estimated: 1 day

## Technical Requirements

### TypeDoc Configuration

- Configure TypeDoc for each library in `libs/` directory:
  - `@cbnsndwch/zero-contracts`
  - `@cbnsndwch/zero-source-mongodb`
  - `@cbnsndwch/zero-watermark-zqlite`
  - `@cbnsndwch/zero-watermark-nats-kv`
  - `@cbnsndwch/zero-nest-mongoose`
  - `@cbnsndwch/synced-queries`
  - `@cbnsndwch/zrocket-contracts`

### Output Structure

```
apps/docs/content/api/
├── zero-contracts/
│   ├── index.mdx              # Overview of the API
│   ├── classes/               # Class documentation
│   ├── interfaces/            # Interface documentation
│   ├── types/                 # Type alias documentation
│   ├── functions/             # Function documentation
│   └── enums/                 # Enum documentation
├── zero-source-mongodb/
│   └── ...
└── ...
```

### Integration Points

- TypeDoc output format: Markdown/MDX compatible with Fumadocs
- Build process integration: TypeDoc runs as part of docs build
- Navigation integration: API docs appear in sidebar navigation
- Search integration: API content indexed for search
- Cross-linking: Links from narrative docs to API reference

## Dependencies

### Prerequisite Work

- **Story 001**: Project setup must be complete (provides base infrastructure)
- **Turborepo Configuration**: Build system must support API doc generation
- **Navigation Structure**: Story 003 should be complete for proper API navigation

### External Dependencies

- TypeDoc package and plugins
- TypeScript compiler configuration for each library
- Fumadocs MDX support for generated documentation

## Assumptions

- All libraries are written in TypeScript with proper type annotations
- TypeDoc can generate markdown/MDX output compatible with Fumadocs
- API documentation will be versioned alongside library versions (future enhancement)
- Generated API docs will be committed to repository (decision point)
- Build time increase for docs is acceptable (< 5 minutes total)

## Risk Factors

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| TypeDoc output incompatible with Fumadocs | Medium | High | Research plugins, may need custom rendering |
| Build time too long for CI/CD | Low | Medium | Cache TypeDoc output, optimize configuration |
| API docs too verbose or overwhelming | Medium | Medium | Configure TypeDoc filters, create guided navigation |
| Cross-linking complexity | Medium | Medium | Use TypeDoc reference resolver, manual linking fallback |
| Library structure not TypeDoc-friendly | Low | High | Refactor library exports if needed, improve JSDoc comments |

## Acceptance Criteria

### Epic-Level Acceptance

- [ ] TypeDoc configured for all 7 libraries
- [ ] API documentation generated successfully for all libraries
- [ ] Generated docs render correctly in Fumadocs
- [ ] API docs accessible through navigation
- [ ] Search functionality includes API documentation
- [ ] Cross-references from narrative docs to API working
- [ ] Build process automated and integrated with Turborepo
- [ ] Documentation for maintaining API docs created
- [ ] API doc generation time acceptable (< 3 minutes)
- [ ] No TypeScript compilation errors during generation

## Out of Scope

The following are explicitly out of scope for this epic:

- API documentation versioning (future enhancement)
- Interactive API playground (future enhancement)
- Example code generation from API docs (future enhancement)
- API diff comparison between versions (future enhancement)
- Custom API documentation theme beyond TypeDoc defaults
- Migration of inline code examples to API docs

## Timeline and Milestones

### Phase 1: Configuration (Story 008)
- **Duration**: 1 day
- **Deliverables**: TypeDoc configured, test generation working
- **Milestone**: First library API docs rendering in Fumadocs

### Phase 2: Full Generation (Story 009)
- **Duration**: 1 day
- **Deliverables**: All libraries documented, navigation integrated
- **Milestone**: Complete API reference section available

**Total Epic Duration**: 2 days

## Related Documentation

- [PRD Section: API Documentation](../PRD.md#fr-33-api-documentation)
- [Story 008: Configure TypeDoc Integration](../user-stories/story-008-typedoc-integration.md)
- [Story 009: Generate and Link API Documentation](../user-stories/story-009-api-docs-generation.md)
- [TypeDoc Documentation](https://typedoc.org/)
- [Fumadocs API Documentation Guide](https://fumadocs.vercel.app/)

## Notes

- TypeDoc configuration should be as automated as possible to reduce maintenance
- Consider adding JSDoc comment linting to ensure API docs quality
- API docs should complement, not replace, narrative documentation
- Focus on developer-friendly presentation over comprehensive coverage of private APIs
- Generated API docs may need manual curation for optimal navigation

---

**Epic Owner**: Product Manager  
**Technical Lead**: TBD  
**Created**: November 1, 2025  
**Last Updated**: November 1, 2025
