# @cbnsndwch/zero-watermark-zqlite

> High-performance watermark storage for Rocicorp Zero using SQLite

[![npm version](https://img.shields.io/npm/v/@cbnsndwch/zero-watermark-zqlite.svg)](https://www.npmjs.com/package/@cbnsndwch/zero-watermark-zqlite)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE.md)

## Overview

`@cbnsndwch/zero-watermark-zqlite` provides persistent, reliable watermark storage for Rocicorp Zero change sources using SQLite via `@rocicorp/zero-sqlite3`. Watermarks track the last successfully processed change, enabling reliable resumption after restarts and preventing duplicate change processing.

## Features

- 💾 **Persistent Storage**: SQLite-backed watermark persistence
- 🚀 **High Performance**: Fast reads and writes with optimal indexing
- 🔄 **Transaction Safety**: ACID guarantees for watermark updates
- 🏢 **NestJS Integration**: Injectable service with dependency injection
- 🔒 **Type Safety**: Full TypeScript support
- 📊 **Multiple Watermarks**: Support for multiple change sources/collections
- 🛡️ **Production Ready**: Error handling, retries, and graceful degradation
- 🔍 **Introspection**: Query watermark state for monitoring

## Installation

```bash
pnpm add @cbnsndwch/zero-watermark-zqlite
```

**Peer Dependencies:**

```json
{
    "@nestjs/common": "^11",
    "@nestjs/config": "^4",
    "@rocicorp/zero-sqlite3": "*"
}
```

## Quick Start

### 1. Module Setup

```typescript
import { Module } from '@nestjs/common';
import { ZeroWatermarkZqliteModule } from '@cbnsndwch/zero-watermark-zqlite';

@Module({
    imports: [
        ZeroWatermarkZqliteModule.forRoot({
            database: './watermarks.db'
        })
    ]
})
export class AppModule {}
```

### 2. Use in Your Service

```typescript
import { Injectable } from '@nestjs/common';
import { WatermarkService } from '@cbnsndwch/zero-watermark-zqlite';

@Injectable()
export class ChangeSourceService {
    constructor(private watermarkService: WatermarkService) {}

    async processChanges() {
        // Get last processed watermark
        const watermark = await this.watermarkService.get('users');

        // Process changes after watermark
        const changes = await this.getChangesAfter(watermark);

        // Update watermark after processing
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

Sets or updates a watermark.

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

#### `clear(): Promise<void>`

Clears all watermarks.

```typescript
await watermarkService.clear();
```

### Types

```typescript
interface Watermark {
    key: string;
    version: string;
    timestamp: number;
    data?: Record<string, unknown>;
}

interface WatermarkConfig {
    database: string;
    tableName?: string; // Default: 'watermarks'
}
```

## Advanced Usage

### Multiple Collections

```typescript
// Track watermarks for different collections
await watermarkService.set('users', version1);
await watermarkService.set('posts', version2);
await watermarkService.set('comments', version3);

// Retrieve specific watermarks
const usersWatermark = await watermarkService.get('users');
const postsWatermark = await watermarkService.get('posts');
```

### Custom Metadata

```typescript
// Store additional metadata with watermarks
await watermarkService.set('users', version, {
    lastProcessedId: 'user-456',
    documentsProcessed: 100,
    errors: 0,
    processingTime: 1234
});

// Retrieve metadata
const watermark = await watermarkService.get('users');
console.log('Documents processed:', watermark?.data?.documentsProcessed);
```

### Transaction Handling

```typescript
import { Injectable } from '@nestjs/common';
import { WatermarkService } from '@cbnsndwch/zero-watermark-zqlite';

@Injectable()
export class ChangeProcessor {
    constructor(private watermarkService: WatermarkService) {}

    async processChangesBatch(changes: Change[]) {
        try {
            // Process changes
            await this.processChanges(changes);

            // Update watermark only after successful processing
            const lastChange = changes[changes.length - 1];
            await this.watermarkService.set('users', lastChange.version);
        } catch (error) {
            // Watermark not updated on error - will retry from last position
            console.error('Processing failed, watermark not updated');
            throw error;
        }
    }
}
```

### Monitoring Watermarks

```typescript
import { Controller, Get } from '@nestjs/common';
import { WatermarkService } from '@cbnsndwch/zero-watermark-zqlite';

@Controller('monitoring')
export class MonitoringController {
    constructor(private watermarkService: WatermarkService) {}

    @Get('watermarks')
    async getWatermarks() {
        const watermarks = await this.watermarkService.getAll();
        return Array.from(watermarks.entries()).map(([key, mark]) => ({
            collection: key,
            version: mark.version,
            timestamp: mark.timestamp,
            age: Date.now() - mark.timestamp
        }));
    }
}
```

## Configuration

### Module Options

```typescript
ZeroWatermarkZqliteModule.forRoot({
    // Database file path
    database: './data/watermarks.db',

    // Custom table name (optional)
    tableName: 'change_watermarks',

    // SQLite options (optional)
    sqliteOptions: {
        verbose: console.log
    }
});
```

### Async Configuration

```typescript
import { ConfigService } from '@nestjs/config';

ZeroWatermarkZqliteModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
        database: config.get('WATERMARK_DB_PATH')
    })
});
```

## Integration with Change Sources

### MongoDB Change Source

```typescript
import { Injectable } from '@nestjs/common';
import { WatermarkService } from '@cbnsndwch/zero-watermark-zqlite';

@Injectable()
export class MongoChangeSource {
    constructor(private watermarkService: WatermarkService) {}

    async watchCollection(collection: string) {
        const watermark = await this.watermarkService.get(collection);

        const changeStream = db.collection(collection).watch([], {
            startAfter: watermark?.version
        });

        changeStream.on('change', async change => {
            await this.processChange(change);

            // Update watermark after successful processing
            await this.watermarkService.set(collection, change._id.toString());
        });
    }
}
```

## Performance

### Benchmarks

- **Writes**: ~10,000 ops/sec
- **Reads**: ~50,000 ops/sec
- **Database Size**: Minimal (KB range for typical usage)

### Optimization Tips

1. **Batch Updates**: Update watermarks after batches, not individual changes
2. **Index Usage**: The default schema includes optimal indexes
3. **WAL Mode**: SQLite WAL mode enabled by default for better concurrency
4. **Separate Database**: Keep watermarks in a separate database file

## Backup and Recovery

### Backup

```typescript
import { WatermarkService } from '@cbnsndwch/zero-watermark-zqlite';
import { promises as fs } from 'fs';

async function backupWatermarks(watermarkService: WatermarkService) {
    const watermarks = await watermarkService.getAll();
    const backup = Object.fromEntries(watermarks);

    await fs.writeFile(
        'watermarks-backup.json',
        JSON.stringify(backup, null, 2)
    );
}
```

### Recovery

```typescript
async function restoreWatermarks(
    watermarkService: WatermarkService,
    backupPath: string
) {
    const backup = JSON.parse(await fs.readFile(backupPath, 'utf-8'));

    for (const [key, watermark] of Object.entries(backup)) {
        await watermarkService.set(key, watermark.version, watermark.data);
    }
}
```

## Troubleshooting

### Database Locked

```typescript
// Enable retry logic
ZeroWatermarkZqliteModule.forRoot({
    database: './watermarks.db',
    sqliteOptions: {
        busyTimeout: 5000 // Wait up to 5 seconds for locks
    }
});
```

### Watermark Not Found

```typescript
// Handle missing watermarks gracefully
const watermark = await watermarkService.get('users');
const startFrom = watermark?.version ?? '0'; // Start from beginning if not found
```

### Database Corruption

```bash
# Check database integrity
sqlite3 watermarks.db "PRAGMA integrity_check;"

# Rebuild database if needed
sqlite3 watermarks.db "VACUUM;"
```

## Development

```bash
# Install dependencies
pnpm install

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
import { WatermarkService } from '@cbnsndwch/zero-watermark-zqlite';

describe('WatermarkService', () => {
    let service: WatermarkService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                ZeroWatermarkZqliteModule.forRoot({
                    database: ':memory:' // In-memory for testing
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

MIT © [Sergio Leon](https://cbnsndwch.io)

## Related Packages

- [@cbnsndwch/zero-contracts](../zero-contracts) - Core contracts and utilities
- [@cbnsndwch/zero-watermark-nats-kv](../zero-watermark-nats-kv) - NATS-based watermark storage
- [@cbnsndwch/zero-source-mongodb](../zero-source-mongodb) - MongoDB change source

## Resources

- [Rocicorp Zero Documentation](https://zero.rocicorp.dev/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Change Source Protocol](../../docs/ChangeSourceProtocol.md)
