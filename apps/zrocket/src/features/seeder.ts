/* eslint-disable no-console */
import { MongoClient, ObjectId } from 'mongodb';

// Sample data for ZRocket discriminated union demo
const sampleData = {
    users: [
        {
            _id: new ObjectId(),
            username: 'alice',
            name: 'Alice Cooper',
            email: 'alice@example.com',
            active: true,
            type: 'user'
        },
        {
            _id: new ObjectId(),
            username: 'bob',
            name: 'Bob Builder',
            email: 'bob@example.com',
            active: true,
            type: 'user'
        },
        {
            _id: new ObjectId(),
            username: 'charlie',
            name: 'Charlie Brown',
            email: 'charlie@example.com',
            active: true,
            type: 'user'
        },
        {
            _id: new ObjectId(),
            username: 'diana',
            name: 'Diana Prince',
            email: 'diana@example.com',
            active: true,
            type: 'user'
        }
    ],
    rooms: [
        // Direct messages (chats)
        {
            _id: new ObjectId(),
            t: 'd',
            memberIds: ['alice', 'bob'],
            usernames: ['alice', 'bob'],
            createdAt: new Date().toISOString(),
            lastMessageAt: new Date().toISOString(),
            archived: false
        },
        {
            _id: new ObjectId(),
            t: 'd',
            memberIds: ['alice', 'charlie'],
            usernames: ['alice', 'charlie'],
            createdAt: new Date().toISOString(),
            lastMessageAt: new Date().toISOString(),
            archived: false
        },
        // Private groups
        {
            _id: new ObjectId(),
            t: 'p',
            name: 'Project Alpha Team',
            memberIds: ['alice', 'bob', 'charlie'],
            createdAt: new Date().toISOString(),
            lastMessageAt: new Date().toISOString(),
            description: 'Private group for Project Alpha discussions',
            topic: 'Project Alpha',
            archived: false
        },
        {
            _id: new ObjectId(),
            t: 'p',
            name: 'Engineering Team',
            memberIds: ['alice', 'bob', 'charlie', 'diana'],
            createdAt: new Date().toISOString(),
            lastMessageAt: new Date().toISOString(),
            description: 'Engineering team discussions',
            topic: 'Engineering',
            archived: false
        },
        // Public channels
        {
            _id: new ObjectId(),
            t: 'c',
            name: 'general',
            memberIds: ['alice', 'bob', 'charlie', 'diana'],
            createdAt: new Date().toISOString(),
            lastMessageAt: new Date().toISOString(),
            description: 'General discussion channel',
            topic: 'General chat',
            featured: true,
            default: true,
            archived: false
        },
        {
            _id: new ObjectId(),
            t: 'c',
            name: 'random',
            memberIds: ['alice', 'bob', 'diana'],
            createdAt: new Date().toISOString(),
            lastMessageAt: new Date().toISOString(),
            description: 'Random discussions and fun',
            topic: 'Random',
            featured: false,
            default: false,
            archived: false
        }
    ],
    messages: [
        // Text messages
        {
            _id: new ObjectId(),
            t: 'text',
            roomId: '', // Will be set to actual room ID
            sender: {
                id: 'alice',
                name: 'Alice Cooper',
                username: 'alice'
            },
            contents: {
                ops: [{ insert: 'Hello everyone! 👋' }]
            },
            md: 'Hello everyone! 👋',
            ts: new Date().toISOString(),
            hidden: false
        },
        {
            _id: new ObjectId(),
            t: 'text',
            roomId: '', // Will be set to actual room ID
            sender: {
                id: 'bob',
                name: 'Bob Builder',
                username: 'bob'
            },
            contents: {
                ops: [{ insert: 'Hey Alice! How are you doing?' }]
            },
            md: 'Hey Alice! How are you doing?',
            ts: new Date(Date.now() + 1000).toISOString(),
            hidden: false
        },
        // Image message
        {
            _id: new ObjectId(),
            t: 'image',
            roomId: '', // Will be set to actual room ID
            sender: {
                id: 'charlie',
                name: 'Charlie Brown',
                username: 'charlie'
            },
            imageUrl: 'https://picsum.photos/800/600?random=1',
            caption: 'Check out this cool photo!',
            imageMetadata: {
                width: 800,
                height: 600,
                fileSize: 245760,
                mimeType: 'image/jpeg'
            },
            ts: new Date(Date.now() + 2000).toISOString(),
            hidden: false
        },
        // System message
        {
            _id: new ObjectId(),
            t: 'system',
            roomId: '', // Will be set to actual room ID
            action: 'user_joined',
            targetUserId: 'diana',
            ts: new Date(Date.now() + 3000).toISOString(),
            metadata: {
                invitedBy: 'alice'
            }
        }
    ]
};

export async function seedZRocketData(
    mongoUri: string = 'mongodb://localhost:27017/zrocket',
    customData?: any
) {
    const client = new MongoClient(mongoUri);

    // Use custom data if provided, otherwise use default sample data
    const dataToSeed = customData || sampleData;

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db();

        // Clear existing data
        await Promise.all([
            db.collection('users').deleteMany({}),
            db.collection('rooms').deleteMany({}),
            db.collection('messages').deleteMany({})
        ]);

        console.log('Cleared existing data');

        // Insert users
        const usersResult = await db
            .collection('users')
            .insertMany(dataToSeed.users);
        console.log(`Inserted ${usersResult.insertedCount} users`);

        // Insert rooms
        const roomsResult = await db
            .collection('rooms')
            .insertMany(dataToSeed.rooms);
        console.log(`Inserted ${roomsResult.insertedCount} rooms`);

        // Get room IDs for messages
        const rooms = await db.collection('rooms').find({}).toArray();
        const generalChannel = rooms.find(r => r.name === 'general');
        const projectGroup = rooms.find(r => r.name === 'Project Alpha Team');
        const dmRoom = rooms.find(
            r =>
                r.t === 'd' &&
                r.usernames.includes('alice') &&
                r.usernames.includes('bob')
        );

        // Get user IDs for messages
        const users = await db.collection('users').find({}).toArray();
        const userIdMap = users.reduce(
            (map, user) => {
                map[user.username] = user._id.toString();
                return map;
            },
            {} as Record<string, string>
        );

        if (generalChannel && projectGroup && dmRoom) {
            // Update messages with room IDs
            dataToSeed.messages[0].roomId = generalChannel._id.toString();
            dataToSeed.messages[1].roomId = dmRoom._id.toString();
            dataToSeed.messages[2].roomId = projectGroup._id.toString();
            dataToSeed.messages[3].roomId = generalChannel._id.toString();

            // Insert messages
            const messagesResult = await db
                .collection('messages')
                .insertMany(dataToSeed.messages);
            console.log(`Inserted ${messagesResult.insertedCount} messages`);
        }

        console.log('✅ ZRocket sample data seeded successfully!');

        // Show summary
        const collections = await db.listCollections().toArray();
        for (const collection of collections) {
            const count = await db.collection(collection.name).countDocuments();
            console.log(`📊 ${collection.name}: ${count} documents`);
        }
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        throw error;
    } finally {
        await client.close();
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const mongoUri = process.argv[2] || 'mongodb://localhost:27017/zrocket';
    seedZRocketData(mongoUri).catch(console.error);
}
