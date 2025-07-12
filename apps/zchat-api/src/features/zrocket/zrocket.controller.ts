import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

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
        return {
            title: 'ZRocket - Discriminated Union Demo',
            description: 'This demo shows how multiple Zero tables can be created from single MongoDB collections using discriminated unions',
            tables: {
                fromRoomsCollection: [
                    {
                        name: 'chats',
                        filter: { t: 'd', archived: { $ne: true } },
                        description: 'Direct message rooms'
                    },
                    {
                        name: 'groups', 
                        filter: { t: 'p', archived: { $ne: true } },
                        description: 'Private group rooms'
                    },
                    {
                        name: 'channels',
                        filter: { t: 'c', archived: { $ne: true } },
                        description: 'Public channel rooms'
                    }
                ],
                fromMessagesCollection: [
                    {
                        name: 'textMessages',
                        filter: { t: 'text', hidden: { $ne: true } },
                        description: 'Text-based messages'
                    },
                    {
                        name: 'imageMessages',
                        filter: { t: 'image', hidden: { $ne: true } },
                        description: 'Image messages with metadata'
                    },
                    {
                        name: 'systemMessages',
                        filter: { t: 'system' },
                        description: 'System-generated messages for events'
                    }
                ],
                fromParticipantsCollection: [
                    {
                        name: 'userParticipants',
                        filter: { type: 'user' },
                        description: 'Human user participants'
                    },
                    {
                        name: 'botParticipants',
                        filter: { type: 'bot' },
                        description: 'Bot participants with configuration'
                    }
                ]
            },
            features: [
                'Real-time filtering: Documents are routed to appropriate Zero tables based on filter criteria',
                'Projection support: Only relevant fields are synced to each table',
                'Update routing: When documents change, they may be inserted/removed from tables based on new filter matches',
                'Efficient change streams: Single MongoDB change stream watches all source collections'
            ],
            endpoints: [
                'GET /zrocket/demo-info - This information',
                'POST /zrocket/seed-data - Seeds sample data for testing',
                'GET /zrocket/collections/{collection} - View raw MongoDB collection data',
                'GET /zrocket/tables - List all discriminated Zero tables'
            ]
        };
    }

    @Post('seed-data')
    @ApiOperation({
        summary: 'Seed sample data for the discriminated union demo',
        description: 'Creates sample rooms, messages, participants, and users in MongoDB to demonstrate the discriminated union functionality'
    })
    @ApiResponse({ status: 201, description: 'Sample data seeded successfully' })
    async seedSampleData() {
        // Import and run the seeder
        const { seedZRocketData } = await import('../zrocket-seeder.js');
        
        try {
            await seedZRocketData();
            return {
                success: true,
                message: 'Sample data seeded successfully',
                timestamp: new Date().toISOString()
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

    @Get('collections/:collection')
    @ApiOperation({
        summary: 'View raw MongoDB collection data',
        description: 'Returns the raw documents from a MongoDB collection to see the source data'
    })
    @ApiParam({ name: 'collection', description: 'Collection name (rooms, messages, participants, users)' })
    @ApiQuery({ name: 'limit', required: false, description: 'Number of documents to return (default: 10)' })
    @ApiResponse({ status: 200, description: 'Collection data' })
    async getCollectionData(
        @Param('collection') collection: string,
        @Query('limit') limit: string = '10'
    ) {
        // This would need to be implemented with actual MongoDB connection
        // For now, return a placeholder
        return {
            collection,
            limit: parseInt(limit),
            message: 'This endpoint would return raw MongoDB documents from the specified collection',
            note: 'Implementation requires MongoDB connection in controller'
        };
    }

    @Get('tables')
    @ApiOperation({
        summary: 'List all discriminated Zero tables',
        description: 'Returns information about all Zero tables created from discriminated unions'
    })
    @ApiResponse({ status: 200, description: 'Zero tables information' })
    getZeroTables() {
        return {
            discriminatedTables: {
                rooms: ['chats', 'groups', 'channels'],
                messages: ['textMessages', 'imageMessages', 'systemMessages'],
                participants: ['userParticipants', 'botParticipants']
            },
            traditionalTables: ['users'],
            totalTables: 8,
            description: 'These tables are automatically created and synced based on discriminated union configurations'
        };
    }
}