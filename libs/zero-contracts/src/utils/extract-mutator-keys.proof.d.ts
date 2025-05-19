import type { CustomMutatorImpl, Schema, TableSchema } from '@rocicorp/zero';

import type { MutatorKeysForSchema } from './extract-mutator-keys.js';

type RelationshipsSchema = Schema['relationships'][string];

declare const exampleSchema: {
    readonly tables: {
        readonly user: TableSchema;
    };

    readonly relationships: {
        readonly [table: string]: RelationshipsSchema;
    };
};

type ExampleSchema = typeof exampleSchema;

declare const mutators: {
    user: {
        foo: CustomMutatorImpl<ExampleSchema>;
        bar: CustomMutatorImpl<ExampleSchema>;
    };
    reset: CustomMutatorImpl<ExampleSchema>;
};

type Mutators = typeof mutators;

type MutatorKeys = MutatorKeysForSchema<ExampleSchema, Mutators>;
