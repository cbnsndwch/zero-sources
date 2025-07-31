import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { MetadataService } from './metadata.service.js';
import { SchemaLoaderService } from '../schema/schema-loader.service.js';

@ApiTags('Schema Metadata')
@Controller('metadata')
export class MetadataController {
    constructor(
        private readonly metadataService: MetadataService,
        private readonly schemaLoader: SchemaLoaderService
    ) {}

    @Get('info')
    @ApiOperation({
        summary: 'Get general information about the change source server',
        description: 'Returns information about the loaded schema, table configurations, and discriminated unions'
    })
    @ApiResponse({ status: 200, description: 'Change source information' })
    async getInfo() {
        try {
            const metadata = await this.metadataService.getSchemaMetadata();
            const tablesInfo = await this.metadataService.getDiscriminatedTablesInfo();

            return {
                title: 'Zero Change Source Server',
                description: 'MongoDB change source with configurable schema and discriminated union support',
                schema: {
                    version: metadata.version,
                    source: metadata.source,
                    lastUpdated: metadata.lastUpdated
                },
                tables: metadata.tableConfigurations,
                discriminatedTables: tablesInfo.discriminatedTables,
                traditionalTables: tablesInfo.traditionalTables,
                features: [
                    'Real-time MongoDB change streams',
                    'Configurable schema loading (file/URL/inline)',
                    'Discriminated union table routing',
                    'WebSocket-based Zero protocol',
                    'Schema metadata caching'
                ],
                endpoints: [
                    'GET /metadata/info - This information',
                    'GET /metadata/tables - List all table configurations',
                    'GET /metadata/schemas - List stored schema metadata',
                    'POST /metadata/schema - Update schema metadata',
                    'GET /metadata/interests - List client interests',
                    'GET /health - Health check endpoint',
                    'WS /changes/v0/stream - Zero change stream'
                ],
                statistics: {
                    totalTables: tablesInfo.totalTables,
                    discriminatedCount: tablesInfo.metadata.discriminatedCount,
                    traditionalCount: tablesInfo.metadata.traditionalCount,
                    generatedAt: new Date().toISOString()
                }
            };
        } catch (error) {
            return {
                title: 'Zero Change Source Server',
                description: 'MongoDB change source server (schema loading failed)',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            };
        }
    }

    @Get('tables')
    @ApiOperation({
        summary: 'List all table configurations',
        description: 'Returns detailed information about all tables, both discriminated and traditional'
    })
    @ApiResponse({ status: 200, description: 'Table configurations' })
    async getTables() {
        try {
            const tablesInfo = await this.metadataService.getDiscriminatedTablesInfo();
            const tableConfigurations = await this.metadataService.getTableConfigurations();

            return {
                discriminatedTables: tablesInfo.discriminatedTables,
                traditionalTables: tablesInfo.traditionalTables,
                tableConfigurations,
                totalTables: tablesInfo.totalTables,
                description: 'Tables managed by this change source server',
                metadata: tablesInfo.metadata
            };
        } catch (error) {
            return {
                discriminatedTables: {},
                traditionalTables: [],
                totalTables: 0,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            };
        }
    }

    @Get('schemas')
    @ApiOperation({
        summary: 'List all stored schema metadata',
        description: 'Returns all schema versions stored in the metadata collections'
    })
    @ApiResponse({ status: 200, description: 'Schema metadata list' })
    async getSchemas() {
        try {
            const schemas = await this.metadataService.listAllSchemas();
            return {
                schemas,
                count: schemas.length,
                retrievedAt: new Date().toISOString()
            };
        } catch (error) {
            return {
                schemas: [],
                count: 0,
                error: error instanceof Error ? error.message : 'Unknown error',
                retrievedAt: new Date().toISOString()
            };
        }
    }

    @Post('schema')
    @ApiOperation({
        summary: 'Update schema metadata',
        description: 'Updates the schema metadata stored in MongoDB'
    })
    @ApiResponse({ status: 200, description: 'Schema metadata updated' })
    async updateSchema(@Body() metadata: any) {
        try {
            await this.metadataService.saveSchemaMetadata(metadata);
            return {
                success: true,
                message: 'Schema metadata updated successfully',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to update schema metadata',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            };
        }
    }

    @Get('interests')
    @ApiOperation({
        summary: 'List all client interests',
        description: 'Returns all client interest configurations stored in MongoDB'
    })
    @ApiResponse({ status: 200, description: 'Client interests list' })
    async getInterests() {
        try {
            const interests = await this.metadataService.listAllInterests();
            return {
                interests,
                count: interests.length,
                retrievedAt: new Date().toISOString()
            };
        } catch (error) {
            return {
                interests: [],
                count: 0,
                error: error instanceof Error ? error.message : 'Unknown error',
                retrievedAt: new Date().toISOString()
            };
        }
    }

    @Post('schema/reload')
    @ApiOperation({
        summary: 'Reload schema from source',
        description: 'Forces a reload of the schema from the configured source (file/URL/inline)'
    })
    @ApiResponse({ status: 200, description: 'Schema reloaded successfully' })
    async reloadSchema() {
        try {
            // Clear the cache to force reload
            this.schemaLoader.clearCache();
            
            // Load fresh schema
            const loadedSchema = await this.schemaLoader.loadSchema();
            
            return {
                success: true,
                message: 'Schema reloaded successfully',
                schema: {
                    version: loadedSchema.metadata.version,
                    source: loadedSchema.metadata.source,
                    loadedAt: loadedSchema.metadata.loadedAt,
                    tableCount: loadedSchema.tables.length
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to reload schema',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            };
        }
    }
}
