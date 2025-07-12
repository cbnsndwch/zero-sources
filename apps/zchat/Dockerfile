# Multi-stage Docker build for React frontend with arm64 optimization
FROM --platform=$BUILDPLATFORM node:22-alpine AS dependencies

# Install pnpm globally
RUN npm install -g pnpm@10.13.1

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/zchat/package.json ./apps/zchat/
COPY libs/*/package.json ./libs/*/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM dependencies AS builder

# Copy source code
COPY . .

# Build the frontend application
RUN pnpm --filter=@cbnsndwch/zchat build

# Production stage with nginx
FROM nginx:alpine AS runtime

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/apps/zchat/build /usr/share/nginx/html

# Create non-root user for security
RUN addgroup -g 1001 -S nginx-group && \
    adduser -S nginx-user -u 1001 -G nginx-group

# Change ownership and permissions
RUN chown -R nginx-user:nginx-group /usr/share/nginx/html && \
    chown -R nginx-user:nginx-group /var/cache/nginx && \
    chown -R nginx-user:nginx-group /var/log/nginx && \
    chown -R nginx-user:nginx-group /etc/nginx/conf.d

# Switch to non-root user
USER nginx-user

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]