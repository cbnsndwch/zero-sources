import type { Type } from '@nestjs/common';
import type { SchemaDefinitionProperty, SchemaType, SchemaOptions } from 'mongoose';

/**
 * Interface defining property options that can be passed to `@Prop()` decorator.
 */
type PropOptions<T = any> = Partial<SchemaDefinitionProperty<T>>;

// not support for explicit SchemaTypes for now
// export type PropOptions<T = any> = Partial<SchemaDefinitionProperty<T>> | SchemaType;

interface PropertyMetadata<T = any> {
    target: Function;
    propertyKey: string;
    options: PropOptions<T>;
}

interface SchemaMetadata {
    target: Function;
    options?: SchemaOptions;
    properties?: PropertyMetadata[];
}

type GetSchemaMetadataByTarget = <TEntity>(target: Type<TEntity>) => SchemaMetadata | undefined;

declare global {
    var MongoTypeMetadataStorage: {
        getSchemaMetadataByTarget: GetSchemaMetadataByTarget;
    };
}
