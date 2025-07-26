import { MongoClient } from 'mongodb';

async function verifyData() {
    const client = new MongoClient('mongodb://localhost:27017/zrocket');
    
    try {
        await client.connect();
        const db = client.db();
        
        console.log('🔍 Verifying discriminated union data structure...\n');
        
        // Check rooms collection
        const rooms = await db.collection('rooms').find({}).toArray();
        console.log('📁 ROOMS COLLECTION (Discriminated Union):');
        rooms.forEach(room => {
            console.log(`  • ${room.t === 'd' ? 'Direct Message' : room.t === 'p' ? 'Private Group' : 'Public Channel'} (t: '${room.t}'): ${room.name || room.usernames?.join(' ↔ ')}`);
        });
        
        console.log('\n💬 MESSAGES COLLECTION:');
        const messages = await db.collection('messages').find({}).toArray();
        messages.forEach(msg => {
            const roomInfo = rooms.find(r => r._id.toString() === msg.roomId);
            console.log(`  • "${msg.contents.root.children[0].children[0].text}" by ${msg.sender.name} in ${roomInfo?.name || roomInfo?.usernames?.join(' ↔ ')}`);
        });
        
        console.log('\n⚙️ SYSTEM MESSAGES COLLECTION:');
        const systemMessages = await db.collection('systemMessages').find({}).toArray();
        systemMessages.forEach(msg => {
            const roomInfo = rooms.find(r => r._id.toString() === msg.roomId);
            console.log(`  • ${msg.t}: ${JSON.stringify(msg.data)} in ${roomInfo?.name}`);
        });
        
        console.log('\n✅ Data structure verification complete!');
        console.log(`   - Single 'rooms' collection with ${rooms.length} documents (discriminated by 't' field)`);
        console.log(`   - Single 'messages' collection with ${messages.length} documents`);
        console.log(`   - Single 'systemMessages' collection with ${systemMessages.length} documents`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
    }
}

verifyData();
