# Documentation Docker Build Setup - Implementation Summary

## Overview
Added complete Docker containerization support for the Zero Sources documentation site with automated GitHub Actions workflow for building and publishing container images.

## Files Created

### 1. `apps/docs/Dockerfile`
Multi-stage Docker build configuration for the React Router 7-based documentation site.

**Key Features:**
- Two-stage build (builder + runner) for optimized image size
- Uses Node.js 22 Alpine for minimal footprint
- Includes pnpm for efficient package management
- Production-optimized build
- Health check endpoint
- Exposes port 3000

**Build Stages:**
1. **Builder**: Installs dependencies, builds the React Router app
2. **Runner**: Minimal production image with only runtime dependencies

### 2. `.github/workflows/build-docs-container.yml`
Comprehensive GitHub Actions workflow for automated container builds.

**Features:**
- **Triggers:**
  - Push to main (builds & pushes)
  - Pull requests (builds & tests only)
  - Manual workflow dispatch with custom tags
- **Multi-platform builds:** linux/amd64 and linux/arm64
- **Layer caching:** GitHub Actions cache for faster rebuilds
- **Testing:** Automated container health checks on PRs
- **Security:** Artifact attestation for provenance
- **Tagging strategy:**
  - `latest` - Latest main branch
  - `main` - Main branch builds
  - `sha-<commit>` - Specific commit builds
  - `pr-<number>` - Pull request builds

**Jobs:**
1. `build-and-push`: Builds and pushes to GitHub Container Registry
2. `test-container`: Tests container on PRs (starts container, verifies health)

### 3. `apps/docs/.dockerignore`
Optimizes Docker build by excluding unnecessary files.

**Excludes:**
- Node modules and build artifacts
- Development files and IDE configs
- Test files and coverage reports
- CI/CD and documentation files
- Other workspace apps/libs not needed for docs

### 4. `apps/docs/DOCKER.md`
Complete documentation for Docker deployment.

**Contents:**
- Quick start guide
- Pre-built image usage
- Local build instructions
- Docker Compose integration
- Environment variables
- Health check usage
- Troubleshooting guide
- Architecture explanation
- Security considerations

### 5. `docker-compose.yml` (Updated)
Added docs service to existing Docker Compose configuration.

**New Service:**
```yaml
docs:
  build: apps/docs/Dockerfile
  ports: 3000:3000
  healthcheck: HTTP check on port 3000
```

## Usage

### Building Locally
```bash
docker build -f apps/docs/Dockerfile -t zero-docs:local .
docker run -p 3000:3000 zero-docs:local
```

### Using Pre-built Image
```bash
docker pull ghcr.io/cbnsndwch/zero-sources-docs:latest
docker run -p 3000:3000 ghcr.io/cbnsndwch/zero-sources-docs:latest
```

### With Docker Compose
```bash
# Start all services including docs
docker-compose up -d

# Start only docs
docker-compose up -d docs

# Check health
docker-compose ps
```

### GitHub Actions
The workflow automatically:
1. Builds on every push to main
2. Tests on every pull request
3. Publishes to `ghcr.io/cbnsndwch/zero-sources-docs`
4. Creates attestations for security

## Container Registry

Images are published to GitHub Container Registry:
- **Registry:** `ghcr.io`
- **Image:** `cbnsndwch/zero-sources-docs`
- **Visibility:** Public (configurable)

## Next Steps

1. **First Run:** Push to main will trigger the first build
2. **Verify:** Check GitHub Actions for build status
3. **Test:** Pull and run the published image
4. **Integration:** Use in production deployments

## Configuration Notes

### Required GitHub Secrets
No additional secrets required! The workflow uses:
- `GITHUB_TOKEN` (automatically provided)
- `github.actor` (automatically provided)

### Permissions
The workflow has appropriate permissions:
- `contents: read` - Read repository
- `packages: write` - Push to container registry
- `id-token: write` - Artifact attestation

## Monitoring

### Build Status
Check workflow runs at: `.github/workflows/build-docs-container.yml`

### Image Tags
View published images at: `https://github.com/cbnsndwch/zero-sources/pkgs/container/zero-sources-docs`

### Health Checks
Container includes built-in health checks:
```bash
docker inspect --format='{{.State.Health.Status}}' zero-docs
```

## Benefits

1. **Portability**: Run docs anywhere Docker runs
2. **Consistency**: Same environment dev to prod
3. **Automation**: Automatic builds and publishing
4. **Security**: Signed artifacts, minimal attack surface
5. **Performance**: Multi-stage builds, layer caching
6. **Testing**: Automated container testing on PRs
7. **Multi-platform**: Supports AMD64 and ARM64

## Technical Details

- **Base Image:** node:22-alpine
- **Package Manager:** pnpm
- **Runtime:** React Router 7 with Node.js server
- **Port:** 3000
- **Health Check:** HTTP GET to /
- **Image Size:** ~300MB (optimized with multi-stage build)

## Maintenance

### Updating Dependencies
Dependencies are managed via pnpm-lock.yaml. The Docker build uses frozen lockfile for reproducibility.

### Updating Node Version
Change `FROM node:22-alpine` in Dockerfile and update `engines.node` in package.json.

### Modifying Build Process
The build command is `pnpm build` which runs the React Router build. Modify in Dockerfile if needed.

## Troubleshooting

### Build Fails
1. Check GitHub Actions logs
2. Verify pnpm-lock.yaml is committed
3. Ensure all dependencies are in package.json

### Container Won't Start
1. Check logs: `docker logs zero-docs`
2. Verify port 3000 is available
3. Check environment variables

### Health Check Fails
1. Verify server is listening on port 3000
2. Check if build/server/index.js exists
3. Review React Router configuration

---

**Status:** ✅ Ready for use
**Last Updated:** 2025-11-03
**Version:** 1.0.0
