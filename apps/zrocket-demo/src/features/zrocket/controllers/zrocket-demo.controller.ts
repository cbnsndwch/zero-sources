import { Controller, Get } from '@nestjs/common';

import { zrocketSchema } from '../schemas/index.js';

@Controller('zrocket')
export class ZRocketDemoController {
    @Get('/')
    async getInfo() {
        return {
            title: 'ZRocket Demo - Discriminated Unions with Zero and MongoDB',
            description: 'This demo showcases how to use discriminated unions to create multiple Zero tables from MongoDB collections',
            demo: 'This is a working demonstration of the discriminated union concept',
            schema: 'Available at /zrocket/schema',
            discriminatedUnions: {
                concept: 'Multiple Zero tables derived from fewer MongoDB collections using type-based discrimination',
                benefits: [
                    'Clean client interface - query specific entity types without complex filtering',
                    'Efficient data transfer - only relevant fields are projected and transferred',
                    'Type safety - each Zero table has a specific schema for its use case',
                    'Flexible backend schema - MongoDB collections can evolve independently'
                ],
                examples: {
                    rooms: {
                        collection: 'rooms',
                        discriminator: 'type',
                        zeroTables: ['chats (type=d)', 'groups (type=p)', 'channels (type=c)']
                    },
                    messages: {
                        collection: 'messages', 
                        discriminator: 'type',
                        zeroTables: ['textMessages (type=text)', 'imageMessages (type=image)', 'systemMessages (type=system)']
                    },
                    participants: {
                        collection: 'participants',
                        discriminator: 'type',
                        zeroTables: ['userParticipants (type=user)', 'botParticipants (type=bot)']
                    }
                }
            }
        };
    }

    @Get('/schema')
    async getSchema() {
        return {
            title: 'ZRocket Schema - Discriminated Union Implementation',
            version: zrocketSchema.version,
            tables: Object.keys(zrocketSchema.tables),
            discriminatedUnionExamples: {
                chats: { 
                    implementation: 'table("chats").from(JSON.stringify({source: "rooms", filter: {type: "d", isArchived: false}, projection: {...}}))',
                    description: 'Direct message rooms derived from rooms collection where type="d"',
                    source: 'rooms collection',
                    filter: 'type: "d", isArchived: false',
                    projection: '_id, participantIds, createdAt, lastMessageAt'
                },
                groups: { 
                    implementation: 'table("groups").from(JSON.stringify({source: "rooms", filter: {type: "p", isArchived: false}, projection: {...}}))',
                    description: 'Private group rooms derived from rooms collection where type="p"',
                    source: 'rooms collection',
                    filter: 'type: "p", isArchived: false',
                    projection: '_id, name, participantIds, createdAt, lastMessageAt'
                },
                channels: { 
                    implementation: 'table("channels").from(JSON.stringify({source: "rooms", filter: {type: "c", isArchived: false}, projection: {...}}))',
                    description: 'Public channel rooms derived from rooms collection where type="c"',
                    source: 'rooms collection',
                    filter: 'type: "c", isArchived: false',
                    projection: '_id, name, description, participantIds, createdAt, lastMessageAt'
                },
                textMessages: { 
                    implementation: 'table("textMessages").from(JSON.stringify({source: "messages", filter: {type: "text", isDeleted: false}, projection: {...}}))',
                    description: 'Text messages derived from messages collection where type="text"',
                    source: 'messages collection',
                    filter: 'type: "text", isDeleted: false',
                    projection: '_id, roomId, senderId, content, createdAt'
                },
                imageMessages: { 
                    implementation: 'table("imageMessages").from(JSON.stringify({source: "messages", filter: {type: "image", isDeleted: false}, projection: {...}}))',
                    description: 'Image messages derived from messages collection where type="image"',
                    source: 'messages collection',
                    filter: 'type: "image", isDeleted: false',
                    projection: '_id, roomId, senderId, imageUrl, caption, imageMetadata, createdAt'
                },
                systemMessages: { 
                    implementation: 'table("systemMessages").from(JSON.stringify({source: "messages", filter: {type: "system"}, projection: {...}}))',
                    description: 'System messages derived from messages collection where type="system"',
                    source: 'messages collection',
                    filter: 'type: "system"',
                    projection: '_id, roomId, action, targetUserId, createdAt, metadata'
                },
                userParticipants: { 
                    implementation: 'table("userParticipants").from(JSON.stringify({source: "participants", filter: {type: "user"}, projection: {...}}))',
                    description: 'User participants derived from participants collection where type="user"',
                    source: 'participants collection',
                    filter: 'type: "user"',
                    projection: '_id, userId, roomId, role, joinedAt, lastReadAt, notificationSettings.muted'
                },
                botParticipants: { 
                    implementation: 'table("botParticipants").from(JSON.stringify({source: "participants", filter: {type: "bot"}, projection: {...}}))',
                    description: 'Bot participants derived from participants collection where type="bot"',
                    source: 'participants collection',
                    filter: 'type: "bot"',
                    projection: '_id, botId, roomId, role, joinedAt, config'
                }
            }
        };
    }

    @Get('/demo-queries')
    async getDemoQueries() {
        return {
            title: 'Example Zero Queries for ZRocket Discriminated Unions',
            description: 'These queries demonstrate how clients can work with discriminated union tables cleanly',
            examples: [
                {
                    title: 'Get all public channels',
                    query: 'z.query.channels',
                    zeroTable: 'channels',
                    benefit: 'No filtering needed - already discriminated to public channels only',
                    mongoEquivalent: 'db.rooms.find({ type: "c", isArchived: false })'
                },
                {
                    title: 'Get all text messages for a room',
                    query: 'z.query.textMessages.where("roomId", roomId)',
                    zeroTable: 'textMessages',
                    benefit: 'Only text messages, no need to filter by message type',
                    mongoEquivalent: 'db.messages.find({ type: "text", roomId: roomId, isDeleted: false })'
                },
                {
                    title: 'Get all image messages for a room',
                    query: 'z.query.imageMessages.where("roomId", roomId)',
                    zeroTable: 'imageMessages',
                    benefit: 'Only image messages with metadata fields available',
                    mongoEquivalent: 'db.messages.find({ type: "image", roomId: roomId, isDeleted: false })'
                },
                {
                    title: 'Get only user participants (no bots)',
                    query: 'z.query.userParticipants.where("roomId", roomId)',
                    zeroTable: 'userParticipants',
                    benefit: 'Human participants only, with user-specific fields like lastReadAt',
                    mongoEquivalent: 'db.participants.find({ type: "user", roomId: roomId })'
                },
                {
                    title: 'Get bot participants only',
                    query: 'z.query.botParticipants.where("roomId", roomId)',
                    zeroTable: 'botParticipants',
                    benefit: 'Bot participants only, with bot-specific config fields',
                    mongoEquivalent: 'db.participants.find({ type: "bot", roomId: roomId })'
                },
                {
                    title: 'Get direct message rooms',
                    query: 'z.query.chats.where("participantIds", "contains", userId)',
                    zeroTable: 'chats',
                    benefit: 'Only 1-on-1 chat rooms, no groups or channels',
                    mongoEquivalent: 'db.rooms.find({ type: "d", participantIds: userId, isArchived: false })'
                }
            ],
            changeStreamProcessing: {
                title: 'How MongoDB Change Sources Would Process Discriminated Unions',
                steps: [
                    '1. Parse .from() JSON configurations from each Zero table',
                    '2. When a document changes in MongoDB, find all tables with matching source collection',
                    '3. Apply discriminator filters to determine which tables should receive the change',
                    '4. Apply field projections to extract only relevant data for each table',
                    '5. Route the projected data to the appropriate Zero table(s)',
                    '6. A single MongoDB document change can update multiple Zero tables if it matches multiple filters'
                ],
                example: {
                    mongoChange: 'A new message with type: "text" is inserted into messages collection',
                    result: 'Only the textMessages Zero table receives this change (not imageMessages or systemMessages)',
                    projectedFields: 'Only _id, roomId, senderId, content, createdAt are sent to the Zero table'
                }
            }
        };
    }

    @Get('/implementation')
    async getImplementation() {
        return {
            title: 'ZRocket Implementation Details',
            zeroTableDefinitions: {
                explanation: 'Each Zero table uses .from() with JSON configuration for discriminated unions',
                example: {
                    code: `
const chats = table('chats')
  .from(JSON.stringify({
    source: 'rooms',
    filter: { type: 'd', isArchived: false },
    projection: { _id: 1, participantIds: 1, createdAt: 1, lastMessageAt: 1 }
  }))
  .columns({
    id: string(),
    participantIds: json<string[]>(),
    createdAt: string(),
    lastMessageAt: string()
  })
  .primaryKey('id');`,
                    explanation: 'This creates a Zero table that receives data from the "rooms" MongoDB collection, but only documents where type="d" and isArchived=false'
                }
            },
            mongoDbEntities: {
                explanation: 'MongoDB collections use discriminated union patterns',
                rooms: {
                    collection: 'rooms',
                    discriminator: 'type field with values: "d" (direct), "p" (private), "c" (channel)',
                    schema: 'Unified schema with optional fields based on type'
                },
                messages: {
                    collection: 'messages', 
                    discriminator: 'type field with values: "text", "image", "system"',
                    schema: 'Unified schema with type-specific fields (content for text, imageUrl for images, etc.)'
                },
                participants: {
                    collection: 'participants',
                    discriminator: 'type field with values: "user", "bot"',
                    schema: 'Unified schema with user-specific (lastReadAt) and bot-specific (config) fields'
                }
            },
            benefits: {
                typeSeafety: 'Each Zero table has columns specific to its entity type',
                performance: 'Only relevant fields are projected and transferred',
                simplicity: 'Client queries don\'t need complex discriminator filtering',
                flexibility: 'MongoDB schema can evolve without breaking Zero interfaces',
                scalability: 'Different entity types can be optimized independently'
            }
        };
    }
}