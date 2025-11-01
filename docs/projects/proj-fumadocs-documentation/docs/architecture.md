# Architecture and Technical Decisions

**Project**: Fumadocs Documentation Site
**Version**: 1.0
**Date**: November 1, 2025

---

## Overview

This document outlines the key architectural decisions, technical stack, and design patterns for the zero-sources Fumadocs documentation site.

## Technology Stack

### Core Framework

**Next.js 16 (App Router)**

- Modern, performant React framework
- Static site generation (SSG) for optimal performance
- File-based routing system
- Built-in optimization for images, fonts, and code splitting
- Excellent developer experience
- Enhanced performance and stability improvements

**Fumadocs 16**

- Purpose-built documentation framework
- Built on Next.js 16 App Router
- Comprehensive UI components
- Built-in search functionality
- MDX support with custom components
- Dark/light mode support
- Mobile-responsive by default

### Content Management

**MDX (Markdown + JSX)**

- Write content in Markdown
- Embed React components for interactivity
- Type-safe component props
- Syntax highlighting built-in
- Front matter for metadata

### Styling

**Tailwind CSS 4.x**

- Utility-first CSS framework
- Highly customizable
- Excellent performance
- Consistent design system
- Built-in dark mode support

### Build System

**Turborepo**

- Already in use in monorepo
- Task caching for faster builds
- Parallel task execution
- Dependency graph awareness

**pnpm**

- Already in use in monorepo
- Fast, efficient package management
- Workspace support

### API Documentation

**TypeDoc**

- TypeScript-native documentation generator
- Generates comprehensive API reference
- Integrates with existing TypeScript code
- Supports custom themes
- Can output to multiple formats

## Architecture Decisions

### Decision 1: Fumadocs vs Alternatives

**Alternatives Considered**:

- Docusaurus (React-based, popular)
- VitePress (Vue-based, fast)
- Nextra (Next.js-based, simpler)
- GitBook (hosted solution)
- Custom solution

**Decision**: Fumadocs

**Rationale**:

- Built specifically for documentation
- Modern Next.js App Router architecture
- Excellent TypeScript support
- Beautiful UI out of the box
- Strong MDX support
- Active development and community
- Better performance than Docusaurus
- More flexible than Nextra

### Decision 2: Static Generation vs Server-Side Rendering

**Decision**: Static Site Generation (SSG)

**Rationale**:

- Documentation content changes infrequently
- No need for dynamic, per-request rendering
- Better performance (pre-rendered HTML)
- Lower hosting costs
- Can be deployed to any static host
- Excellent SEO (pre-rendered content)
- Can still add interactive components client-side

### Decision 3: Monorepo Integration vs Separate Repository

**Decision**: Integrate into existing monorepo at `apps/docs`

**Rationale**:

- Single source of truth
- Easier to keep docs in sync with code
- Can reference source code directly
- Shared tooling and configuration
- Atomic commits (code + docs)
- Simpler CI/CD pipeline
- Leverages existing Turborepo setup

### Decision 4: Content Organization Strategy

**Decision**: User journey-based organization

**Structure**:

```text
getting-started/ → libraries/ → change-sources/ → demos/ → guides/ → architecture/
```

**Rationale**:

- Matches how users actually learn
- Progressive disclosure (simple → complex)
- Clear separation of concerns
- Easy to find specific information
- Scalable for adding new content
- SEO-friendly URL structure

### Decision 5: Search Implementation

**Decision**: Fumadocs built-in search (Flexsearch)

**Rationale**:

- Client-side search (no backend needed)
- Fast and accurate
- Works offline
- No additional costs
- Keyboard shortcuts built-in
- Good enough for documentation size
- Can upgrade to Algolia later if needed

### Decision 6: API Documentation Strategy

**Decision**: TypeDoc integration with links from narrative docs

**Rationale**:

- Automatic generation from TypeScript source
- Always up-to-date with code
- Comprehensive coverage
- Standard format developers expect
- Can be regenerated on each build
- Links between narrative and API docs

### Decision 7: Deployment Platform

**Decision**: Vercel (primary), with static export option

**Rationale**:

- Fumadocs is optimized for Vercel
- Free tier for open source
- Automatic preview deployments
- Excellent performance (global CDN)
- Zero-config deployment
- Great developer experience
- Can export to static files if needed (portability)

### Decision 8: Styling Approach

**Decision**: Extend Fumadocs theme with Tailwind CSS customization

**Rationale**:

- Fumadocs already provides excellent UI
- Tailwind allows customization without fighting framework
- Consistent with modern React patterns
- Faster development than custom CSS
- Easy to maintain
- Good performance

## Content Strategy

### Information Architecture

**Primary Navigation**:

1. **Getting Started** - Onboarding and quick start
2. **Libraries** - Individual library documentation
3. **Change Sources** - Change source implementations
4. **Demos** - Example applications
5. **Guides** - How-to guides and tutorials
6. **Architecture** - System design and concepts

### Content Types

1. **Conceptual Documentation**
   - What is it and why use it
   - Architecture and design decisions
   - High-level overviews

2. **Task-Based Guides**
   - Step-by-step instructions
   - How to accomplish specific goals
   - Troubleshooting guides

3. **Reference Documentation**
   - API documentation
   - Configuration options
   - Type definitions

4. **Examples and Tutorials**
   - Working code examples
   - Full application demos
   - Integration patterns

### Content Templates

Standardized templates ensure consistency:

- Library documentation template
- Guide template
- API reference template
- Demo application template

## Performance Strategy

### Build-Time Optimization

- Static site generation for all content
- Image optimization (Next.js Image component)
- Font optimization (Next.js Font optimization)
- Code splitting by route
- CSS purging (unused Tailwind classes removed)

### Runtime Optimization

- Client-side routing (no full page reloads)
- Prefetching of likely-next pages
- Lazy loading of images and components
- Efficient search index loading
- Service worker for offline access (future)

### Performance Targets

- First Contentful Paint: < 1.5 seconds
- Time to Interactive: < 3 seconds
- Lighthouse Score: > 90 (all categories)
- Total Bundle Size: < 500KB (initial load)

## SEO Strategy

### Technical SEO

- Semantic HTML structure
- Proper heading hierarchy
- Meta tags for all pages
- Open Graph tags for social sharing
- JSON-LD structured data
- XML sitemap generation
- robots.txt configuration
- Canonical URLs

### Content SEO

- Descriptive page titles
- Compelling meta descriptions
- Keyword-rich headings
- Internal linking structure
- External links to authoritative sources
- Regular content updates

## Accessibility

### Standards Compliance

- WCAG 2.1 AA compliance
- Semantic HTML
- Proper ARIA attributes
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast
- Responsive text sizing

### Testing

- Automated accessibility testing (axe)
- Manual keyboard navigation testing
- Screen reader testing
- Color contrast verification

## Security Considerations

### Content Security

- No user-generated content (static site)
- No backend API (no injection vulnerabilities)
- No sensitive data in client code
- Environment variables for any secrets

### Deployment Security

- HTTPS enforced
- Content Security Policy headers
- Subresource Integrity for external scripts
- Regular dependency updates
- Automated security scanning

## Monitoring and Analytics

### Analytics Strategy

- Track page views and navigation patterns
- Monitor search queries
- Track external link clicks
- Measure time on page
- Identify popular content

### Performance Monitoring

- Core Web Vitals tracking
- Build time monitoring
- Deploy success rate
- Error tracking

### Tools

- Vercel Analytics (built-in)
- Google Analytics or Plausible (privacy-friendly alternative)
- Sentry for error tracking (if needed)

## Maintenance Strategy

### Content Maintenance

- Review documentation with each library release
- Accept community contributions via PRs
- Regular link checking
- Quarterly content audits
- Deprecation notices for old features

### Technical Maintenance

- Monthly dependency updates
- Security patch application
- Performance optimization
- Bug fixes and improvements
- Feature enhancements based on feedback

### Automation

- Automated build on commit
- Automated API doc regeneration
- Automated link checking
- Automated accessibility testing
- Automated deployment

## Scalability

### Content Scalability

- File-based content system scales to hundreds of pages
- Search indexing efficient for large content sets
- Can split into multiple documentation sites if needed
- Supports documentation versioning (future)

### Traffic Scalability

- Static site scales infinitely (CDN-based)
- No server-side processing
- No database queries
- Efficient caching strategy

## Future Considerations

### Potential Enhancements

1. **Versioned Documentation** - Support multiple library versions
2. **Interactive Playgrounds** - In-browser code execution
3. **Video Tutorials** - Embedded video content
4. **Community Showcase** - Gallery of projects using zero-sources
5. **Internationalization** - Multi-language support
6. **Advanced Search** - AI-powered search with LLM integration
7. **Documentation Testing** - Automated testing of code examples
8. **A/B Testing** - Optimize content based on user behavior

### Migration Path

If we outgrow Fumadocs:

- Static export option provides portability
- Content in standard MDX format (framework-agnostic)
- Can migrate to alternatives with reasonable effort
- APIs and integrations abstracted behind interfaces

## Decision Log

| Date | Decision | Rationale | Impact |
|------|----------|-----------|--------|
| 2025-11-01 | Use Fumadocs | Best-in-class documentation framework | High - foundation of site |
| 2025-11-01 | Deploy to Vercel | Optimized for Fumadocs, excellent DX | Medium - can change later |
| 2025-11-01 | Use TypeDoc | Best TypeScript documentation tool | Medium - standard choice |
| 2025-11-01 | Integrate into monorepo | Single source of truth | High - architecture decision |
| 2025-11-01 | Static generation | Performance and simplicity | High - fundamental approach |

---

## References

- [Fumadocs Documentation](https://fumadocs.vercel.app/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeDoc Documentation](https://typedoc.org/)
- [Turborepo Documentation](https://turbo.build/repo/docs)

---

**Maintained By**: Product Manager / Technical Lead
**Review Frequency**: Quarterly or as needed
**Last Review**: November 1, 2025
