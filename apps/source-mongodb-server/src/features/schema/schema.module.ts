import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SchemaLoaderService } from './schema-loader.service.js';

@Module({})
export class SchemaModule {
    static forRoot(): DynamicModule {
        return {
            module: SchemaModule,
            imports: [ConfigModule],
            providers: [SchemaLoaderService],
            exports: [SchemaLoaderService],
            global: true
        };
    }
}
