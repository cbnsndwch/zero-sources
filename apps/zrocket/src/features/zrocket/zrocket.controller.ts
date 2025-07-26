import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { discriminatedSchema } from '@cbnsndwch/zrocket-contracts';

import { MetadataService } from './metadata.service.js';

// Helper function to extract discriminated union configurations from schema
function extractTableConfigurations() {
    const configurations: Record<string, any[]> = {};

    // Get all tables from the schema
    const tables = discriminatedSchema.tables;

    // Group tables by their source collection
    const sourceGroups: Record<string, any[]> = {};

    for (const table of Object.values(tables)) {
        const tableName = table.name;
        const fromConfig = (table as any).from;

        if (fromConfig && typeof fromConfig === 'string') {
            try {
                const config = JSON.parse(fromConfig);
                if (config.source && config.filter) {
                    if (!sourceGroups[config.source]) {
                        sourceGroups[config.source] = [];
                    }
                    sourceGroups[config.source].push({
                        name: tableName,
                        filter: config.filter,
                        description: getTableDescription(
                            tableName,
                            config.filter
                        )
                    });
                }
            } catch {
                // Ignore non-JSON from configs (traditional tables)
            }
        }
    }

    // Map source collections to readable names
    const sourceNames: Record<string, string> = {
        rooms: 'fromRoomsCollection',
        messages: 'fromMessagesCollection',
        participants: 'fromParticipantsCollection'
    };

    for (const [source, tables] of Object.entries(sourceGroups)) {
        const readableName =
            sourceNames[source] ||
            `from${source.charAt(0).toUpperCase() + source.slice(1)}Collection`;
        configurations[readableName] = tables;
    }

    return configurations;
}

function getTableDescription(tableName: string, filter: any): string {
    const descriptions: Record<string, string> = {
        chats: 'Direct message rooms',
        groups: 'Private group rooms',
        channels: 'Public channel rooms',
        textMessages: 'Text-based messages',
        imageMessages: 'Image messages with metadata',
        systemMessages: 'System-generated messages for events',
        userParticipants: 'Human user participants',
        botParticipants: 'Bot participants with configuration'
    };

    return (
        descriptions[tableName] || `Table filtered by ${JSON.stringify(filter)}`
    );
}

// This controller demonstrates the discriminated union functionality
@ApiTags('ZRocket Demo')
@Controller('zrocket')
export class ZRocketController {
    #metadataService: MetadataService;

    constructor(metadataService: MetadataService) {
        this.#metadataService = metadataService;
    }

    @Get('demo-info')
    @ApiOperation({
        summary: 'Get information about the ZRocket discriminated union demo',
        description:
            'Returns information about how the discriminated union tables work, sourced from MongoDB metadata'
    })
    @ApiResponse({ status: 200, description: 'Demo information' })
    async getDemoInfo() {
        try {
            // Try to get metadata from MongoDB first, fallback to schema extraction
            const metadata = await this.#metadataService.getSchemaMetadata();

            const totalTables = Object.values(
                metadata.tableConfigurations
            ).reduce((sum, tables) => sum + tables.length, 0);

            return {
                title: 'ZRocket - Discriminated Union Demo',
                description:
                    'This demo shows how multiple Zero tables can be created from single MongoDB collections using discriminated unions',
                tables: metadata.tableConfigurations,
                features: [
                    'Real-time filtering: Documents are routed to appropriate Zero tables based on filter criteria',
                    'Projection support: Only relevant fields are synced to each table',
                    'Update routing: When documents change, they may be inserted/removed from tables based on new filter matches',
                    'Efficient change streams: Single MongoDB change stream watches all source collections',
                    'Dynamic metadata: Schema and configuration stored in MongoDB collections'
                ],
                endpoints: [
                    'GET /zrocket/demo-info - This information',
                    'POST /zrocket/seed-data - Seeds sample data for testing',
                    'GET /zrocket/tables - List all discriminated Zero tables',
                    'GET /zrocket/metadata/schemas - List all stored schema metadata',
                    'POST /zrocket/metadata/schema - Update schema metadata'
                ],
                metadata: {
                    totalTables,
                    sourceCollections: Object.keys(metadata.tableConfigurations)
                        .length,
                    generatedAt: new Date().toISOString(),
                    source: 'mongodb',
                    schemaVersion: metadata.version,
                    lastUpdated: metadata.lastUpdated
                }
            };
        } catch (error) {
            // Fallback to original static method if metadata service fails
            const tableConfigurations = extractTableConfigurations();
            const totalTables = Object.values(tableConfigurations).reduce(
                (sum, tables) => sum + tables.length,
                0
            );

            return {
                title: 'ZRocket - Discriminated Union Demo',
                description:
                    'This demo shows how multiple Zero tables can be created from single MongoDB collections using discriminated unions',
                tables: tableConfigurations,
                features: [
                    'Real-time filtering: Documents are routed to appropriate Zero tables based on filter criteria',
                    'Projection support: Only relevant fields are synced to each table',
                    'Update routing: When documents change, they may be inserted/removed from tables based on new filter matches',
                    'Efficient change streams: Single MongoDB change stream watches all source collections'
                ],
                endpoints: [
                    'GET /zrocket/demo-info - This information',
                    'POST /zrocket/seed-data - Seeds sample data for testing',
                    'GET /zrocket/tables - List all discriminated Zero tables'
                ],
                metadata: {
                    totalTables,
                    sourceCollections: Object.keys(tableConfigurations).length,
                    generatedAt: new Date().toISOString(),
                    source: 'fallback',
                    error:
                        error instanceof Error ? error.message : 'Unknown error'
                }
            };
        }
    }

    @Post('seed-data')
    @ApiOperation({
        summary: 'Seed sample data for the discriminated union demo',
        description:
            'Creates sample rooms, messages, participants, and users in MongoDB to demonstrate the discriminated union functionality. Optionally accepts custom seed data in the request body.'
    })
    @ApiResponse({
        status: 201,
        description: 'Sample data seeded successfully'
    })
    async seedSampleData(@Body() customData?: any) {
        // Import and run the seeder
        const { seedZRocketData } = await import('../seeder.js');

        try {
            // Pass custom data if provided, otherwise use default data
            await seedZRocketData(undefined, customData);
            return {
                success: true,
                message: customData
                    ? 'Custom data seeded successfully'
                    : 'Sample data seeded successfully',
                timestamp: new Date().toISOString(),
                dataSource: customData ? 'custom' : 'default'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to seed sample data',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            };
        }
    }

    @Get('tables')
    @ApiOperation({
        summary: 'List all discriminated Zero tables',
        description:
            'Returns information about all Zero tables created from discriminated unions'
    })
    @ApiResponse({ status: 200, description: 'Zero tables information' })
    getZeroTables() {
        const tableConfigurations = extractTableConfigurations();
        const discriminatedTables: Record<string, string[]> = {};
        const traditionalTables: string[] = [];

        // Extract discriminated tables by source
        for (const [sourceName, tables] of Object.entries(
            tableConfigurations
        )) {
            const sourceKey = sourceName
                .replace('from', '')
                .replace('Collection', '')
                .toLowerCase();
            discriminatedTables[sourceKey] = tables.map(t => t.name);
        }

        // Get traditional tables (non-discriminated)
        const allTableNames = Object.values(discriminatedSchema.tables).map(
            table => table.name
        );
        const discriminatedTableNames = new Set(
            Object.values(discriminatedTables).flat()
        );

        for (const tableName of allTableNames) {
            if (!discriminatedTableNames.has(tableName)) {
                traditionalTables.push(tableName);
            }
        }

        const totalTables = allTableNames.length;

        return {
            discriminatedTables,
            traditionalTables,
            totalTables,
            description:
                'These tables are automatically created and synced based on discriminated union configurations',
            metadata: {
                discriminatedCount: Object.values(discriminatedTables).reduce(
                    (sum, tables) => sum + tables.length,
                    0
                ),
                traditionalCount: traditionalTables.length,
                generatedAt: new Date().toISOString()
            }
        };
    }

    @Get('metadata/schemas')
    @ApiOperation({
        summary: 'List all stored schema metadata',
        description:
            'Returns all schema versions stored in MongoDB metadata collections'
    })
    @ApiResponse({ status: 200, description: 'Schema metadata list' })
    async getSchemaMetadata() {
        try {
            const schemas = await this.#metadataService.listAllSchemas();
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

    @Post('metadata/schema')
    @ApiOperation({
        summary: 'Update schema metadata',
        description: 'Updates the schema metadata stored in MongoDB'
    })
    @ApiResponse({ status: 200, description: 'Schema metadata updated' })
    async updateSchemaMetadata(@Body() metadata: any) {
        try {
            await this.#metadataService.saveSchemaMetadata(metadata);
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

    @Get('metadata/interests')
    @ApiOperation({
        summary: 'List all client interests',
        description:
            'Returns all client interest configurations stored in MongoDB'
    })
    @ApiResponse({ status: 200, description: 'Client interests list' })
    async getClientInterests() {
        try {
            const interests = await this.#metadataService.listAllInterests();
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
}
