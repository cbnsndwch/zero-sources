import assert from 'node:assert';

import { Type } from '@nestjs/common';
import { snakeCase } from 'change-case';
import type { Document } from 'mongoose';

import type { TableSchema, ReadonlyJSONValue, SchemaValue } from '@cbnsndwch/zero';

import type {
    Defined,
    StringColumn,
    StringColumnOptional,
    NumberColumn,
    NumberColumnOptional,
    BooleanColumn,
    BooleanColumnOptional,
    NullColumn,
    NullColumnOptional,
    UnwrapOptional,
    TableSchemaBase
} from './contracts.mjs';

const baseSchema: TableSchemaBase = {
    _id: { type: 'string' },
    __v: { type: 'number', optional: true }
} as const;

type OmitDocumentKeys<TEntity> = keyof Pick<
    TEntity,
    Exclude<keyof TEntity, keyof Document<string>>
>;

type ColSchema<TEntity, TKey extends keyof TEntity> = string extends TEntity[TKey]
    ? UnwrapOptional<TEntity, TKey, StringColumnOptional, StringColumn>
    : number extends TEntity[TKey]
      ? UnwrapOptional<TEntity, TKey, NumberColumnOptional, NumberColumn>
      : boolean extends TEntity[TKey]
        ? UnwrapOptional<TEntity, TKey, BooleanColumnOptional, BooleanColumn>
        : null extends TEntity[TKey]
          ? UnwrapOptional<TEntity, TKey, NullColumnOptional, NullColumn>
          : TEntity[TKey] extends undefined | Array<infer U extends ReadonlyJSONValue>
            ? UnwrapOptional<
                  TEntity,
                  TKey,
                  { type: 'json'; optional: true; customType: U[] },
                  { type: 'json'; customType: U[] }
              >
            : UnwrapOptional<
                  TEntity,
                  TKey,
                  { type: 'json'; optional: true; customType: Defined<TEntity[TKey]> },
                  { type: 'json'; customType: Defined<TEntity[TKey]> }
              >;

type ColumnsFromEntity<TEntity> = {
    [K in OmitDocumentKeys<TEntity>]: ColSchema<TEntity, K>;
} & typeof baseSchema;

export class ZeroTableSchema {
    /**
     * Creates a zero table schema from a given Mongoose entity class.
     *
     * @template TEntity - The type of the entity class. MUST extend `mongoose.Document`.
     * @param target - The entity class to generate the schema from.
     * @returns The generated zero table schema.
     *
     * @throws Will throw an error if the collection name is missing in the entity's `@Schema` decorator.
     */
    static createForClass<TEntity extends Document<string, unknown, TEntity>>(
        target: Type<TEntity>
    ) {
        const { options = {}, properties = [] } =
            MongoTypeMetadataStorage.getSchemaMetadataByTarget<TEntity>(target)!;

        // sanity check
        assert(options.collection, 'Collection name is missing for entity: ' + target.name);

        const columns: Record<string, SchemaValue> = { ...baseSchema };
        for (const prop of properties) {
            // we add these directly
            if (['_id', '__v'].includes(prop.propertyKey)) {
                continue;
            }

            const options = prop.options as any;

            switch (true) {
                case !!options.enum:
                    columns[prop.propertyKey] = {
                        type: 'string',
                        kind: 'enum',
                        optional: isOptionalProp(options)
                    };
                    break;
                case options.type === String:
                    columns[prop.propertyKey] = {
                        type: 'string',
                        optional: isOptionalProp(options)
                    };
                    break;
                case options.type === Number:
                    columns[prop.propertyKey] = columns[prop.propertyKey] = {
                        type: 'number',
                        optional: isOptionalProp(options)
                    };
                    break;
                case options.type === Boolean:
                    columns[prop.propertyKey] = columns[prop.propertyKey] = {
                        type: 'boolean',
                        optional: isOptionalProp(options)
                    };
                    break;
                case options.type === Object:
                case Array.isArray(options.type):
                default:
                    columns[prop.propertyKey] = {
                        type: 'json',
                        optional: isOptionalProp(options)
                    };
                    break;
            }
        }

        const tableSchema = {
            name: options.collection || snakeCase(target.name),
            primaryKey: ['_id'] as const,
            columns: columns as ColumnsFromEntity<TEntity>
        } satisfies TableSchema;

        return tableSchema;
    }
}

function isOptionalProp(options: any) {
    return options?.required !== true;
}
