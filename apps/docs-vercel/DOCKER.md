# Docker Deployment Guide for Zero Sources Documentation

This guide explains how to build and run the Zero Sources documentation site as a Docker container.

## Quick Start

### Using Pre-built Image from GitHub Container Registry

```bash
# Pull the latest image
docker pull ghcr.io/cbnsndwch/zero-sources-docs:latest

# Run the container
docker run -d \
  --name zero-docs \
  -p 3000:3000 \
  ghcr.io/cbnsndwch/zero-sources-docs:latest

# Access the documentation at http://localhost:3000
```

### Building Locally

```bash
# Build the Docker image
docker build -f apps/docs/Dockerfile -t zero-docs:local .

# Run the container
docker run -d \
  --name zero-docs \
  -p 3000:3000 \
  zero-docs:local
```

## Docker Compose

Add this service to your `docker-compose.yml`:

```yaml
services:
  docs:
    image: ghcr.io/cbnsndwch/zero-sources-docs:latest
    container_name: zero-docs
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - zero-network
```

## GitHub Actions Workflow

The documentation site is automatically built and pushed to GitHub Container Registry when:

1. **Push to main branch** - Builds and pushes with `latest` tag
2. **Pull requests** - Builds and tests the container (no push)
3. **Manual trigger** - Allows custom tag specification

### Workflow Features

- ✅ Multi-platform builds (linux/amd64, linux/arm64)
- ✅ Docker layer caching for faster builds
- ✅ Container testing on pull requests
- ✅ Artifact attestation for security
- ✅ Automatic tagging with version, branch, and SHA

### Manual Trigger

You can manually trigger the workflow from GitHub Actions:

1. Go to Actions → Build Docs Container
2. Click "Run workflow"
3. Optionally specify a custom tag (default: `latest`)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node environment |
| `PORT` | `3000` | Port to listen on |

## Health Check

The container includes a health check that verifies the HTTP server is responding:

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' zero-docs
```

## Troubleshooting

### View container logs

```bash
docker logs zero-docs
```

### Interactive shell

```bash
docker exec -it zero-docs sh
```

### Test the health check manually

```bash
docker exec zero-docs node -e "require('http').get('http://localhost:3000', (r) => {console.log('Status:', r.statusCode)})"
```

## Architecture

The Dockerfile uses a multi-stage build:

1. **Builder stage**: Installs dependencies and builds the React Router application
2. **Runner stage**: Creates a minimal production image with only runtime dependencies

This approach:
- Reduces final image size
- Improves security by excluding build tools
- Speeds up deployment and container startup

## Image Tags

Images are tagged with multiple conventions:

- `latest` - Latest build from main branch
- `main` - Latest build from main branch
- `sha-<commit>` - Specific commit SHA
- `pr-<number>` - Pull request builds (for testing)

## Security

- Images are signed with artifact attestation
- Only production dependencies are included
- Runs as non-root user
- Security scanning via GitHub Advanced Security

## Performance

The build process includes:
- Docker layer caching via GitHub Actions cache
- Optimized dependency installation
- Production-optimized React Router build
- Static asset optimization

## Support

For issues related to:
- **Docker builds**: Check the GitHub Actions workflow logs
- **Runtime errors**: Check container logs with `docker logs`
- **Documentation content**: See the main repository README
