# Quick Reference: Documentation Docker Container

## Build & Run Commands

### Local Development
```bash
# Build the Docker image
docker build -f apps/docs/Dockerfile -t zero-docs .

# Run the container
docker run -d -p 3000:3000 --name zero-docs zero-docs

# View logs
docker logs -f zero-docs

# Stop and remove
docker stop zero-docs && docker rm zero-docs
```

### Using Docker Compose
```bash
# Start docs service
docker-compose up -d docs

# View logs
docker-compose logs -f docs

# Check health
docker-compose ps docs

# Restart
docker-compose restart docs

# Stop
docker-compose down docs
```

### Using Pre-built Image
```bash
# Pull latest
docker pull ghcr.io/cbnsndwch/zero-sources-docs:latest

# Run
docker run -d -p 3000:3000 ghcr.io/cbnsndwch/zero-sources-docs:latest
```

## GitHub Actions

### Automatic Triggers
- **Push to main**: Builds and pushes to registry
- **Pull requests**: Builds and tests (no push)

### Manual Trigger
1. Go to: GitHub → Actions → "Build Docs Container"
2. Click "Run workflow"
3. Select branch
4. Optional: Enter custom tag
5. Click "Run workflow"

## Access Points

| Service | URL | Port |
|---------|-----|------|
| Documentation | http://localhost:3000 | 3000 |

## Health Checks

```bash
# Docker inspect
docker inspect --format='{{.State.Health.Status}}' zero-docs

# Manual HTTP check
curl http://localhost:3000

# Docker Compose
docker-compose ps
```

## Image Information

| Property | Value |
|----------|-------|
| Registry | ghcr.io |
| Image Name | cbnsndwch/zero-sources-docs |
| Base | node:22-alpine |
| Size | ~300MB |
| Platforms | linux/amd64, linux/arm64 |

## Tags

| Tag | Description |
|-----|-------------|
| `latest` | Latest build from main |
| `main` | Main branch |
| `sha-<hash>` | Specific commit |
| `pr-<number>` | Pull request build |

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs zero-docs

# Verify port is free
netstat -an | findstr "3000"

# Check container status
docker inspect zero-docs
```

### Build fails
```bash
# Check Docker disk space
docker system df

# Clean up
docker system prune -a

# Rebuild without cache
docker build --no-cache -f apps/docs/Dockerfile -t zero-docs .
```

### Health check fails
```bash
# Test inside container
docker exec zero-docs wget -O- http://localhost:3000

# Check process
docker exec zero-docs ps aux
```

## Environment Variables

```bash
# Custom port
docker run -d -p 8080:8080 -e PORT=8080 zero-docs

# Production mode (default)
docker run -d -p 3000:3000 -e NODE_ENV=production zero-docs
```

## Files Reference

| File | Purpose |
|------|---------|
| `apps/docs/Dockerfile` | Multi-stage build configuration |
| `apps/docs/.dockerignore` | Build optimization |
| `apps/docs/DOCKER.md` | Full documentation |
| `.github/workflows/build-docs-container.yml` | CI/CD workflow |
| `docker-compose.yml` | Multi-service orchestration |

## Quick URLs

- **Repository**: https://github.com/cbnsndwch/zero-sources
- **Container Registry**: https://github.com/cbnsndwch/zero-sources/pkgs/container/zero-sources-docs
- **Workflow**: https://github.com/cbnsndwch/zero-sources/actions/workflows/build-docs-container.yml
