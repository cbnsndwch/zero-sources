# @cbnsndwch/zero-watermark-nats-kv

> Distributed watermark storage for Rocicorp Zero using NATS JetStream KV

[![npm version](https://img.shields.io/npm/v/@cbnsndwch/zero-watermark-nats-kv.svg)](https://www.npmjs.com/package/@cbnsndwch/zero-watermark-nats-kv)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/cbnsndwch/zero-sources/blob/main/LICENSE.md)

## Overview

`@cbnsndwch/zero-watermark-nats-kv` provides distributed, cloud-native watermark storage for Rocicorp Zero change sources using NATS JetStream Key-Value store. Perfect for multi-instance deployments where watermarks need to be shared across multiple change source instances with automatic replication and high availability.

## Features

- 🌐 **Distributed Storage**: Share watermarks across multiple change source instances
- 🔄 **Automatic Replication**: NATS JetStream ensures data replication across cluster
- 🚀 **High Availability**: Fault-tolerant with automatic failover
- ⚡ **Low Latency**: Fast reads and writes optimized for streaming
- 🏢 **NestJS Integration**: Injectable service with dependency injection
- 🔒 **Type Safety**: Full TypeScript support
- 📊 **Watch Support**: Real-time notifications on watermark changes
- 🛡️ **Production Ready**: Battle-tested with NATS reliability
- ☁️ **Cloud Native**: Perfect for Kubernetes and containerized deployments

## Installation

```bash
pnpm add @cbnsndwch/zero-watermark-nats-kv
```

**Peer Dependencies:**

```json
{
    "@nats-io/kv": "^3",
    "@nats-io/transport-node": "^3",
    "@nestjs/common": "^11",
    "@nestjs/config": "^4",
    "@nestjs/core": "^11"
}
```

## Quick Start

### 1. Module Setup

```typescript
import { Module } from '@nestjs/common';
import { ZeroWatermarkNatsKvModule } from '@cbnsndwch/zero-watermark-nats-kv';

@Module({
    imports: [
        ZeroWatermarkNatsKvModule.forRoot({
            servers: ['nats://localhost:4222'],
            bucket: 'zero-watermarks'
        })
    ]
})
export class AppModule {}
```

### 2. Use in Your Service

```typescript
import { Injectable } from '@nestjs/common';
import { WatermarkService } from '@cbnsndwch/zero-watermark-nats-kv';

@Injectable()
export class ChangeSourceService {
    constructor(private watermarkService: WatermarkService) {}

    async processChanges() {
        // Get last processed watermark
        const watermark = await this.watermarkService.get('users');

        // Process changes after watermark
        const changes = await this.getChangesAfter(watermark);

        // Update watermark - automatically replicated across instances
        await this.watermarkService.set('users', changes.lastVersion);
    }
}
```

## API Reference

### `WatermarkService`

#### `get(key: string): Promise<Watermark | null>`

Retrieves the watermark for a given key.

```typescript
const watermark = await watermarkService.get('users');
if (watermark) {
    console.log('Last version:', watermark.version);
    console.log('Timestamp:', watermark.timestamp);
}
```

#### `set(key: string, version: string, data?: Record<string, unknown>): Promise<void>`

Sets or updates a watermark (replicated across cluster).

```typescript
await watermarkService.set('users', '00000000001704067200000', {
    lastId: 'user-123',
    count: 42
});
```

#### `delete(key: string): Promise<void>`

Deletes a watermark.

```typescript
await watermarkService.delete('users');
```

#### `getAll(): Promise<Map<string, Watermark>>`

Retrieves all watermarks.

```typescript
const allWatermarks = await watermarkService.getAll();
for (const [key, watermark] of allWatermarks) {
    console.log(`${key}: ${watermark.version}`);
}
```

#### `watch(key: string, callback: (watermark: Watermark) => void): Promise<() => void>`

Watch for changes to a specific watermark.

```typescript
// Watch for watermark updates
const unwatch = await watermarkService.watch('users', watermark => {
    console.log('Watermark updated:', watermark.version);
});

// Stop watching
unwatch();
```

### Types

```typescript
interface Watermark {
    key: string;
    version: string;
    timestamp: number;
    data?: Record<string, unknown>;
}

interface NatsKvConfig {
    servers: string[];
    bucket: string;
    credentials?: string;
    token?: string;
    user?: string;
    pass?: string;
}
```

## Configuration

### Basic Configuration

```typescript
ZeroWatermarkNatsKvModule.forRoot({
    servers: ['nats://localhost:4222'],
    bucket: 'zero-watermarks'
});
```

### Production Configuration

```typescript
ZeroWatermarkNatsKvModule.forRoot({
    servers: [
        'nats://nats-1.example.com:4222',
        'nats://nats-2.example.com:4222',
        'nats://nats-3.example.com:4222'
    ],
    bucket: 'zero-watermarks',
    credentials: './nats.creds' // NATS 2.0 credentials
});
```

### Async Configuration

```typescript
import { ConfigService } from '@nestjs/config';

ZeroWatermarkNatsKvModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
        servers: config.get('NATS_SERVERS').split(','),
        bucket: config.get('NATS_BUCKET'),
        credentials: config.get('NATS_CREDENTIALS')
    })
});
```

### Authentication

#### Username/Password

```typescript
ZeroWatermarkNatsKvModule.forRoot({
    servers: ['nats://localhost:4222'],
    bucket: 'zero-watermarks',
    user: 'myuser',
    pass: 'mypassword'
});
```

#### Token Authentication

```typescript
ZeroWatermarkNatsKvModule.forRoot({
    servers: ['nats://localhost:4222'],
    bucket: 'zero-watermarks',
    token: 'my-secret-token'
});
```

#### NATS 2.0 Credentials

```typescript
ZeroWatermarkNatsKvModule.forRoot({
    servers: ['nats://localhost:4222'],
    bucket: 'zero-watermarks',
    credentials: './config/nats.creds'
});
```

## Advanced Usage

### Multi-Instance Coordination

```typescript
// Instance 1
await watermarkService.set('users', 'v1');

// Instance 2 (automatically sees the update)
const watermark = await watermarkService.get('users');
console.log(watermark.version); // 'v1'
```

### Optimistic Locking

```typescript
import { WatermarkService } from '@cbnsndwch/zero-watermark-nats-kv';

@Injectable()
export class CoordinatedProcessor {
    constructor(private watermarkService: WatermarkService) {}

    async processWithLocking(collection: string) {
        const currentWatermark = await this.watermarkService.get(collection);

        // Process changes
        const newVersion = await this.processChanges(currentWatermark);

        // Update watermark (other instances will see this)
        await this.watermarkService.set(collection, newVersion);
    }
}
```

### Real-time Watermark Watching

```typescript
@Injectable()
export class WatermarkMonitor {
    constructor(private watermarkService: WatermarkService) {}

    async onModuleInit() {
        // Watch for watermark changes
        await this.watermarkService.watch('users', watermark => {
            console.log('Watermark changed by another instance:', watermark);
            // React to changes from other instances
        });
    }
}
```

### Health Monitoring

```typescript
import { Controller, Get } from '@nestjs/common';
import { WatermarkService } from '@cbnsndwch/zero-watermark-nats-kv';

@Controller('health')
export class HealthController {
    constructor(private watermarkService: WatermarkService) {}

    @Get('watermarks')
    async checkWatermarks() {
        try {
            const watermarks = await this.watermarkService.getAll();
            return {
                status: 'healthy',
                watermarkCount: watermarks.size,
                watermarks: Array.from(watermarks.entries())
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message
            };
        }
    }
}
```

## Deployment Scenarios

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
    name: zero-change-source
spec:
    replicas: 3 # Multiple instances share watermarks via NATS
    template:
        spec:
            containers:
                - name: change-source
                  image: my-change-source:latest
                  env:
                      - name: NATS_SERVERS
                        value: 'nats://nats-1:4222,nats://nats-2:4222,nats://nats-3:4222'
                      - name: NATS_BUCKET
                        value: 'zero-watermarks'
```

### Docker Compose

```yaml
services:
    nats:
        image: nats:latest
        command: ['-js', '-sd', '/data']
        volumes:
            - nats-data:/data
        ports:
            - '4222:4222'

    change-source-1:
        image: my-change-source:latest
        environment:
            NATS_SERVERS: nats://nats:4222
            NATS_BUCKET: zero-watermarks

    change-source-2:
        image: my-change-source:latest
        environment:
            NATS_SERVERS: nats://nats:4222
            NATS_BUCKET: zero-watermarks

volumes:
    nats-data:
```

### Docker Swarm

```yaml
version: '3.8'
services:
    nats:
        image: nats:latest
        command: ['-js', '-sd', '/data']
        deploy:
            replicas: 3
            placement:
                constraints:
                    - node.role == manager

    change-source:
        image: my-change-source:latest
        deploy:
            replicas: 5 # Scale horizontally
        environment:
            NATS_SERVERS: nats://nats:4222
            NATS_BUCKET: zero-watermarks
```

## Performance

### Benchmarks

- **Writes**: ~5,000-10,000 ops/sec (depending on cluster configuration)
- **Reads**: ~20,000-50,000 ops/sec
- **Latency**: <5ms typical (same datacenter)
- **Cross-region**: <50ms (with proper NATS cluster setup)

### Optimization Tips

1. **Cluster Placement**: Co-locate NATS servers with change sources
2. **Replication Factor**: Balance between durability and performance
3. **Batch Updates**: Update watermarks after processing batches
4. **Watch Selectively**: Only watch watermarks that need coordination

## NATS JetStream Configuration

### Create Bucket

```bash
# Create KV bucket for watermarks
nats kv add zero-watermarks \
  --replicas=3 \
  --ttl=0 \
  --max-value-size=1048576
```

### Check Status

```bash
# Check bucket status
nats kv status zero-watermarks

# List all keys
nats kv ls zero-watermarks

# Get specific key
nats kv get zero-watermarks users
```

## Comparison with SQLite Storage

| Feature              | NATS KV             | SQLite             |
| -------------------- | ------------------- | ------------------ |
| **Distribution**     | ✅ Multi-instance   | ❌ Single-instance |
| **Replication**      | ✅ Automatic        | ❌ Manual          |
| **Scalability**      | ✅ Horizontal       | ⚠️ Vertical        |
| **Latency**          | ⚡ Network latency  | 🚀 Local disk      |
| **Setup Complexity** | ⚠️ Requires NATS    | ✅ Zero config     |
| **Use Case**         | Production clusters | Single servers     |

## Troubleshooting

### Connection Issues

```typescript
// Enable detailed logging
import { connect } from '@nats-io/transport-node';

const nc = await connect({
    servers: ['nats://localhost:4222'],
    debug: true // Enable debug logging
});
```

### Watermark Not Found

```typescript
// Handle missing watermarks
const watermark = await watermarkService.get('users');
const startFrom = watermark?.version ?? '0'; // Start from beginning
```

### Bucket Not Found

```bash
# Create bucket if it doesn't exist
nats kv add zero-watermarks
```

## Development

```bash
# Install dependencies
pnpm install

# Start NATS server for development
docker run -p 4222:4222 -p 8222:8222 nats:latest -js

# Build the package
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint
```

## Testing

```typescript
import { Test } from '@nestjs/testing';
import { WatermarkService } from '@cbnsndwch/zero-watermark-nats-kv';

describe('WatermarkService', () => {
    let service: WatermarkService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                ZeroWatermarkNatsKvModule.forRoot({
                    servers: ['nats://localhost:4222'],
                    bucket: 'test-watermarks'
                })
            ]
        }).compile();

        service = module.get<WatermarkService>(WatermarkService);
    });

    it('should store and retrieve watermarks', async () => {
        await service.set('test', '123');
        const watermark = await service.get('test');
        expect(watermark?.version).toBe('123');
    });
});
```

## Contributing

Contributions are welcome! Please see the [main repository](https://github.com/cbnsndwch/zero-sources) for contribution guidelines.

## License

MIT © [cbnsndwch LLC](https://cbnsndwch.io)

## Related Packages

- [@cbnsndwch/zero-contracts](https://www.npmjs.com/package/@cbnsndwch/zero-contracts) - Core contracts and utilities
- [@cbnsndwch/zero-watermark-zqlite](https://www.npmjs.com/package/@cbnsndwch/zero-watermark-zqlite) - SQLite watermark storage
- [@cbnsndwch/zero-source-mongodb](https://www.npmjs.com/package/@cbnsndwch/zero-source-mongodb) - MongoDB change source

## Resources

- [Rocicorp Zero Documentation](https://zero.rocicorp.dev/)
- [NATS JetStream](https://docs.nats.io/nats-concepts/jetstream)
- [NATS KV Store](https://docs.nats.io/nats-concepts/jetstream/key-value-store)
- [Architecture Guide](https://github.com/cbnsndwch/zero-sources/blob/main/docs/refactor/README-SEPARATED-ARCHITECTURE.md)
