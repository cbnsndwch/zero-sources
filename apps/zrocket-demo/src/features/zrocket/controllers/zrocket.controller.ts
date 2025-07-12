import { Controller, Get, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Room, Message, Participant } from '../entities/index.js';
import { zrocketSchema } from '../schemas/index.js';

@Controller('zrocket')
export class ZRocketController {
    private readonly logger = new Logger(ZRocketController.name);

    constructor(
        @InjectModel(Room.name) private roomModel: Model<Room>,
        @InjectModel(Message.name) private messageModel: Model<Message>,
        @InjectModel(Participant.name) private participantModel: Model<Participant>
    ) {}

    @Get('/')
    async getInfo() {
        return {
            title: 'ZRocket Demo - Discriminated Unions with Zero and MongoDB',
            description: 'This demo showcases how to use discriminated unions to create multiple Zero tables from MongoDB collections',
            schema: 'Available at /zrocket/schema',
            data: 'Available at /zrocket/data',
            discriminatedUnions: {
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
        };
    }

    @Get('/schema')
    async getSchema() {
        return {
            version: zrocketSchema.version,
            tables: Object.keys(zrocketSchema.tables),
            tableDetails: {
                chats: { 
                    source: 'rooms', 
                    filter: 'type: "d", isArchived: false',
                    discriminatedUnion: 'Direct message rooms from rooms collection'
                },
                groups: { 
                    source: 'rooms', 
                    filter: 'type: "p", isArchived: false',
                    discriminatedUnion: 'Private group rooms from rooms collection'
                },
                channels: { 
                    source: 'rooms', 
                    filter: 'type: "c", isArchived: false',
                    discriminatedUnion: 'Public channel rooms from rooms collection'
                },
                textMessages: { 
                    source: 'messages', 
                    filter: 'type: "text", isDeleted: false',
                    discriminatedUnion: 'Text messages from messages collection'
                },
                imageMessages: { 
                    source: 'messages', 
                    filter: 'type: "image", isDeleted: false',
                    discriminatedUnion: 'Image messages from messages collection'
                },
                systemMessages: { 
                    source: 'messages', 
                    filter: 'type: "system"',
                    discriminatedUnion: 'System messages from messages collection'
                },
                userParticipants: { 
                    source: 'participants', 
                    filter: 'type: "user"',
                    discriminatedUnion: 'User participants from participants collection'
                },
                botParticipants: { 
                    source: 'participants', 
                    filter: 'type: "bot"',
                    discriminatedUnion: 'Bot participants from participants collection'
                }
            }
        };
    }

    @Get('/data')
    async getData() {
        const rooms = await this.roomModel.find().lean();
        const messages = await this.messageModel.find().lean();
        const participants = await this.participantModel.find().lean();

        // Group data by discriminator to show the union effect
        const groupedData = {
            rooms: {
                direct: rooms.filter(r => r.type === 'd'),
                private: rooms.filter(r => r.type === 'p'),
                public: rooms.filter(r => r.type === 'c')
            },
            messages: {
                text: messages.filter(m => m.type === 'text'),
                image: messages.filter(m => m.type === 'image'),
                system: messages.filter(m => m.type === 'system')
            },
            participants: {
                users: participants.filter(p => p.type === 'user'),
                bots: participants.filter(p => p.type === 'bot')
            }
        };

        return {
            totalCounts: {
                rooms: rooms.length,
                messages: messages.length,
                participants: participants.length
            },
            groupedData,
            explanation: 'Each group above would be projected to a separate Zero table based on the discriminator'
        };
    }

    @Get('/demo-queries')
    async getDemoQueries() {
        return {
            title: 'Example Zero Queries for ZRocket',
            examples: [
                {
                    description: 'Get all public channels',
                    query: 'z.query.channels',
                    zeroTable: 'channels',
                    mongoEquivalent: 'db.rooms.find({ type: "c", isArchived: false })'
                },
                {
                    description: 'Get all text messages for a room',
                    query: 'z.query.textMessages.where("roomId", roomId)',
                    zeroTable: 'textMessages', 
                    mongoEquivalent: 'db.messages.find({ type: "text", roomId: roomId, isDeleted: false })'
                },
                {
                    description: 'Get all image messages for a room',
                    query: 'z.query.imageMessages.where("roomId", roomId)',
                    zeroTable: 'imageMessages',
                    mongoEquivalent: 'db.messages.find({ type: "image", roomId: roomId, isDeleted: false })'
                },
                {
                    description: 'Get only user participants (no bots)',
                    query: 'z.query.userParticipants.where("roomId", roomId)',
                    zeroTable: 'userParticipants',
                    mongoEquivalent: 'db.participants.find({ type: "user", roomId: roomId })'
                },
                {
                    description: 'Get channels with their user participants',
                    query: 'z.query.channels.related("users", z.query.userParticipants.where("roomId", (room) => room.id))',
                    zeroTable: 'channels + userParticipants',
                    mongoEquivalent: 'Aggregation pipeline joining rooms and participants'
                }
            ]
        };
    }
}