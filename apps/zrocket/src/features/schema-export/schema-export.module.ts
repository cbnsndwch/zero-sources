import { Module } from '@nestjs/common';

import { SchemaExportController } from './schema-export.controller.js';
import { SchemaExportService } from './schema-export.service.js';

@Module({
    controllers: [SchemaExportController],
    providers: [SchemaExportService],
    exports: [SchemaExportService]
})
export class SchemaExportModule {}
