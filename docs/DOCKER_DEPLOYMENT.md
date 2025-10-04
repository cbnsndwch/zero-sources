# Docker Deployment

## Current Status

As of October 4, 2025, Docker-based CI/CD workflows have been **temporarily removed** from the repository.

## Background

The repository previously contained a GitHub Actions workflow (`.github/workflows/deploy.yml`) for building and deploying Docker images. This workflow was removed because:

1. **Legacy Application References**: The workflow referenced the old "ZChat" demo application which has been removed from the codebase
2. **Missing Infrastructure**: No Dockerfiles currently exist for the active applications (`zrocket`, `source-mongodb-server`)
3. **Incomplete Implementation**: The deployment steps were commented out and the workflow was non-functional
4. **Wrong Application Paths**: Referenced `apps/zchat-api` and `apps/zchat` which don't exist

## Local Docker Development

Docker Swarm deployment configurations are still available in the `.docker/swarm/` directory for local development and manual deployment. See `.docker/swarm/README.md` for details.

## Future Docker CI/CD Implementation

When Docker-based CI/CD is needed in the future, the implementation should include:

### Prerequisites

1. **Dockerfiles**: Create production-ready Dockerfiles for:
    - `apps/zrocket` - Full-stack demo application
    - `apps/source-mongodb-server` - Generic MongoDB change source server
2. **Multi-stage Builds**: Use multi-stage Docker builds to optimize image size and build time

3. **Build Context**: Ensure Dockerfiles properly handle monorepo structure and workspace dependencies

### Workflow Requirements

A new GitHub Actions workflow should:

1. **Path Filtering**: Only build images when relevant code changes
2. **Library Building**: Build all library packages before containerization
3. **Schema Generation**: Generate Zero schema JSON files as needed
4. **Multi-platform Support**: Build for multiple architectures (AMD64, ARM64) if needed
5. **Registry Integration**: Push to GitHub Container Registry (GHCR)
6. **Tagging Strategy**:
    - `latest` for main branch
    - `SHA` tags for traceability
    - `branch` tags for feature branches
7. **Deployment Hooks**: Integration with deployment platform (Portainer, Kubernetes, etc.)

### Container Registry

Images should be published to GitHub Container Registry:

- `ghcr.io/cbnsndwch/zero-sources/zrocket:latest`
- `ghcr.io/cbnsndwch/zero-sources/source-mongodb-server:latest`

### Security Considerations

1. **Multi-stage builds** to exclude development dependencies
2. **Non-root users** in container runtime
3. **Security scanning** in CI pipeline
4. **Secret management** via environment variables
5. **Registry access control** via GitHub packages

## Implementation Tracking

When ready to implement Docker CI/CD:

1. Create a GitHub Issue with requirements using the Product Manager role
2. Design Dockerfiles following best practices
3. Test builds locally before creating workflow
4. Document deployment infrastructure and requirements
5. Implement workflow with proper testing and validation

## References

- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [GitHub Actions Docker Build](https://github.com/docker/build-push-action)
- Local deployment: `.docker/swarm/README.md`
