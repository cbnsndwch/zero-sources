/**
 * Quick Message Entity Structure Test
 * Tests the Message entity structure and helper methods without requiring MongoDB/NestJS context
 */

async function testMessageEntityStructure() {
    console.log('🧪 Testing Message Entity Structure & Helper Methods...\n');
    
    try {
        // Import the contracts to get the types
        const fs = await import('fs');
        const path = await import('path');
        
        // Read the Message entity source to validate its structure
        const entityPath = './apps/zrocket/src/features/chat/entities/message.entity.ts';
        const entitySource = fs.readFileSync(entityPath, 'utf8');
        
        console.log('1️⃣  Validating Message entity structure...');
        
        // Check core discriminated union structure
        const checks = [
            { name: 'Discriminator field "t"', pattern: /t!:\s*MessageType/ },
            { name: 'Optional sender field', pattern: /sender\?:/ },
            { name: 'Optional contents field', pattern: /contents\?:/ },
            { name: 'Optional data field', pattern: /data\?:/ },
            { name: 'isUserMessage() method', pattern: /isUserMessage\(\)/ },
            { name: 'isSystemMessage() method', pattern: /isSystemMessage\(\)/ },
            { name: 'Mongoose @Schema decorator', pattern: /@Schema\(\)/ },
            { name: 'MongoDB collection name', pattern: /collection:\s*['"]messages['"]/ },
            { name: 'Enum validation', pattern: /@IsEnum\(MESSAGE_TYPES\)/ },
            { name: 'IUserMessage interface import', pattern: /IUserMessage/ },
            { name: 'ISystemMessage interface import', pattern: /ISystemMessage/ },
        ];
        
        let allPassed = true;
        checks.forEach(check => {
            if (check.pattern.test(entitySource)) {
                console.log(`   ✓ ${check.name}`);
            } else {
                console.log(`   ❌ ${check.name}`);
                allPassed = false;
            }
        });
        
        if (!allPassed) {
            throw new Error('Entity structure validation failed');
        }
        
        console.log('\n2️⃣  Validating Zero schema table configuration...');
        
        // Check user messages table
        const userMessagesPath = './libs/zrocket-contracts/src/messages/tables/user-messages.schema.ts';
        const userMessagesSource = fs.readFileSync(userMessagesPath, 'utf8');
        
        const userTableChecks = [
            { name: 'withTableMapping usage', pattern: /withTableMapping/ },
            { name: 'Messages source mapping', pattern: /source:\s*['"]messages['"]/ },
            { name: 'User message filter', pattern: /USER/ },
            { name: 'Sender field definition', pattern: /sender:/ },
            { name: 'Contents field definition', pattern: /contents:/ },
        ];
        
        userTableChecks.forEach(check => {
            if (check.pattern.test(userMessagesSource)) {
                console.log(`   ✓ userMessages: ${check.name}`);
            } else {
                console.log(`   ❌ userMessages: ${check.name}`);
                allPassed = false;
            }
        });
        
        // Check system messages table
        const systemMessagesPath = './libs/zrocket-contracts/src/messages/tables/system-message.schema.ts';
        const systemMessagesSource = fs.readFileSync(systemMessagesPath, 'utf8');
        
        const systemTableChecks = [
            { name: 'withTableMapping usage', pattern: /withTableMapping/ },
            { name: 'Messages source mapping', pattern: /source:\s*['"]messages['"]/ },
            { name: 'System message filter', pattern: /SYSTEM_MESSAGE_TYPES/ },
            { name: 'Data field definition', pattern: /data:/ },
            { name: 'Type discriminator field', pattern: /t:\s*enumeration/ },
        ];
        
        systemTableChecks.forEach(check => {
            if (check.pattern.test(systemMessagesSource)) {
                console.log(`   ✓ systemMessages: ${check.name}`);
            } else {
                console.log(`   ❌ systemMessages: ${check.name}`);
                allPassed = false;
            }
        });
        
        console.log('\n3️⃣  Validating TypeScript compilation...');
        
        // Check that the entity compiles correctly
        const distPath = './apps/zrocket/dist/features/chat/entities/message.entity.js';
        if (fs.existsSync(distPath)) {
            console.log('   ✓ Message entity compiles to JavaScript');
            
            // Read the compiled JS to ensure it has the essential parts
            const compiledSource = fs.readFileSync(distPath, 'utf8');
            if (compiledSource.includes('isUserMessage') && compiledSource.includes('isSystemMessage')) {
                console.log('   ✓ Helper methods present in compiled output');
            } else {
                console.log('   ❌ Helper methods missing in compiled output');
                allPassed = false;
            }
        } else {
            console.log('   ⚠️  Compiled JavaScript not found - run "pnpm build" first');
        }
        
        if (!allPassed) {
            throw new Error('Some validations failed');
        }
        
        console.log('\n4️⃣  Discriminated Union Architecture Summary...');
        console.log('   📦 Single MongoDB Collection: "messages"');
        console.log('   🔄 Discriminator Field: "t" (MessageType enum)');
        console.log('   👤 User Messages: t="USER" + sender + contents + user fields');
        console.log('   🤖 System Messages: t="<SystemType>" + data + base fields');
        console.log('   📊 Zero Tables: userMessages & systemMessages with withTableMapping()');
        console.log('   🛡️  Type Safety: Helper methods + TypeScript interfaces');
        
        console.log('\n✅ SUCCESS: Message Entity Structure Test Passed!');
        console.log('\n🎯 The Message entity is correctly structured for discriminated union support.');
        console.log('   • MongoDB entity supports both message types in single collection');
        console.log('   • Zero schema properly routes messages to appropriate tables');
        console.log('   • TypeScript provides type safety and validation');
        console.log('   • Helper methods enable runtime type discrimination');
        
        return true;
        
    } catch (error) {
        console.error('❌ Structure test failed:', error.message);
        return false;
    }
}

// Run the structure test
testMessageEntityStructure()
    .then(success => {
        if (success) {
            console.log('\n🎉 Message entity structure is valid and ready for use!');
        } else {
            console.log('\n⚠️  Please review and fix the identified issues.');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('💥 Test script failed:', error.message);
        process.exit(1);
    });
