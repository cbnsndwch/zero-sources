/* eslint-disable @typescript-eslint/no-empty-object-type */
import {
    Schema,
    type Model,
    type DefaultSchemaOptions,
    type ApplySchemaOptions,
    type ObtainDocumentType,
    type ResolveSchemaOptions,
    type HydratedDocument,
    type FlatRecord,
    SchemaDefinition
} from 'mongoose';

export function replacer(this: any, key: string, value: any) {
    if (value instanceof RegExp) {
        return '__REGEXP ' + value.toString();
    } else if (typeof value === 'function') {
        if (key === 'validator') {
            return value.toString();
        }
        return value.name;
    }
    return value;
}

export function reviver(this: any, key: string, value: any) {
    if (Object.prototype.hasOwnProperty.call(globalThis, value)) {
        return (globalThis as any)[value];
    } else if (value === 'Mixed') {
        return Schema.Types.Mixed;
    } else if (value === 'ObjectId') {
        return Schema.Types.ObjectId;
    } else if (key === 'validator') {
        return new Function('return( ' + value + ' );')();
    }
    if (
        value &&
        value.toString &&
        value.toString().indexOf('__REGEXP ') === 0
    ) {
        const m = value.split('__REGEXP ')[1].match(/\/(.*)\/(.*)?/);
        return new RegExp(m[1], m[2] || '');
    }
    return value;
}

export function serializeSchema(
    schema: SchemaDefinition,
    space?: string | number
) {
    const cache = new Set();

    const json = JSON.stringify(
        schema,
        (key: string, value: any) => {
            if (value instanceof RegExp) {
                return '__REGEXP ' + value.toString();
            }

            if (typeof value === 'function') {
                if (key === 'validator') {
                    return value.toString();
                }
                return value.name;
            }

            if (typeof value === 'object' && value !== null) {
                // Duplicate reference found, discard key
                if (cache.has(value)) {
                    return;
                }

                // Store value in our collection
                cache.add(value);
            }

            return value;
        },
        space
    );

    // cleanup
    cache.clear();

    return json;
}

export function deserializeSchema<
    RawDocType = any,
    TModelType = Model<RawDocType, any, any, any>,
    TInstanceMethods = {},
    TQueryHelpers = {},
    TVirtuals = {},
    TStaticMethods = {},
    TSchemaOptions = DefaultSchemaOptions,
    DocType extends ApplySchemaOptions<
        ObtainDocumentType<
            DocType,
            RawDocType,
            ResolveSchemaOptions<TSchemaOptions>
        >,
        ResolveSchemaOptions<TSchemaOptions>
    > = ApplySchemaOptions<
        ObtainDocumentType<
            any,
            RawDocType,
            ResolveSchemaOptions<TSchemaOptions>
        >,
        ResolveSchemaOptions<TSchemaOptions>
    >,
    THydratedDocumentType = HydratedDocument<
        FlatRecord<DocType>,
        TVirtuals & TInstanceMethods
    >
>(
    json: string
): Schema<
    RawDocType,
    TModelType,
    TInstanceMethods,
    TQueryHelpers,
    TVirtuals,
    TStaticMethods,
    TSchemaOptions,
    DocType,
    THydratedDocumentType
> {
    return JSON.parse(json, reviver);
}
