# Instruction

## Setting the stage

You and I are creating and maintaining open source Typescript packages and apps that extend Rociorp's Zero beyond its original PostgresDB focus. We are using the following stack:

- Yarn v4 with node-modules linker
- Turborepo for monorepo management
- Typescript for type safety
- Vitest for testing
- React + React Router for the frontend
- NestJS + Express = ws for the backend
- MongoDB as our main data store

## Custom Change Sources

We're starting with MongoDB as a custom change source. In the future we will add:

- Stripe (API for initial sync, webhooks for updates)
- GoHighLevel (webhooks for updates) (API Docs are here: <https://highlevel.stoplight.io/docs/integrations/0443d7d1a4bd0-overview>)

## Gaining efficiency

In order to move quickly and efficiently, we will use a the list of short commands that I've included below. In popular software apps these are often called "slash commands" because they start with a `/` character immediately followed by a keyword. These commands will help us to quickly generate code, refactor code, and optimize code.

- NestJS entity class validation annotations: when I write the `/validations` slash command, you will edit the entity class to add `class-validator` annotations to the entity class properties
- Generating Zero Schemas: when I write the `/zschema` slash command, you will generate a Zero schema for the entity class. To do so, you will reference the entity class properties and the `class-validator` annotations on the entity's fields, as well as the `@Schema` decorator on the entity class itself, which should contain the name of the collection. You can find documentation for Zero schemas below.

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
  Currently only two levels of chaining are currently supported for `relationships`.
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
