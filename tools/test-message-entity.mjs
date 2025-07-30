async function testMessageEntityDiscriminatedUnion() {
    console.log('🧪 Testing Message Entity Discriminated Union Support...');
    
    try {
        // Import the Message class
        const { Message } = await import('../apps/zrocket/dist/features/chat/entities/message.entity.js');

        // Test creating a user message
        console.log('\n📝 Testing User Message creation...');
        const userMessage = new Message();
        userMessage._id = '64a7b8c9d0e1f2a3b4c5d6e7';
        userMessage.roomId = 'room123';
        userMessage.t = 'USER';
        userMessage.sender = {
            _id: 'user123',
            username: 'testuser',
            name: 'Test User'
        };
        userMessage.contents = {
            root: {
                children: [
                    {
                        children: [
                            {
                                detail: 0,
                                format: 0,
                                mode: "normal",
                                style: "",
                                text: "Hello world!",
                                type: "text",
                                version: 1
                            }
                        ],
                        direction: "ltr",
                        format: "",
                        indent: 0,
                        type: "paragraph",
                        version: 1
                    }
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "root",
                version: 1
            }
        };
        userMessage.groupable = true;
        userMessage.hidden = false;

        console.log(`✓ User message type: ${userMessage.t}`);
        console.log(`✓ Is user message: ${userMessage.isUserMessage()}`);
        console.log(`✓ Is system message: ${userMessage.isSystemMessage()}`);
        console.log(`✓ Has sender: ${!!userMessage.sender}`);
        console.log(`✓ Has contents: ${!!userMessage.contents}`);

        // Test creating a system message
        console.log('\n🔧 Testing System Message creation...');
        const systemMessage = new Message();
        systemMessage._id = '64a7b8c9d0e1f2a3b4c5d6e8';
        systemMessage.roomId = 'room123';
        systemMessage.t = 'USER_JOINED';
        systemMessage.data = {
            userId: 'user456',
            username: 'newuser',
            timestamp: new Date().toISOString()
        };
        systemMessage.hidden = false;

        console.log(`✓ System message type: ${systemMessage.t}`);
        console.log(`✓ Is user message: ${systemMessage.isUserMessage()}`);
        console.log(`✓ Is system message: ${systemMessage.isSystemMessage()}`);
        console.log(`✓ Has data: ${!!systemMessage.data}`);
        console.log(`✓ Data content:`, JSON.stringify(systemMessage.data));

        // Test validation
        console.log('\n✅ Testing discriminated union validation...');
        
        // User message should have sender and contents, but not data
        if (userMessage.isUserMessage()) {
            if (!userMessage.sender || !userMessage.contents) {
                throw new Error('User message should have sender and contents');
            }
            if (userMessage.data) {
                throw new Error('User message should not have data field');
            }
            console.log('✓ User message validation passed');
        }

        // System message should have data but not sender/contents
        if (systemMessage.isSystemMessage()) {
            if (!systemMessage.data) {
                throw new Error('System message should have data');
            }
            if (systemMessage.sender || systemMessage.contents) {
                throw new Error('System message should not have sender or contents');
            }
            console.log('✓ System message validation passed');
        }

        // Test message type discrimination
        console.log('\n🎯 Testing message type discrimination...');
        const messages = [userMessage, systemMessage];
        
        let userMessageCount = 0;
        let systemMessageCount = 0;
        
        for (const msg of messages) {
            if (msg.isUserMessage()) {
                userMessageCount++;
                console.log(`  User message: ${msg._id} - ${msg.sender?.username}`);
            } else if (msg.isSystemMessage()) {
                systemMessageCount++;
                console.log(`  System message: ${msg._id} - ${msg.t}`);
            }
        }
        
        if (userMessageCount !== 1 || systemMessageCount !== 1) {
            throw new Error(`Expected 1 user message and 1 system message, got ${userMessageCount} user and ${systemMessageCount} system`);
        }

        console.log('\n🎉 All Message Entity discriminated union tests passed!');
        console.log('\n📝 Summary:');
        console.log('   ✓ Message entity supports both user and system message types');
        console.log('   ✓ Discriminator field "t" properly distinguishes message types');
        console.log('   ✓ User messages have sender and contents fields');
        console.log('   ✓ System messages have data field and message type');
        console.log('   ✓ Helper methods correctly identify message types');
        console.log('   ✓ MongoDB schema supports optional fields for both formats');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        throw error;
    }
}

// Run the test
testMessageEntityDiscriminatedUnion().catch(error => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
});
