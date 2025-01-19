import type { Type } from '@nestjs/common';

import type { SchemaMetadata } from './features/zero/factories/zero-table-schema/metadata';

type GetSchemaMetadataByTarget = <TEntity>(target: Type<TEntity>) => SchemaMetadata | undefined;

declare global {
    var MongoTypeMetadataStorage: {
        getSchemaMetadataByTarget: GetSchemaMetadataByTarget;
    };
}

declare module 'mongodb' {
    export interface ChangeStreamDocumentCommon {
        _id: {
            _data: string;
        };
    }
}
