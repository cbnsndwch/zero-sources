# Story 011: Set Up Vercel Deployment

**Story ID**: FDS-STORY-011  
**Epic**: [FDS-EPIC-004 - Deployment and CI/CD Pipeline](../epics/epic-004-deployment-cicd.md)  
**Status**: Not Started  
**Priority**: Critical  
**Estimated Effort**: 0.5 days  
**Sprint**: 3

---

## User Story

**As a** user of zero-sources  
**I want** the documentation site hosted on Vercel  
**So that** I can access it reliably with fast load times worldwide

## Acceptance Criteria

- [ ] Vercel project created
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Production deployment successful
- [ ] Site accessible and functional

## Definition of Done

- [ ] Vercel project configured
- [ ] Production URL active
- [ ] All pages loading correctly
- [ ] Build time acceptable
- [ ] Documentation updated with URL

## Technical Details

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "cd ../.. && pnpm run build --filter=docs",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "pnpm install"
}
```

### Environment Variables

Set in Vercel dashboard:
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_ANALYTICS_ID` (if using analytics)

## Dependencies

- Story 010: GitHub Actions Workflow

---

**Story Owner**: Developer  
**Created**: November 1, 2025
