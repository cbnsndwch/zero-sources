# Instruction

## On Communication Style

- you will avoid being sycophantic or overly formal
- you will not just say "you're absolutely right" or "I completely agree". These blanket statements feel empty to teh user. Instead, offer thoughtful responses that acknowledge the user's input and provide additional insights or suggestions.

## Setting the stage

You and I are creating and maintaining open source TypeScript packages and apps that extend Rocicorp's Zero beyond its original PostgreSQL focus. We are using the following stack:

- **pnpm** (v10+) with workspaces for monorepo management
- **Turborepo** for caching and parallel task execution
- **TypeScript** for type safety
- **Vitest** for testing
- **React Router 7** for the frontend (with SSR support)
- **NestJS** with WebSockets for the backend
- **MongoDB** as our main data store with support for mapped/discriminated union change sources

## Repository Structure

Our monorepo contains:

### Apps (`apps/`)

- **`zrocket`**: Unified chat application (NestJS + React Router 7) showcasing mapped/discriminated union tables
    - Launch app: `cd apps/zrocket && pnpm dev` (runs on port 8011)
    - Launch Zero cache: `cd apps/zrocket && pnpm dev:zero` (runs on port 4848)
    - The app integrates MongoDB change source with mapped/discriminated union support
- **`source-mongodb-server`**: General-purpose MongoDB change source server. We will come back to this app once we've accomplished a working implementation in ZRocket. Ignore for now.

### Libraries (`libs/`)

- **`zero-contracts`**: Common TypeScript contracts and utilities for Zero
- **`zrocket-contracts`**: Zero schemas for ZRocket demo (both direct and mapped)
- **`zero-source-mongodb`**: MongoDB change source implementation with mapped/discriminated union support
- **`zero-nest-mongoose`**: MongoDB integration utilities for NestJS applications
- **`zero-watermark-zqlite`**: Utilities for Zero watermarks with SQLite
- **`zero-watermark-nats-kv`**: NATS KV watermark storage implementation
- **`eslint-config`**: Shared ESLint configuration
- **`tsconfig`**: Shared TypeScript configurations

## Custom Change Sources

We focus on **MongoDB mapped/discriminated union change sources** that allow multiple Zero tables to be derived from single MongoDB collections using filter-based discrimination. This solves the limitation of direct 1:1 mapping between Zero schema tables and upstream data entities.

### Mapped/Discriminated Union Architecture

**Core Concept**: Multiple Zero tables can map to the same upstream MongoDB collection, with documents routed to appropriate tables based on filter criteria and optional field projections.

**Key Components:**

1. **Entity Mapping**: Multiple Zero schema tables → Single MongoDB collection
2. **Filter-Based Routing**: Documents filtered by criteria (e.g., `type`, `status` fields)
3. **Field Projection**: Only relevant fields synced to each Zero table
4. **Real-time Change Routing**: MongoDB change streams route updates to appropriate Zero tables
5. **Single Change Stream**: One change stream per collection, not per Zero table

**Configuration Pattern:**

```typescript
interface UpstreamTableMapping {
    source: string; // MongoDB collection name
    filter?: object; // MongoDB filter query
    projection?: object; // Field projection specification
}
```

**ZRocket Demo Implementation:**

- **Room Tables** (all from `rooms` collection):
    - `chats` → filter `{ t: 'd' }` (direct messages)
    - `channels` → filter `{ t: 'c' }` (public channels)
    - `groups` → filter `{ t: 'p' }` (private groups)
- **Message Tables** (all from `messages` collection):
    - `messages` → filter `{ t: { $exists: false } }` (user messages)
    - `systemMessages` → filter `{ t: { $exists: true } }` (system messages)
- **User Tables** (direct 1:1 mapping):
    - `users` collection → `users` (no discrimination)

**Schema Architecture:**

- Each Zero table uses separate `TableMapping` objects for mapped/discriminated union configuration
- Separate TypeScript interfaces for each table type (IDirectMessagesRoom, IPublicChannelRoom, etc.)
- Single MongoDB collections with discriminator fields (`t` field for rooms and messages)
- Automatic field projection to include only relevant columns per table type

**Frontend Schema Usage:**

- Frontend imports `Schema`
- Query mapped/discriminated tables: `z.query.chats`, `z.query.messages`, etc.
- No direct access to raw MongoDB collections (`rooms`, `messages`)

**Backend Integration:**

- MongoDB change source runs within ZRocket app (unified architecture)
- WebSocket gateway at `/changes/v0/stream` handles Zero cache connections
- Schema served at `/api/zrocket/zero-schema` endpoint
- Real-time change stream routing to appropriate Zero tables

**Future planned integrations:**

- **Stripe**: API-based initial sync with webhook support for real-time updates
- **GoHighLevel**: Webhook-based change source using their comprehensive API ([API Documentation](https://highlevel.stoplight.io/docs/integrations/0443d7d1a4bd0-overview))

### Technical Benefits

1. **Flexibility**: Support complex upstream data structures across multiple source types
2. **Performance**: Reduce data transfer through projections and filtering at source
3. **Security**: Apply data access controls at the change source level
4. **Maintainability**: Keep upstream schemas flexible while providing clean Zero interfaces
5. **Scalability**: Handle large datasets by filtering before streaming to Zero

## Gaining efficiency

In order to move quickly and efficiently, we will use a the list of short commands that I've included below. In popular software apps these are often called "slash commands" because they start with a `/` character immediately followed by a keyword. These commands will help us to quickly generate code, refactor code, and optimize code.

- NestJS entity class validation annotations: when I write the `/validations` slash command, you will edit the entity class to add `class-validator` annotations to the entity class properties
- Generating Zero Schemas: when I write the `/zschema` slash command, you will generate a Zero schema for the entity class. To do so, you will reference the entity class properties and the `class-validator` annotations on the entity's fields, as well as the `@Schema` decorator on the entity class itself, which should contain the name of the collection. You can find documentation for Zero schemas below.

**For mapped/discriminated union tables**, use separate `TableMapping` objects alongside table definitions:

```typescript
// Define the Zero table schema
const chats = table('chats')
    .columns({
        id: string(),
        participantIds: json<string[]>(),
        createdAt: string(),
        lastMessageAt: string().optional()
    })
    .primaryKey('id');

// Define the mapping configuration separately
const mapping: TableMapping<IDirectMessageRoom> = {
    source: 'rooms',
    filter: {
        t: { $eq: 'd' },
        isArchived: { $ne: true }
    },
    projection: {
        _id: 1,
        participantIds: 1,
        createdAt: 1,
        lastMessageAt: 1
    }
};

// Export both as a unified object
export default {
    table,
    mapping
};
```

**Aggregating table mappings in the main schema file:**

```typescript
import chats from './rooms/tables/direct-message-room.schema.js';
import channels from './rooms/tables/public-channel.schema.js';
import userMessages from './messages/tables/user-messages.schema.js';

export const schema = createSchema({
  tables: [
    chats.table,
    channels.table,
    userMessages.table
  ],
  relationships: [...]
});

// Export aggregated mappings for change source
export const mapping = {
  chats: chats.mapping,
  channels: channels.mapping,
  userMessages: userMessages.mapping
} as const;
```

## Zero Schemas

Zero applications have both a _database schema_ (the normal backend database schema that all web apps have) and a _Zero schema_. The two schemas are related, but not the same:

- The Zero schema is usually a subset of the server-side schema. It only needs to includes the tables and columns that the Zero client uses.
- The Zero schema includes _authorization rules_ that control access to the database.
- The Zero schema includes _relationships_ that explicitly define how entities are related to each other.
- In order to support smooth schema migration, the two schemas don’t change in lockstep. Typically the database schema is changed first, then the Zero schema is changed later.

This page describes the core Zero schema which defines the tables, column, and relationships your Zero app can access. For information on permissions, see [Authentication and Permissions](/docs/auth). For information on migration see [Schema Migration](/docs/migrations).

## Defining the Zero Schema

The Zero schema is encoded in a TypeScript file that is conventionally called `schema.ts` file. For example, see [the schema file for`hello-zero`](https://github.com/rocicorp/hello-zero/blob/main/src/schema.ts).

## Building the Zero Schema

The schema is defined in TypeScript for convenience, but what `zero-cache` actually uses is a JSON encoding of it.

During development, start `zero-cache` with the `zero-cache-dev` script. This script watches for changes to `schema.ts` and automatically rebuilds the JSON schema and restarts `zero-cache` when it changes.

For production, you should run the `zero-build-schema` explicitly to generate the JSON file.

## Table Schemas

Use the `table` function to define each table in your Zero schema:

```tsx
import { table, string, boolean } from '@rocicorp/zero';

const user = table('user')
    .columns({
        id: string(),
        name: string(),
        partner: boolean()
    })
    .primaryKey('id');
```

Column types are defined with the `boolean()`, `number()`, `string()`, `json()`, and `enumeration()` helpers. See [Column Types](/docs/postgres-support#column-types) for how database types are mapped to these types.

<Note type="warning">
    Currently, if the database type doesn’t map correctly to the Zero type,
    replication will continue and succeed but the data won't match the TypeScript
    type. This is a bug – in the future, this will be an error. See
    https://bugs.rocicorp.dev/issue/3112.
</Note>

### Name Mapping

Use `from()` to map a TypeScript table or column name to a different database name:

```ts
const userPref = table('userPref')
    // Map TS "userPref" to DB name "user_pref"
    .from('user_pref')
    .columns({
        id: string(),
        // Map TS "orgID" to DB name "org_id"
        orgID: string().from('org_id')
    });
```

### Multiple Schemas

You can also use `from()` to access other Postgres schemas:

```ts
// Sync the "event" table from the "analytics" schema.
const event = table('event').from('analytics.event');
```

### Optional Columns

Columns can be marked _optional_. This corresponds to the SQL concept `nullable`.

```tsx
const user = table('user')
    .columns({
        id: string(),
        name: string(),
        nickName: string().optional()
    })
    .primaryKey('id');
```

An optional column can store a value of the specified type or `null` to mean _no value_.

<Note type="note">
    Note that `null` and `undefined` mean different things when working with Zero rows.
    - When reading, if a column is `optional`, Zero can return `null` for that field. `undefined` is not used at all when Reading from Zero.
    - When writing, you can specify `null` for an optional field to explicitly write `null` to the datastore, unsetting any previous value.
    - For `create` and `upsert` you can set optional fields to `undefined` (or leave the field off completely) to take the default value as specified by backend schema for that column. For `update` you can set any non-PK field to `undefined` to leave the previous value unmodified.
</Note>

### Enumerations

Use the `enumeration` helper to define a column that can only take on a specific set of values. This is most often used alongside an [`enum` Postgres column type](postgres-support#column-types).

```tsx
import { table, string, enumeration } from '@rocicorp/zero';

const user = table('user')
    .columns({
        id: string(),
        name: string(),
        mood: enumeration<'happy' | 'sad' | 'taco'>()
    })
    .primaryKey('id');
```

### Custom JSON Types

Use the `json` helper to define a column that stores a JSON-compatible value:

```tsx
import { table, string, json } from '@rocicorp/zero';

const user = table('user')
    .columns({
        id: string(),
        name: string(),
        settings: json<{ theme: 'light' | 'dark' }>()
    })
    .primaryKey('id');
```

### Compound Primary Keys

Pass multiple columns to `primaryKey` to define a compound primary key:

```ts
const user = table('user')
    .columns({
        orgID: string(),
        userID: string(),
        name: string()
    })
    .primaryKey('orgID', 'userID');
```

## Relationships

Use the `relationships` function to define relationships between tables. Use the `one` and `many` helpers to define singular and plural relationships, respectively:

```ts
const messageRelationships = relationships(message, ({ one, many }) => ({
    sender: one({
        sourceField: ['senderID'],
        destField: ['id'],
        destSchema: user
    }),
    replies: many({
        sourceField: ['id'],
        destSchema: message,
        destField: ['parentMessageID']
    })
}));
```

This creates "sender" and "replies" relationships that can later be queried with the [`related` ZQL clause](./reading-data#relationships):

```ts
const messagesWithSenderAndReplies = z.query.messages
    .related('sender')
    .related('replies');
```

This will return an object for each message row. Each message will have a `sender` field that is a single `User` object or `null`, and a `replies` field that is an array of `Message` objects.

### Many-to-Many Relationships

You can create many-to-many relationships by chaining the relationship definitions. Assuming `issue` and `label` tables, along with an `issueLabel` junction table, you can define a `labels` relationship like this:

```ts
const issueRelationships = relationships(issue, ({ many }) => ({
    labels: many(
        {
            sourceField: ['id'],
            destSchema: issueLabel,
            destField: ['issueID']
        },
        {
            sourceField: ['labelID'],
            destSchema: label,
            destField: ['id']
        }
    )
}));
```

<Note>
  Only two levels of chaining are currently supported for `relationships`.
  See https://bugs.rocicorp.dev/issue/3454.
</Note>

### Compound Keys Relationships

Relationships can traverse compound keys. Imagine a `user` table with a compound primary key of `orgID` and `userID`, and a `message` table with a related `senderOrgID` and `senderUserID`. This can be represented in your schema with:

```ts
const messageRelationships = relationships(message, ({ one }) => ({
    sender: one({
        sourceField: ['senderOrgID', 'senderUserID'],
        destSchema: user,
        destField: ['orgID', 'userID']
    })
}));
```

### Circular Relationships

Circular relationships are fully supported:

```tsx
const commentRelationships = relationships(comment, ({ one }) => ({
    parent: one({
        sourceField: ['parentID'],
        destSchema: comment,
        destField: ['id']
    })
}));
```

## Database Schemas

Use `createSchema` to define the entire Zero schema:

```tsx
import { createSchema } from '@rocicorp/zero';

export const schema = createSchema(
    1, // Schema version. See [Schema Migrations](/docs/migrations) for more info.
    {
        tables: [user, medium, message],
        relationships: [
            userRelationships,
            mediumRelationships,
            messageRelationships
        ]
    }
);
```

## Development Workflow

### ZRocket Development Setup

The ZRocket app demonstrates discriminated union change sources with a unified NestJS + React Router 7 architecture.

**Quick Start:**

1. **Start Zero cache first**: `cd apps/zrocket && pnpm dev:zero`
    - Runs Zero cache on port 4848
    - Uses discriminated schema from `libs/zrocket-contracts`
    - Connects to MongoDB change source via WebSocket
2. **Start the application**: `cd apps/zrocket && pnpm dev`
    - Runs unified app (frontend + backend) on port 8011
    - Includes MongoDB change source integration
    - Serves schema JSON at `/api/zrocket/zero-schema`

**Important Notes:**

- Always start Zero cache (`pnpm dev:zero`) before the main app
- Zero cache must be running for real-time data synchronization
- The app uses discriminated union tables: `chats`, `groups`, `channels` (from `rooms` collection) and `textMessages`, `imageMessages`, `systemMessages` (from `messages` collection)

**Seeding Data:**

- POST to `http://localhost:8011/api/zrocket/seed-data` to create sample users, rooms, and messages
- GET `http://localhost:8011/api/zrocket/tables` to see discriminated union table configurations
