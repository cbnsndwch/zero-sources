# @cbnsndwch/zrocket-contracts

Contracts and Zero schema for ZRocket - a Rocket.Chat-style chat application demonstrating discriminated union tables.

## Overview

This library contains the complete Zero schema, table mappings, and permissions for the ZRocket application. It demonstrates how to create multiple Zero tables from single MongoDB collections using discriminated unions.

## Features

- **Discriminated Union Tables**: Multiple Zero tables created from single MongoDB collections
- **Room Types**: Separate tables for chats, groups, and channels from a single `rooms` collection
- **Message Types**: Separate tables for user messages and system messages from a single `messages` collection
- **Type Safety**: Full TypeScript support with proper type definitions
- **Schema Export**: Built-in configuration export functionality

## Installation

```bash
pnpm add @cbnsndwch/zrocket-contracts
```

## Usage

### Importing Schema and Contracts

```typescript
import {
    schema,
    mapping,
    permissions
} from '@cbnsndwch/zrocket-contracts/schema';
```

### Individual Table Imports

```typescript
import {
    chatsTable,
    channelsTable,
    groupsTable
} from '@cbnsndwch/zrocket-contracts';
```

## Configuration Export

This library includes a script to export schema, table mappings, and permissions to JSON files for use with change sources or other external systems.

### Export Configuration

```bash
pnpm export-config
```

This will generate JSON files in `.local/config/`:

- `schema.json` - Complete Zero schema
- `table-mappings.json` - MongoDB collection to table mappings
- `permissions.json` - Zero permissions configuration
- `combined.json` - All configurations in one file

### Generated Files

The exported files can be used by:

- MongoDB change source servers
- External monitoring tools
- Development debugging
- Configuration validation

Example table mapping structure:

```json
{
    "chats": {
        "source": "rooms",
        "filter": { "t": { "$eq": "d" } },
        "projection": { "_id": 1, "memberIds": 1, "createdAt": 1 }
    }
}
```

## Table Structure

### Room Tables (from `rooms` collection)

- **chats** - Direct message rooms (`t = 'd'`)
- **groups** - Private group rooms (`t = 'p'`)
- **channels** - Public channel rooms (`t = 'c'`)

### Message Tables (from `messages` collection)

- **userMessages** - User-generated messages (`t = 'USER'`)
- **systemMessages** - System-generated messages (`t != 'USER'`)

### Other Tables

- **users** - User accounts and profiles

## Development

### Build

```bash
pnpm build
```

### Test

```bash
pnpm test
```

### Lint

```bash
pnpm lint
```

## License

MIT
