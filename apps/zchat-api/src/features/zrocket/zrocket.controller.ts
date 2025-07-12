import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { discriminatedSchema } from '@zero-sources/zchat-contracts';

// Helper function to extract discriminated union configurations from schema
function extractTableConfigurations() {
    const configurations: Record<string, any[]> = {};
    
    // Get all tables from the schema
    const tables = discriminatedSchema.tables;
    
    // Group tables by their source collection
    const sourceGroups: Record<string, any[]> = {};
    
    for (const table of tables) {
        const tableName = (table as any).name;
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
                        description: getTableDescription(tableName, config.filter)
                    });
                }
            } catch (e) {
                // Ignore non-JSON from configs (traditional tables)
            }
        }
    }
    
    // Map source collections to readable names
    const sourceNames: Record<string, string> = {
        'rooms': 'fromRoomsCollection',
        'messages': 'fromMessagesCollection',
        'participants': 'fromParticipantsCollection'
    };
    
    for (const [source, tables] of Object.entries(sourceGroups)) {
        const readableName = sourceNames[source] || `from${source.charAt(0).toUpperCase() + source.slice(1)}Collection`;
        configurations[readableName] = tables;
    }
    
    return configurations;
}

function getTableDescription(tableName: string, filter: any): string {
    const descriptions: Record<string, string> = {
        'chats': 'Direct message rooms',
        'groups': 'Private group rooms',
        'channels': 'Public channel rooms',
        'textMessages': 'Text-based messages',
        'imageMessages': 'Image messages with metadata',
        'systemMessages': 'System-generated messages for events',
        'userParticipants': 'Human user participants',
        'botParticipants': 'Bot participants with configuration'
    };
    
    return descriptions[tableName] || `Table filtered by ${JSON.stringify(filter)}`;
}

// This controller demonstrates the discriminated union functionality
@ApiTags('ZRocket Demo')
@Controller('zrocket')
export class ZRocketController {
    
    @Get('demo-info')
    @ApiOperation({ 
        summary: 'Get information about the ZRocket discriminated union demo',
        description: 'Returns information about how the discriminated union tables work'
    })
    @ApiResponse({ status: 200, description: 'Demo information' })
    getDemoInfo() {
        const tableConfigurations = extractTableConfigurations();
        const totalTables = Object.values(tableConfigurations).reduce((sum, tables) => sum + tables.length, 0);
        
        return {
            title: 'ZRocket - Discriminated Union Demo',
            description: 'This demo shows how multiple Zero tables can be created from single MongoDB collections using discriminated unions',
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
                generatedAt: new Date().toISOString()
            }
        };
    }

    @Post('seed-data')
    @ApiOperation({
        summary: 'Seed sample data for the discriminated union demo',
        description: 'Creates sample rooms, messages, participants, and users in MongoDB to demonstrate the discriminated union functionality. Optionally accepts custom seed data in the request body.'
    })
    @ApiResponse({ status: 201, description: 'Sample data seeded successfully' })
    async seedSampleData(@Body() customData?: any) {
        // Import and run the seeder
        const { seedZRocketData } = await import('../zrocket-seeder.js');
        
        try {
            // Pass custom data if provided, otherwise use default data
            await seedZRocketData(undefined, customData);
            return {
                success: true,
                message: customData ? 'Custom data seeded successfully' : 'Sample data seeded successfully',
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
        description: 'Returns information about all Zero tables created from discriminated unions'
    })
    @ApiResponse({ status: 200, description: 'Zero tables information' })
    getZeroTables() {
        const tableConfigurations = extractTableConfigurations();
        const discriminatedTables: Record<string, string[]> = {};
        const traditionalTables: string[] = [];
        
        // Extract discriminated tables by source
        for (const [sourceName, tables] of Object.entries(tableConfigurations)) {
            const sourceKey = sourceName.replace('from', '').replace('Collection', '').toLowerCase();
            discriminatedTables[sourceKey] = tables.map(t => t.name);
        }
        
        // Get traditional tables (non-discriminated)
        const allTableNames = discriminatedSchema.tables.map(table => (table as any).name);
        const discriminatedTableNames = new Set(Object.values(discriminatedTables).flat());
        
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
            description: 'These tables are automatically created and synced based on discriminated union configurations',
            metadata: {
                discriminatedCount: Object.values(discriminatedTables).reduce((sum, tables) => sum + tables.length, 0),
                traditionalCount: traditionalTables.length,
                generatedAt: new Date().toISOString()
            }
        };
    }
}