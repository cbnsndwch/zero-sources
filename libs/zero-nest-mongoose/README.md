# @cbnsndwch/zero-nest-mongoose

> Automatic Zero schema generation from NestJS Mongoose schemas

[![npm version](https://img.shields.io/npm/v/@cbnsndwch/zero-nest-mongoose.svg)](https://www.npmjs.com/package/@cbnsndwch/zero-nest-mongoose)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/cbnsndwch/zero-sources/blob/main/LICENSE.md)

## Overview

`@cbnsndwch/zero-nest-mongoose` automatically generates Rocicorp Zero schemas from your existing NestJS Mongoose schemas. This eliminates manual schema duplication and keeps your MongoDB models and Zero schemas perfectly synchronized with full TypeScript support.

## Features

- 🔄 **Automatic Schema Generation**: Convert Mongoose schemas to Zero schemas automatically
- 🎯 **Type Safety**: Full TypeScript support with proper type inference
- 📊 **Relationship Mapping**: Automatic detection and mapping of schema relationships
- 🏗️ **Virtual Tables**: Support for Zero virtual tables and discriminated unions
- 🔌 **NestJS Integration**: Seamless integration with NestJS dependency injection
- ⚡ **Zero Config**: Works out of the box with minimal configuration
- 🛠️ **Customizable**: Override and customize generated schemas as needed

## Installation

```bash
pnpm add @cbnsndwch/zero-nest-mongoose
```

**Peer Dependencies:**

```json
{
    "@nestjs/common": "^11",
    "@nestjs/mongoose": "^11",
    "@rocicorp/zero": "*",
    "mongoose": "^8.9.5"
}
```

## Quick Start

### 1. Define Your Mongoose Schema

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ type: Types.ObjectId, ref: 'Organization' })
    organizationId: Types.ObjectId;

    @Prop({ default: Date.now })
    createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

### 2. Generate Zero Schema

```typescript
import { generateZeroSchema } from '@cbnsndwch/zero-nest-mongoose';

// Automatically generate Zero schema from Mongoose schema
const userTable = generateZeroSchema(UserSchema, 'users');

console.log(userTable);
// Output:
// {
//   tableName: 'users',
//   columns: {
//     id: { type: 'string' },
//     name: { type: 'string' },
//     email: { type: 'string' },
//     organizationId: { type: 'string' },
//     createdAt: { type: 'number' }
//   },
//   primaryKey: ['id'],
//   relationships: {
//     organization: {
//       sourceField: ['organizationId'],
//       destSchema: () => organizationTable,
//       destField: ['id']
//     }
//   }
// }
```

### 3. Use in Your Zero Client

```typescript
import { Zero } from '@rocicorp/zero';
import { createSchema } from '@rocicorp/zero';

const schema = createSchema({
    version: 1,
    tables: {
        users: userTable
        // ... other tables
    }
});

const zero = new Zero({
    server: 'ws://localhost:4848',
    schema,
    userID: 'user-123'
});
```

## Advanced Usage

### Multiple Schemas

```typescript
import { generateZeroSchemas } from '@cbnsndwch/zero-nest-mongoose';

// Generate schemas for all your models at once
const schemas = generateZeroSchemas({
    users: UserSchema,
    posts: PostSchema,
    comments: CommentSchema
});

const zeroSchema = createSchema({
    version: 1,
    tables: schemas
});
```

### Custom Field Mapping

```typescript
import { generateZeroSchema, FieldMapper } from '@cbnsndwch/zero-nest-mongoose';

const customMapper: FieldMapper = {
    // Map MongoDB types to Zero types
    ObjectId: 'string',
    Date: 'number',
    Mixed: 'json'
};

const userTable = generateZeroSchema(UserSchema, 'users', {
    fieldMapper: customMapper
});
```

### Relationship Configuration

```typescript
import { generateZeroSchema } from '@cbnsndwch/zero-nest-mongoose';

const userTable = generateZeroSchema(UserSchema, 'users', {
    relationships: {
        // Override auto-detected relationships
        organization: {
            sourceField: ['organizationId'],
            destTable: 'organizations',
            destField: ['id']
        }
    }
});
```

### Virtual Tables

```typescript
import { generateZeroSchema } from '@cbnsndwch/zero-nest-mongoose';

// Generate multiple Zero tables from single Mongoose schema
const roomSchemas = generateZeroSchema(RoomSchema, 'rooms', {
    virtualTables: [
        {
            tableName: 'chats',
            discriminator: { field: 'type', value: 'chat' }
        },
        {
            tableName: 'channels',
            discriminator: { field: 'type', value: 'channel' }
        },
        {
            tableName: 'groups',
            discriminator: { field: 'type', value: 'group' }
        }
    ]
});

// Returns: { chats: {...}, channels: {...}, groups: {...} }
```

### Excluding Fields

```typescript
const userTable = generateZeroSchema(UserSchema, 'users', {
    exclude: ['password', '__v', 'passwordResetToken']
});
```

### Custom Primary Key

```typescript
const userTable = generateZeroSchema(UserSchema, 'users', {
    primaryKey: ['email'] // Use email instead of _id
});
```

## Type Mapping

The library automatically maps Mongoose types to Zero types:

| Mongoose Type | Zero Type |
| ------------- | --------- |
| String        | string    |
| Number        | number    |
| Boolean       | boolean   |
| Date          | number    |
| ObjectId      | string    |
| Buffer        | string    |
| Mixed         | json      |
| Array         | json      |

## API Reference

### `generateZeroSchema(schema, tableName, options?)`

Generates a Zero table schema from a Mongoose schema.

**Parameters:**

- `schema: Schema` - Mongoose schema
- `tableName: string` - Name for the Zero table
- `options?: GenerateOptions` - Optional configuration

**Returns:** `TableSchema` - Zero table schema definition

### `generateZeroSchemas(schemas, options?)`

Generates multiple Zero table schemas at once.

**Parameters:**

- `schemas: Record<string, Schema>` - Map of table names to Mongoose schemas
- `options?: GenerateOptions` - Optional configuration

**Returns:** `Record<string, TableSchema>` - Map of Zero table schemas

### `GenerateOptions`

```typescript
interface GenerateOptions {
    // Custom field type mapping
    fieldMapper?: FieldMapper;

    // Override relationship detection
    relationships?: Record<string, RelationshipConfig>;

    // Fields to exclude from schema
    exclude?: string[];

    // Custom primary key
    primaryKey?: string[];

    // Generate virtual tables
    virtualTables?: VirtualTableConfig[];
}
```

## Integration Patterns

### With NestJS Module

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { generateZeroSchema } from '@cbnsndwch/zero-nest-mongoose';
import { User, UserSchema } from './entities/user.entity';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
    ],
    providers: [
        {
            provide: 'ZERO_USER_SCHEMA',
            useFactory: () => generateZeroSchema(UserSchema, 'users')
        }
    ],
    exports: ['ZERO_USER_SCHEMA']
})
export class UsersModule {}
```

### Schema Export Endpoint

```typescript
import { Controller, Get } from '@nestjs/common';
import { generateZeroSchemas } from '@cbnsndwch/zero-nest-mongoose';

@Controller('api/schema')
export class SchemaController {
    @Get('export')
    exportSchema() {
        const schemas = generateZeroSchemas({
            users: UserSchema,
            posts: PostSchema,
            comments: CommentSchema
        });

        return {
            version: 1,
            tables: schemas
        };
    }
}
```

## Examples

### Complete Example

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Zero } from '@rocicorp/zero';
import { generateZeroSchemas } from '@cbnsndwch/zero-nest-mongoose';
import { UserSchema } from './entities/user.entity';
import { PostSchema } from './entities/post.entity';

// Generate schemas
const tables = generateZeroSchemas({
    users: UserSchema,
    posts: PostSchema
});

// Create Zero schema
const schema = createSchema({
    version: 1,
    tables
});

// Initialize Zero client
const zero = new Zero({
    server: 'ws://localhost:4848',
    schema,
    userID: 'user-123'
});

// Query data with Zero
const users = await zero.query.users
    .where('organizationId', '=', 'org-123')
    .run();
```

## Best Practices

1. **Generate Once**: Generate schemas at build time or application startup
2. **Version Control**: Keep generated schemas in version control for review
3. **Type Safety**: Use TypeScript for full type checking
4. **Relationship Validation**: Verify auto-detected relationships match your data model
5. **Testing**: Test generated schemas with sample data

## Troubleshooting

### Schema Not Generated Correctly

```typescript
// Enable debug logging
const schema = generateZeroSchema(UserSchema, 'users', {
    debug: true // Logs schema generation process
});
```

### Relationship Detection Issues

```typescript
// Manually specify relationships
const schema = generateZeroSchema(UserSchema, 'users', {
    relationships: {
        organization: {
            sourceField: ['organizationId'],
            destTable: 'organizations',
            destField: ['id']
        }
    }
});
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

## Contributing

Contributions are welcome! Please see the [main repository](https://github.com/cbnsndwch/zero-sources) for contribution guidelines.

## License

MIT © [cbnsndwch LLC](https://cbnsndwch.io)

## Related Packages

- [@cbnsndwch/zero-contracts](https://www.npmjs.com/package/@cbnsndwch/zero-contracts) - Core contracts and utilities
- [@cbnsndwch/zero-source-mongodb](https://www.npmjs.com/package/@cbnsndwch/zero-source-mongodb) - MongoDB change source
- [@cbnsndwch/zrocket-contracts](https://www.npmjs.com/package/@cbnsndwch/zrocket-contracts) - Example application schemas

## Resources

- [Rocicorp Zero Documentation](https://zero.rocicorp.dev/)
- [NestJS Mongoose](https://docs.nestjs.com/techniques/mongodb)
- [Zero Schema Guide](https://zero.rocicorp.dev/docs/schema)
