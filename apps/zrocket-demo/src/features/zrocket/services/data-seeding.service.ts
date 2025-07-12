import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Room, Message, Participant } from '../entities/index.js';

@Injectable()
export class DataSeedingService implements OnModuleInit {
    private readonly logger = new Logger(DataSeedingService.name);

    constructor(
        @InjectModel(Room.name) private roomModel: Model<Room>,
        @InjectModel(Message.name) private messageModel: Model<Message>,
        @InjectModel(Participant.name) private participantModel: Model<Participant>
    ) {}

    async onModuleInit() {
        if (process.env.SEED_DATA === 'true') {
            await this.seedSampleData();
        }
    }

    async seedSampleData() {
        this.logger.log('Seeding sample ZRocket data...');

        // Clear existing data
        await this.roomModel.deleteMany({});
        await this.messageModel.deleteMany({});
        await this.participantModel.deleteMany({});

        // Create sample rooms
        const directRoom = await this.roomModel.create({
            type: 'd',
            participantIds: ['user1', 'user2'],
            isArchived: false,
            lastMessageAt: new Date()
        });

        const privateRoom = await this.roomModel.create({
            type: 'p',
            name: 'Project Alpha Team',
            participantIds: ['user1', 'user2', 'user3', 'user4'],
            isArchived: false,
            lastMessageAt: new Date()
        });

        const publicRoom = await this.roomModel.create({
            type: 'c',
            name: 'general',
            description: 'General discussion channel',
            participantIds: ['user1', 'user2', 'user3', 'user4', 'user5'],
            isArchived: false,
            lastMessageAt: new Date()
        });

        // Create sample messages
        await this.messageModel.create({
            type: 'text',
            roomId: directRoom._id,
            senderId: 'user1',
            content: 'Hello, how are you?',
            isDeleted: false
        });

        await this.messageModel.create({
            type: 'image',
            roomId: privateRoom._id,
            senderId: 'user2',
            imageUrl: 'https://storage.example.com/images/sample.jpg',
            caption: 'Check out this photo!',
            imageMetadata: {
                width: 1920,
                height: 1080,
                fileSize: 2048000,
                mimeType: 'image/jpeg'
            },
            isDeleted: false
        });

        await this.messageModel.create({
            type: 'system',
            roomId: publicRoom._id,
            action: 'user_joined',
            targetUserId: 'user3',
            metadata: {
                invitedBy: 'user1'
            }
        });

        // Create sample participants
        await this.participantModel.create({
            type: 'user',
            userId: 'user1',
            roomId: directRoom._id,
            role: 'member',
            joinedAt: new Date(),
            lastReadAt: new Date(),
            notificationSettings: {
                muted: false
            }
        });

        await this.participantModel.create({
            type: 'user',
            userId: 'user2',
            roomId: directRoom._id,
            role: 'member',
            joinedAt: new Date(),
            lastReadAt: new Date(),
            notificationSettings: {
                muted: false
            }
        });

        await this.participantModel.create({
            type: 'bot',
            botId: 'notification_bot',
            roomId: publicRoom._id,
            role: 'bot',
            joinedAt: new Date(),
            config: {
                autoRespond: true,
                triggers: ['@bot', 'help']
            }
        });

        this.logger.log('Sample data seeded successfully!');
        this.logger.log(`Created rooms: ${directRoom._id}, ${privateRoom._id}, ${publicRoom._id}`);
    }
}