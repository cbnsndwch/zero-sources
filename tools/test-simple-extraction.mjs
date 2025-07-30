#!/usr/bin/env node

import { getTableMappings } from '@cbnsndwch/zero-contracts';
import {
    chatsTable,
    channelsTable,
    groupsTable
} from '@cbnsndwch/zrocket-contracts';

console.log('🧪 Testing individual table mapping extraction...\n');

// Create a minimal schema-like object for testing
const testSchema = {
    tables: {
        chats: chatsTable,
        channels: channelsTable,
        groups: groupsTable
    }
};

try {
    // Extract table mappings using the metadata API
    const tableMappings = getTableMappings(testSchema);

    console.log('📊 Extracted table mappings:');
    console.log(JSON.stringify(tableMappings, null, 2));

    console.log('\n🔍 Checking individual tables:');

    const expectedTables = ['chats', 'channels', 'groups'];
    let allFound = true;

    for (const tableName of expectedTables) {
        const config = tableMappings[tableName];
        if (config) {
            console.log(
                `✅ ${tableName}: source="${config.source}", filter=${JSON.stringify(config.filter)}`
            );
        } else {
            console.log(`❌ ${tableName}: NOT FOUND`);
            allFound = false;
        }
    }

    if (allFound) {
        console.log('\n🎉 SUCCESS: All table mappings extracted correctly!');
        process.exit(0);
    } else {
        console.log('\n❌ FAILED: Some table mappings are missing');
        process.exit(1);
    }
} catch (error) {
    console.error('❌ Error during table mapping extraction:', error.message);
    process.exit(1);
}
