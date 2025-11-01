# Story 010: Configure GitHub Actions Workflow

**Story ID**: FDS-STORY-010  
**Epic**: [FDS-EPIC-004 - Deployment and CI/CD Pipeline](../epics/epic-004-deployment-cicd.md)  
**Status**: Not Started  
**Priority**: Critical  
**Estimated Effort**: 0.5 days  
**Sprint**: 3

---

## User Story

**As a** contributor to the documentation  
**I want** automated builds and deployments via GitHub Actions  
**So that** documentation updates are automatically deployed without manual intervention

## Acceptance Criteria

- [ ] GitHub Actions workflow created
- [ ] Workflow triggers on push to main
- [ ] Workflow triggers on PRs affecting docs
- [ ] Build process includes API doc generation
- [ ] Environment variables configured
- [ ] Secrets properly managed
- [ ] Build notifications working

## Definition of Done

- [ ] `.github/workflows/docs-deploy.yml` created
- [ ] Workflow tested successfully
- [ ] Secrets configured in repository
- [ ] Build time < 5 minutes
- [ ] Documentation updated

## Technical Details

```yaml
# .github/workflows/docs-deploy.yml
name: Deploy Documentation

on:
  push:
    branches: [main]
    paths:
      - 'apps/docs/**'
      - 'libs/**'
  pull_request:
    paths:
      - 'apps/docs/**'
      - 'libs/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Generate API docs
        run: pnpm run build:api-docs
      
      - name: Build docs
        run: pnpm run build --filter=docs
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
        if: github.ref == 'refs/heads/main'
```

## Dependencies

- Story 001: Project Setup
- Story 005: Some content to deploy

---

**Story Owner**: Developer  
**Created**: November 1, 2025
