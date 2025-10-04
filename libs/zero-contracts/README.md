# @cbnsndwch/zero-contracts

> Core TypeScript contracts, utilities, and protocols for building custom change sources with Rocicorp Zero

[![npm version](https://img.shields.io/npm/v/@cbnsndwch/zero-contracts.svg)](https://www.npmjs.com/package/@cbnsndwch/zero-contracts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE.md)

## Overview

`@cbnsndwch/zero-contracts` provides the foundational TypeScript contracts, interfaces, and utilities needed to build custom change sources for [Rocicorp Zero](https://zero.rocicorp.dev/). This package serves as the bedrock for all other packages in the zero-sources ecosystem, defining standard protocols for upstream communication, watermark management, configuration, and real-time data synchronization.

## Features

- 🔌 **Upstream Protocols**: Standard WebSocket and HTTP protocols for Zero change streaming
- 💧 **Watermark Interfaces**: Type-safe interfaces for watermark storage and retrieval
- ⚙️ **Configuration Types**: Strongly-typed configuration schemas for change sources
- 🛠️ **Utility Functions**: Common utilities for version management, invariants, and data transformation
- 📊 **Dictionary Types**: Shared data structures for change tracking and metadata
- 🔒 **Type Safety**: Full TypeScript support with strict typing throughout

## Installation

```bash
pnpm add @cbnsndwch/zero-contracts
```

**Peer Dependencies:**

- `@rocicorp/zero` - The core Rocicorp Zero library

## Usage

### Upstream Protocols

```typescript
import { UpstreamProtocol } from '@cbnsndwch/zero-contracts';

// Implement upstream communication for your change source
class MyChangeSource implements UpstreamProtocol {
    async connect(url: string): Promise<void> {
        // WebSocket connection logic
    }

    async sendChanges(changes: Change[]): Promise<void> {
        // Send changes upstream
    }
}
```

### Watermark Management

```typescript
import { WatermarkService, Watermark } from '@cbnsndwch/zero-contracts';

// Use watermark interfaces for change tracking
class MyWatermarkStore implements WatermarkService {
    async get(key: string): Promise<Watermark | null> {
        // Retrieve watermark
    }

    async set(key: string, watermark: Watermark): Promise<void> {
        // Store watermark
    }
}
```

### Configuration Types

```typescript
import { ChangeSourceConfig } from '@cbnsndwch/zero-contracts';

// Type-safe configuration for your change source
const config: ChangeSourceConfig = {
    upstream: {
        url: 'ws://localhost:4848',
        protocol: 'v0'
    },
    watermark: {
        storage: 'sqlite',
        path: './watermarks.db'
    }
};
```

### Utility Functions

```typescript
import { invariant, lexiVersion } from '@cbnsndwch/zero-contracts';

// Runtime assertions
invariant(connection !== null, 'Connection must be established');

// Version management for lexicographic ordering
const version = lexiVersion(); // e.g., "00000000001704067200000"
```

## API Reference

### Core Exports

- **`dict`** - Dictionary utilities for change tracking
- **`invariant`** - Runtime assertion utilities
- **`lexi-version`** - Lexicographic version generation
- **`upstream/`** - Upstream protocol interfaces and implementations
- **`watermark/`** - Watermark service interfaces
- **`config/`** - Configuration type definitions
- **`utils/`** - Common utility functions

### Key Interfaces

```typescript
// Watermark tracking
interface Watermark {
    version: string;
    timestamp: number;
    data?: Record<string, unknown>;
}

// Change source configuration
interface ChangeSourceConfig {
    upstream: UpstreamConfig;
    watermark: WatermarkConfig;
    schema?: SchemaConfig;
}

// Upstream protocol
interface UpstreamProtocol {
    connect(url: string): Promise<void>;
    disconnect(): Promise<void>;
    sendChanges(changes: Change[]): Promise<void>;
}
```

## Architecture

This package is designed to be:

- **Framework-agnostic**: Works with any Node.js framework
- **Database-agnostic**: No assumptions about data storage
- **Composable**: Mix and match implementations
- **Type-safe**: Full TypeScript coverage with strict types

## Integration with Other Packages

`@cbnsndwch/zero-contracts` is used by:

- **`@cbnsndwch/zero-source-mongodb`** - MongoDB change source implementation
- **`@cbnsndwch/zero-watermark-zqlite`** - SQLite watermark storage
- **`@cbnsndwch/zero-watermark-nats-kv`** - NATS KV watermark storage
- **`@cbnsndwch/zrocket-contracts`** - Application-specific contracts

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Lint code
pnpm lint
```

## TypeScript Support

This package includes full TypeScript definitions and is built with `strict` mode enabled. All exports are properly typed for excellent IDE support and compile-time safety.

```typescript
// Full IntelliSense support
import {
    Watermark,
    UpstreamProtocol,
    ChangeSourceConfig
} from '@cbnsndwch/zero-contracts';
```

## Contributing

Contributions are welcome! Please see the [main repository](https://github.com/cbnsndwch/zero-sources) for contribution guidelines.

## License

MIT © [Sergio Leon](https://cbnsndwch.io)

## Related Packages

- [@cbnsndwch/zero-source-mongodb](../zero-source-mongodb) - MongoDB change source
- [@cbnsndwch/zero-nest-mongoose](../zero-nest-mongoose) - NestJS Mongoose integration
- [@cbnsndwch/zero-watermark-zqlite](../zero-watermark-zqlite) - SQLite watermark storage
- [@cbnsndwch/zero-watermark-nats-kv](../zero-watermark-nats-kv) - NATS watermark storage

## Resources

- [Rocicorp Zero Documentation](https://zero.rocicorp.dev/)
- [zero-sources Repository](https://github.com/cbnsndwch/zero-sources)
- [Architecture Documentation](../../docs/refactor/README-SEPARATED-ARCHITECTURE.md)
