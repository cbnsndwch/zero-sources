/* eslint-disable no-console */
import { MongoClient, ObjectId } from 'mongodb';

// Sample data for ZRocket discriminated union demo
const sampleData = {
    users: [
        {
            _id: new ObjectId(),
            updatedAt: new Date().toISOString(),
            username: 'alice',
            name: 'Alice Cooper',
            email: 'alice@example.com',
            active: true
        },
        {
            _id: new ObjectId(),
            updatedAt: new Date().toISOString(),
            username: 'bob',
            name: 'Bob Builder',
            email: 'bob@example.com',
            active: true
        },
        {
            _id: new ObjectId(),
            updatedAt: new Date().toISOString(),
            username: 'charlie',
            name: 'Charlie Brown',
            email: 'charlie@example.com',
            active: true
        },
        {
            _id: new ObjectId(),
            updatedAt: new Date().toISOString(),
            username: 'diana',
            name: 'Diana Prince',
            email: 'diana@example.com',
            active: true
        }
    ],
    rooms: [
        // Direct messages (discriminated union: t: 'd')
        {
            _id: new ObjectId(),
            updatedAt: new Date().toISOString(),
            t: 'd',
            memberIds: ['alice', 'bob'],
            usernames: ['alice', 'bob'],
            messageCount: 2,
            lastMessageAt: new Date().toISOString()
        },
        {
            _id: new ObjectId(),
            updatedAt: new Date().toISOString(),
            t: 'd',
            memberIds: ['alice', 'charlie'],
            usernames: ['alice', 'charlie'],
            messageCount: 0,
            lastMessageAt: new Date().toISOString()
        },
        // Private groups (discriminated union: t: 'p')
        {
            _id: new ObjectId(),
            updatedAt: new Date().toISOString(),
            t: 'p',
            name: 'Project Alpha Team',
            memberIds: ['alice', 'bob', 'charlie'],
            usernames: ['alice', 'bob', 'charlie'],
            messageCount: 1,
            lastMessageAt: new Date().toISOString(),
            description: 'Private group for Project Alpha discussions',
            topic: 'Project Alpha'
        },
        {
            _id: new ObjectId(),
            updatedAt: new Date().toISOString(),
            t: 'p',
            name: 'Engineering Team',
            memberIds: ['alice', 'bob', 'charlie', 'diana'],
            usernames: ['alice', 'bob', 'charlie', 'diana'],
            messageCount: 0,
            lastMessageAt: new Date().toISOString(),
            description: 'Engineering team discussions',
            topic: 'Engineering'
        },
        // Public channels (discriminated union: t: 'c')
        {
            _id: new ObjectId(),
            updatedAt: new Date().toISOString(),
            t: 'c',
            name: 'general',
            memberIds: ['alice', 'bob', 'charlie', 'diana'],
            usernames: ['alice', 'bob', 'charlie', 'diana'],
            messageCount: 2,
            lastMessageAt: new Date().toISOString(),
            description: 'General discussion channel',
            topic: 'General chat',
            featured: true,
            default: true
        },
        {
            _id: new ObjectId(),
            updatedAt: new Date().toISOString(),
            t: 'c',
            name: 'random',
            memberIds: ['alice', 'bob', 'diana'],
            usernames: ['alice', 'bob', 'diana'],
            messageCount: 0,
            lastMessageAt: new Date().toISOString(),
            description: 'Random discussions and fun',
            topic: 'Random',
            featured: false,
            default: false
        }
    ],
    messages: [
        // User messages (discriminated union: no 't' field = user message)
        {
            _id: new ObjectId(),
            roomId: '', // Will be set to actual room ID
            ts: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            sender: {
                id: 'alice',
                name: 'Alice Cooper',
                username: 'alice'
            },
            contents: {
                root: {
                    children: [
                        {
                            children: [
                                {
                                    detail: 0,
                                    format: 0,
                                    mode: 'normal',
                                    style: '',
                                    text: 'Hello everyone! 👋',
                                    type: 'text',
                                    version: 1
                                }
                            ],
                            direction: 'ltr',
                            format: '',
                            indent: 0,
                            type: 'paragraph',
                            version: 1
                        }
                    ],
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                    type: 'root',
                    version: 1
                }
            },
            hidden: false
        },
        {
            _id: new ObjectId(),
            roomId: '', // Will be set to actual room ID
            ts: new Date(Date.now() + 1000).toISOString(),
            createdAt: new Date(Date.now() + 1000).toISOString(),
            sender: {
                id: 'bob',
                name: 'Bob Builder',
                username: 'bob'
            },
            contents: {
                root: {
                    children: [
                        {
                            children: [
                                {
                                    detail: 0,
                                    format: 0,
                                    mode: 'normal',
                                    style: '',
                                    text: 'Hey Alice! How are you doing?',
                                    type: 'text',
                                    version: 1
                                }
                            ],
                            direction: 'ltr',
                            format: '',
                            indent: 0,
                            type: 'paragraph',
                            version: 1
                        }
                    ],
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                    type: 'root',
                    version: 1
                }
            },
            hidden: false
        },
        // System messages (discriminated union: has 't' field = system message)
        {
            _id: new ObjectId(),
            roomId: '', // Will be set to actual room ID
            ts: new Date(Date.now() + 3000).toISOString(),
            t: 'user_joined',
            data: {
                targetUserId: 'diana',
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

        // Insert rooms (single collection with discriminated union)
        const roomsResult = await db
            .collection('rooms')
            .insertMany(dataToSeed.rooms);
        console.log(`Inserted ${roomsResult.insertedCount} rooms`);

        // Get room IDs for messages
        const rooms = await db.collection('rooms').find({}).toArray();
        
        const generalChannel = rooms.find(r => r.name === 'general');
        const projectGroup = rooms.find(r => r.name === 'Project Alpha Team');
        const dmRoom = rooms.find(
            r => r.t === 'd' && r.usernames.includes('alice') && r.usernames.includes('bob')
        );

        if (generalChannel && projectGroup && dmRoom) {
            // Update messages with room IDs (both user and system messages)
            dataToSeed.messages[0].roomId = generalChannel._id.toString();
            dataToSeed.messages[1].roomId = dmRoom._id.toString();
            dataToSeed.messages[2].roomId = generalChannel._id.toString(); // system message

            // Insert all messages (user + system in single collection)
            const messagesResult = await db
                .collection('messages')
                .insertMany(dataToSeed.messages);
            console.log(`Inserted ${messagesResult.insertedCount} messages (user + system)`);
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

const currentUrl = import.meta.url;
const currentScript = new URL(`file://${process.argv[1]}`).href

// CLI usage
if (currentUrl === currentScript) {
    const mongoUri = process.argv[2] || 'mongodb://localhost:27017/zrocket';
    seedZRocketData(mongoUri).catch(console.error);
}
