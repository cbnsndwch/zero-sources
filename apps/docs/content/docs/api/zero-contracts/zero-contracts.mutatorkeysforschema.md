---
title: 'MutatorKeysForSchema type'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-contracts](./zero-contracts.md) &gt; [MutatorKeysForSchema](./zero-contracts.mutatorkeysforschema.md)

## MutatorKeysForSchema type

Extracts the keys of custom mutators from a mutator definition object (`MD`<!-- -->).

Analyzes a `CustomMutatorDefs` object (`MD`<!-- -->) associated with a `Schema` (`S`<!-- -->) and produces a union type containing the string keys representing all defined custom mutators:

- For top-level keys, the key itself - For keys nested within a namespace, teh compound key in the format `"namespace|mutatorKey"`<!-- -->.

Schema - The schema type that the mutators operate on. Expected to extend `Schema`<!-- -->. Mutators - The custom mutator definitions object.

**Signature:**

```typescript
type MutatorKeysForSchema<
    Schema extends Schema,
    Mutators extends CustomMutatorDefs
> = {
    readonly [K in keyof Mutators]: Mutators[K] extends CustomMutatorImpl<Schema>
        ? K & string
        : keyof Mutators[K] extends string
          ? `${K & string}|${keyof Mutators[K] & string}`
          : never;
}[keyof Mutators];
```

## Example

```typescript
const mySchema = {
    tables: {
        user: {} as TableSchema,
        emoji: {} as TableSchema
    }
};

type MySchema = typeof exampleSchema;

const myMutators = {
    issue: {
        async create(tx, args: CreateIssueArgs) {
            // mutate
        },
        async addLabel(tx, args: AddIssueLabelArgs) {
            // mutate
        }
    },

    emoji: {
        async addToIssue(tx, args: AddEmojiArgs) {
            // mutate
        },
        async addToComment(tx, args: AddEmojiArgs) {
            // mutate
        },
        async remove(tx, id: string) {
            // mutate
        }
    },

    async setUserPreferences(tx, args: unknown) {
        // mutate
    }
} as const satisfies CustomMutatorDefs<MySchema>;

type MyMutatorKeys = MutatorKeysForSchema<MySchema, typeof myMutators>;
// ^ type MyMutatorKeys =
//     | 'setUserPreferences'
//     | 'issue|create'
//     | 'issue|addLabel'
//     | 'emoji|addToIssue'
//     | 'emoji|addToComment'
//     | 'emoji|remove'
```
