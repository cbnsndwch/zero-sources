import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { SchemaExportService } from './schema-export.service.js';

@ApiTags('Schema Export')
@Controller('schema')
export class SchemaExportController {
    constructor(private readonly schemaExportService: SchemaExportService) {}

    @Get('export')
    @ApiOperation({
        summary: 'Export Zero schema for source server',
        description:
            'Returns the complete Zero schema in a format that can be consumed by the MongoDB source server'
    })
    @ApiResponse({ status: 200, description: 'Schema export' })
    @Header('Content-Type', 'application/json')
    getSchemaExport() {
        return this.schemaExportService.exportSchema();
    }

    @Get('table-mappings')
    @ApiOperation({
        summary: 'Export table mappings for source server',
        description:
            'Returns the MongoDB collection to Zero table mappings for the source server'
    })
    @ApiResponse({ status: 200, description: 'Table mappings export' })
    @Header('Content-Type', 'application/json')
    getTableMappings() {
        return this.schemaExportService.exportTableMappings();
    }

    @Get('combined')
    @ApiOperation({
        summary: 'Export combined schema and table mappings',
        description:
            'Returns both schema and table mappings in a single response'
    })
    @ApiResponse({ status: 200, description: 'Combined schema and mappings' })
    @Header('Content-Type', 'application/json')
    getCombinedConfig() {
        return this.schemaExportService.exportCombinedConfig();
    }

    @Get('source-server-config')
    @ApiOperation({
        summary: 'Generate source server configuration',
        description:
            'Returns configuration files and settings for the MongoDB source server'
    })
    @ApiResponse({ status: 200, description: 'Source server configuration' })
    @Header('Content-Type', 'application/json')
    getSourceServerConfig() {
        return this.schemaExportService.generateSourceServerConfig();
    }
}
