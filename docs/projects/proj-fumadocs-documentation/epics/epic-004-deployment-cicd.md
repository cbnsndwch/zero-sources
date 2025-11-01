# Epic 004: Deployment and CI/CD Pipeline

**Epic ID**: FDS-EPIC-004  
**Status**: Not Started  
**Priority**: Critical  
**Estimated Total Effort**: 1.5 days

---

## Epic Summary

Establish a robust CI/CD pipeline for automated building, testing, and deployment of the Fumadocs documentation site. This epic focuses on GitHub Actions workflows, Vercel deployment integration, and preview deployments for pull requests to ensure documentation is always up-to-date and reliably delivered.

## User Value Proposition

**As a** contributor to the zero-sources project  
**I want** automated documentation deployment and preview capabilities  
**So that** I can see my documentation changes live before merging and ensure production docs are always current

## Business Value

- **Reduced Deployment Friction**: Automated deployments eliminate manual steps and errors
- **Faster Feedback Loop**: Preview deployments enable quick review of documentation changes
- **Continuous Updates**: Documentation automatically deploys with every merge
- **Quality Assurance**: Build checks prevent broken documentation from reaching production
- **Developer Efficiency**: Contributors can validate changes without local testing
- **Professional Presentation**: Reliable hosting ensures documentation is always available

## Success Metrics

- Deployment success rate > 99%
- Build time < 5 minutes for full documentation site
- Preview deployment available < 3 minutes after PR creation
- Zero downtime deployments to production
- Automatic deployment on merge to main branch
- Preview URLs automatically commented on PRs
- Build failures detected and reported within 2 minutes

## User Stories Breakdown

1. **[Story 010: Configure GitHub Actions Workflow](../user-stories/story-010-github-actions.md)** - Priority: Critical
   - Create build and deployment workflow
   - Add API doc generation step
   - Configure environment variables and secrets
   - Estimated: 0.5 days

2. **[Story 011: Set Up Vercel Deployment](../user-stories/story-011-vercel-deployment.md)** - Priority: Critical
   - Create Vercel project
   - Configure build settings
   - Set up custom domain (optional)
   - Estimated: 0.5 days

3. **[Story 012: Implement Preview Deployments](../user-stories/story-012-preview-deployments.md)** - Priority: High
   - Configure PR preview builds
   - Add preview URL comments to PRs
   - Set up preview environment cleanup
   - Estimated: 0.5 days

## Technical Requirements

### GitHub Actions Workflow

```yaml
# .github/workflows/docs-deploy.yml
name: Deploy Documentation

on:
  push:
    branches: [main]
    paths:
      - 'apps/docs/**'
      - 'libs/**'
      - '.github/workflows/docs-deploy.yml'
  pull_request:
    paths:
      - 'apps/docs/**'
      - 'libs/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js and pnpm
      - Install dependencies
      - Generate API documentation (TypeDoc)
      - Build Fumadocs site
      - Deploy to Vercel (production or preview)
```

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Repository                     │
│  • Push to main → Production deployment                  │
│  • Pull Request → Preview deployment                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│                  GitHub Actions CI/CD                    │
│  • Build Turborepo workspace                            │
│  • Generate TypeDoc API documentation                   │
│  • Build Next.js static site                            │
│  • Run link checking and validation                     │
│  • Deploy to Vercel                                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│                    Vercel Platform                       │
│  Production:  docs.zero-sources.dev (or similar)        │
│  Preview:     pr-123-zero-sources.vercel.app            │
│  Features:    • CDN distribution                        │
│               • Automatic SSL                           │
│               • Edge caching                            │
│               • Analytics                               │
└─────────────────────────────────────────────────────────┘
```

### Build Process Requirements

1. **Dependency Installation**: Fast, cached installation of pnpm dependencies
2. **API Doc Generation**: TypeDoc generation for all libraries (< 2 minutes)
3. **Static Site Build**: Next.js build with Fumadocs (< 3 minutes)
4. **Asset Optimization**: Image optimization, CSS minification
5. **Validation**: Link checking, broken link detection
6. **Deployment**: Upload to Vercel with appropriate configuration

### Environment Configuration

- **Environment Variables**: Build-time variables for analytics, search keys, etc.
- **Secrets Management**: Secure handling of deployment tokens and API keys
- **Branch Configuration**: Different configs for production vs preview
- **Cache Management**: Turbo cache, pnpm cache, Next.js cache optimization

## Dependencies

### Prerequisite Work

- **Story 001**: Project setup complete (provides build foundation)
- **Story 005**: Some content available for deployment testing
- **Story 008**: API doc generation configured (if deploying API docs)

### External Dependencies

- **GitHub Actions**: CI/CD platform
- **Vercel Account**: Hosting platform account and project
- **Domain Name**: Custom domain for production (optional)
- **GitHub Secrets**: Deployment tokens and API keys
- **Turbo Remote Cache**: Optional for faster builds (Vercel integration)

## Assumptions

- Vercel free tier provides sufficient resources for documentation site
- GitHub Actions minutes are sufficient for documentation builds
- Static site generation is acceptable (no server-side rendering needed)
- Preview deployments will be automatically cleaned up by Vercel
- Build reproducibility is achievable through locked dependencies
- No sensitive data needs to be included in documentation build

## Risk Factors

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Vercel deployment failures | Low | High | Have fallback to manual deployment, monitor closely |
| Build time exceeds CI limits | Low | Medium | Optimize build process, use Turbo cache |
| Breaking changes in dependencies | Medium | Medium | Pin dependency versions, test upgrades |
| Preview URL conflicts | Low | Low | Use Vercel's automatic URL generation |
| Secrets exposure | Low | Critical | Use GitHub encrypted secrets, review workflows |
| Cost overruns at scale | Low | Medium | Monitor usage, optimize build frequency |

## Acceptance Criteria

### Epic-Level Acceptance

- [ ] GitHub Actions workflow created and tested
- [ ] Production deployment to Vercel working
- [ ] Preview deployments working for pull requests
- [ ] Build time < 5 minutes for full site
- [ ] API documentation generated during build
- [ ] Environment variables configured correctly
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificates working
- [ ] Preview URL automatically commented on PRs
- [ ] Failed builds reported clearly
- [ ] Documentation site accessible and functional
- [ ] All navigation and links working in deployed site

## Out of Scope

The following are explicitly out of scope for this epic:

- Multi-region deployment (using Vercel's default CDN)
- Custom CDN configuration beyond Vercel defaults
- A/B testing infrastructure for documentation
- Automated performance testing in CI/CD
- Documentation analytics integration (separate epic)
- Automated accessibility testing (future enhancement)
- Infrastructure as Code (IaC) for deployment configuration
- Rollback automation beyond Vercel's built-in features

## Timeline and Milestones

### Phase 1: CI/CD Setup (Story 010)
- **Duration**: 0.5 days
- **Deliverables**: GitHub Actions workflow functional
- **Milestone**: First successful build and deployment test

### Phase 2: Production Deployment (Story 011)
- **Duration**: 0.5 days
- **Deliverables**: Vercel project configured, production deploys working
- **Milestone**: Documentation site live at production URL

### Phase 3: Preview Deployments (Story 012)
- **Duration**: 0.5 days
- **Deliverables**: PR previews working, automated comments enabled
- **Milestone**: First PR with automatic preview deployment

**Total Epic Duration**: 1.5 days

## Deployment Strategy

### Production Deployment Triggers

- Push to `main` branch
- Changes in `apps/docs/**` or `libs/**` paths
- Manual workflow dispatch (for emergency updates)

### Preview Deployment Triggers

- Pull request created or updated
- Changes in documentation-related paths
- Automatic cleanup when PR is closed

### Rollback Strategy

- Vercel provides automatic rollback to previous deployment
- GitHub allows revert commits for documentation changes
- Manual deployment possible via Vercel CLI if needed

## Related Documentation

- [PRD Section: Deployment Strategy](../PRD.md#deployment-strategy)
- [Story 010: Configure GitHub Actions Workflow](../user-stories/story-010-github-actions.md)
- [Story 011: Set Up Vercel Deployment](../user-stories/story-011-vercel-deployment.md)
- [Story 012: Implement Preview Deployments](../user-stories/story-012-preview-deployments.md)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Notes

- Build performance is critical for developer experience
- Cache strategies should be optimized for monorepo structure
- Preview deployments should be limited to documentation changes only
- Consider setting up deployment notifications (Slack, Discord, etc.)
- Monitor Vercel usage to stay within free tier limits
- Document deployment process for team members

---

**Epic Owner**: Product Manager  
**Technical Lead**: TBD  
**Created**: November 1, 2025  
**Last Updated**: November 1, 2025
