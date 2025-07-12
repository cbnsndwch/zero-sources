# ZRocket Docker Swarm Deployment

This directory contains the Docker Swarm stack configuration for deploying the ZRocket application with MongoDB Atlas integration and Zero sync services.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MongoDB       │    │   PostgreSQL    │    │   Zero Sync     │
│   Atlas         │◄───┤   (CDC/CVR)     │◄───┤   Service       │
│   (External)    │    │   Container     │    │   Container     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Traefik       │◄───┤   ZRocket API   │◄───┤   ZRocket       │
│   Proxy         │    │   Container     │    │   Frontend      │
│   (External)    │    │   (2 replicas)  │    │   Container     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Services

### 1. PostgreSQL (`postgres`)
- **Image**: `postgres:16-alpine`
- **Purpose**: Zero CDC and CVR databases
- **Resources**: 512MB RAM, 0.5 CPU
- **Volumes**: Persistent storage for data
- **Networks**: Internal `zero-network`

### 2. Zero Sync (`zero-sync`)
- **Image**: `rocicorp/zero-cache:latest`
- **Purpose**: Zero synchronization service
- **Resources**: 1GB RAM, 1.0 CPU
- **Domain**: `zero.zrocket.app`
- **Port**: 4848
- **TLS**: Let's Encrypt via Traefik

### 3. ZRocket API (`zrocket-api`)
- **Image**: `ghcr.io/cbnsndwch/zero-sources/zrocket-api:latest`
- **Purpose**: NestJS API with discriminated unions
- **Resources**: 512MB RAM, 0.5 CPU
- **Replicas**: 2 (load balanced)
- **Domain**: `api.zrocket.app`
- **Port**: 8012
- **TLS**: Let's Encrypt via Traefik

### 4. ZRocket Frontend (`zrocket-frontend`)
- **Image**: `ghcr.io/cbnsndwch/zero-sources/zrocket-frontend:latest`
- **Purpose**: React frontend with Zero integration
- **Resources**: 128MB RAM, 0.25 CPU
- **Replicas**: 2 (load balanced)
- **Domain**: `zrocket.app` / `www.zrocket.app`
- **Port**: 3000
- **TLS**: Let's Encrypt via Traefik

## Prerequisites

1. **Docker Swarm cluster** with Traefik proxy already deployed
2. **MongoDB Atlas** cluster with connection string
3. **Portainer** instance for stack management
4. **GitHub Container Registry** access for pulling images

## Deployment

### 1. Setup Environment
```bash
# Copy and configure environment
cp .env.example .env
# Edit .env with your actual values
```

### 2. Create Docker Secrets
```bash
# Create PostgreSQL password secret
echo "your_secure_postgres_password" | docker secret create zrocket_postgres_password -

# Create JWT secret
echo "your_secure_jwt_secret_at_least_32_chars" | docker secret create zrocket_jwt_secret -
```

### 3. Deploy Stack
```bash
# Deploy via Portainer (recommended) or Docker CLI
docker stack deploy -c docker-compose.yml zrocket
```

### 4. Copy Zero Schema
```bash
# Copy discriminated schema to the deployment
docker cp path/to/discriminated-schema.json $(docker ps -q -f name=zrocket_zero-sync):/app/schema/
```

## Traefik Configuration

The stack expects these Traefik middleware to be available:
- `secure-headers`: Security headers middleware
- `rate-limit`: Rate limiting middleware  
- `compression`: Gzip compression middleware

## Health Checks

All services include health checks:
- **API**: `GET /health`
- **Frontend**: `GET /health`
- **PostgreSQL**: Built-in health check
- **Zero Sync**: Built-in health check

## Monitoring

Check service status:
```bash
# View stack services
docker stack services zrocket

# View service logs
docker service logs zrocket_zrocket-api
docker service logs zrocket_zero-sync
```

## Scaling

Scale services as needed:
```bash
# Scale API service
docker service scale zrocket_zrocket-api=4

# Scale frontend service  
docker service scale zrocket_zrocket-frontend=3
```

## Security Features

- Non-root container users
- Resource limits and reservations
- Secrets management for sensitive data
- Security headers via Traefik middleware
- Rate limiting on public endpoints
- TLS certificates via Let's Encrypt
- Internal network isolation

## Backup

Important data to backup:
- PostgreSQL volume: `postgres_data`
- MongoDB Atlas: Use Atlas backup features
- Docker secrets: Store securely offline

## Troubleshooting

### Common Issues

1. **Schema not found**: Ensure discriminated-schema.json is in the correct location
2. **MongoDB connection failed**: Verify MONGODB_ATLAS_URI and network access
3. **Zero sync errors**: Check PostgreSQL connection and database initialization
4. **TLS certificate issues**: Verify domain DNS points to Traefik load balancer

### Useful Commands
```bash
# Check stack status
docker stack ps zrocket

# View service configuration
docker service inspect zrocket_zrocket-api

# Scale down for maintenance
docker service scale zrocket_zrocket-api=0

# Update service image
docker service update --image ghcr.io/cbnsndwch/zero-sources/zrocket-api:latest zrocket_zrocket-api
```