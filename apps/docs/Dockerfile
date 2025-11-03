# Base
FROM node:22-alpine AS builder

ENV NODE_ENV=production \
    TURBO_TELEMETRY_DISABLED=1
    
# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /opt/app

# copy everything
COPY . .

# Install all workspace packages to ensure all dependencies are available
RUN pnpm i --filter @cbnsndwch/zero-sources-docs... --filter @cbnsndwch/zero-sources

# Build the documentation site
# build NestJS project
RUN pnpm build --filter=@cbnsndwch/zero-sources-docs...

# Create production deployment with only production dependencies
# This prunes dev dependencies and creates a clean, minimal deployment
# Note: pnpm deploy requires exact package name (no ... glob)
# Using --legacy flag for pnpm v10+ compatibility with workspace dependencies
RUN pnpm deploy --filter=@cbnsndwch/zero-sources-docs --prod --legacy /opt/build

# Stage 2: Production runtime
FROM node:22-alpine AS runner

# Set up runtime environment
# ARG GH_PAT
ARG GIT_SHA
ARG GIT_REF_NAME
ARG IMAGE_TAGS
ARG BUILD_TIME
ARG IMAGE_SOURCE
ENV NODE_ENV=production \
    TURBO_TELEMETRY_DISABLED=1 \
    BUILD_SHA=$GIT_SHA \
    BUILD_REF=$GIT_REF_NAME \
    BUILD_TAGS=$IMAGE_TAGS \
    BUILD_TIME=$BUILD_TIME

LABEL org.opencontainers.image.title="Zero Sources Docs" \
      org.opencontainers.image.description="Documentation site for @cbnsndwch/zero-sources" \
      org.opencontainers.image.source="https://github.com/cbnsndwch/zero-sources" \
      org.opencontainers.image.url="https://github.com/cbnsndwch/zero-sources/apps/docs" \
      org.opencontainers.image.version="${GIT_REF_NAME}" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.created="${BUILD_TIME}" \
      org.opencontainers.image.ref.name="${IMAGE_TAGS}" \
      org.opencontainers.image.source="${IMAGE_SOURCE}"

# Set final working directory
# pnpm deploy creates a flat structure with the package at the root of /srv
# So dist/ is at /srv/dist/, not /srv/apps/service-sync-change-source/dist/
WORKDIR /opt/app

# Copy the production deployment from builder (includes production dependencies)
COPY --from=builder /opt/build /opt/app

# # Add Tini
# ENV TINI_VERSION=v0.19.0
# ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
# RUN chmod +x /tini
# 
# # tini ftw!
# ENTRYPOINT ["/tini", "--"]

ENTRYPOINT ["/bin/sh", "-c"]

CMD ["/opt/app/dist/main.js"]
