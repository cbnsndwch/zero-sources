import type {
    CustomMutatorDefs,
    CustomMutatorImpl,
    Schema as SchemaType
} from '@rocicorp/zero';

/**
 * Extracts the keys of custom mutators from a mutator definition object (`MD`).
 *
 * Analyzes a `CustomMutatorDefs` object (`MD`) associated with a `Schema` (`S`)
 * and produces a union type containing the string keys representing all defined
 * custom mutators:
 *
 * - For top-level keys, the key itself
 * - For keys nested within a namespace, the compound key in the format `"namespace|mutatorKey"`.
 *
 * @template Schema - The schema type that the mutators operate on. Expected to extend `Schema`.
 * @template Mutators - The custom mutator definitions object.
 * @returns A union type of strings representing all available mutator keys, with nested mutators represented as `"namespace|mutatorKey"`.
 *
 * @example
 * ```typescript
 *
 * const mySchema = {
 *     tables: {
 *         user: {} as TableSchema,
 *         emoji: {} as TableSchema
 *     }
 * };
 *
 * type MySchema = typeof exampleSchema;
 *
 * const myMutators = {
 *     issue: {
 *         async create(tx, args: CreateIssueArgs) {
 *             // mutate
 *         },
 *         async addLabel(tx, args: AddIssueLabelArgs) {
 *             // mutate
 *         }
 *     },
 *
 *     emoji: {
 *         async addToIssue(tx, args: AddEmojiArgs) {
 *             // mutate
 *         },
 *         async addToComment(tx, args: AddEmojiArgs) {
 *             // mutate
 *         },
 *         async remove(tx, id: string) {
 *             // mutate
 *         }
 *     },
 *
 *     async setUserPreferences(tx, args: unknown) {
 *         // mutate
 *     }
 * } as const satisfies CustomMutatorDefs<MySchema>;
 *
 * type MyMutatorKeys = MutatorKeysForSchema<MySchema, typeof myMutators>;
 * // ^ type MyMutatorKeys =
 * //     | 'setUserPreferences'
 * //     | 'issue|create'
 * //     | 'issue|addLabel'
 * //     | 'emoji|addToIssue'
 * //     | 'emoji|addToComment'
 * //     | 'emoji|remove'
 *
 * ```
 */
export type MutatorKeysForSchema<
    Schema extends SchemaType,
    Mutators extends CustomMutatorDefs
> = {
    readonly [K in keyof Mutators]: Mutators[K] extends CustomMutatorImpl<Schema>
        ? K & string
        : keyof Mutators[K] extends string
          ? `${K & string}|${keyof Mutators[K] & string}`
          : never;
}[keyof Mutators];

export type ServerMutatorContext = unknown;

/**
 * Represents a server-side mutator function implementation.
 *
 * @template TContext - The type of the context object expected by the mutator.
 * @template TArgs - The type of the arguments expected by the mutator. Defaults to `any`.
 *
 * @param context - The context in which the mutator is executed.
 * @param args - The arguments required by the mutator.
 * @returns A promise that resolves when the mutation is complete.
 */
export type ServerMutatorImpl<
    TContext extends ServerMutatorContext,
    TArgs = any
> = {
    (context: TContext, args: TArgs): Promise<void>;
};

/**
 * A mapping of server mutator definitions, organized by namespace or key.
 *
 * Each entry can be either:
 * - A single `ServerMutatorImpl<TContext>` instance, or
 * - An object mapping string keys to `ServerMutatorImpl<TContext>` instances.
 *
 * @template TContext - The context type that each mutator implementation will receive.
 */
export type ServerMutatorDefs<TContext extends ServerMutatorContext> = {
    [namespaceOrKey: string]:
        | ServerMutatorImpl<TContext>
        | { [key: string]: ServerMutatorImpl<TContext> };
};

export type ExtractMutatorKeys<
    TContext extends ServerMutatorContext,
    Mutators extends ServerMutatorDefs<TContext>
> = {
    readonly [K in keyof Mutators]: Mutators[K] extends ServerMutatorImpl<TContext>
        ? K & string
        : keyof Mutators[K] extends string
          ? `${K & string}|${keyof Mutators[K] & string}`
          : never;
}[keyof Mutators];
