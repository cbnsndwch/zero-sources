# Multi-stage Docker build for NestJS API with arm64 optimization
# Use Node.js 22 with Alpine for smaller images
FROM --platform=$BUILDPLATFORM node:22-alpine AS dependencies

# Install pnpm and tini for proper signal handling
RUN npm install -g pnpm@10.13.1 && \
    apk add --no-cache tini

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/zchat-api/package.json ./apps/zchat-api/
COPY libs/*/package.json ./libs/*/

# Install dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Build stage
FROM dependencies AS builder

# Copy source code
COPY . .

# Build the application
RUN pnpm --filter=@cbnsndwch/zchat-api build

# Production stage
FROM node:22-alpine AS runtime

# Install pnpm and tini for proper signal handling
RUN npm install -g pnpm@10.13.1 && \
    apk add --no-cache tini

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/zchat-api/package.json ./apps/zchat-api/
COPY libs/*/package.json ./libs/*/

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application and necessary source files
COPY --from=builder /app/apps/zchat-api/dist ./apps/zchat-api/dist
COPY --from=builder /app/libs ./libs

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Change ownership of the app directory
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 8012

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --eval "require('http').get('http://localhost:8012/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Start the application (ZRocket version) with tini for proper signal handling
ENTRYPOINT ["tini", "--"]
CMD ["node", "apps/zchat-api/dist/zrocket-main.js"]