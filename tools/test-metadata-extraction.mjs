#!/usr/bin/env node

// Test script to verify that table mappings are extracted correctly from schema metadata
import { schema } from '@cbnsndwch/zrocket-contracts/schema';
import { getTableMappings } from '@cbnsndwch/zero-contracts';

console.log('🧪 Testing table mapping extraction from schema metadata...\n');

// Extract table mappings using the metadata API
const mapping = getTableMappings(schema);

console.log('📊 Extracted table mappings:');
console.log(JSON.stringify(mapping, null, 2));

console.log('\n🔍 Checking discriminated union tables:');

// Check if we have the expected discriminated union tables
const expectedTables = [
    'chats',      // Direct messages
    'groups',     // Private groups  
    'channels',   // Public channels
    'userMessages',    // User messages
    'systemMessages'   // System messages
];

let allFound = true;
for (const tableName of expectedTables) {
    const config = mapping[tableName];
    if (config) {
        console.log(`✅ ${tableName}: source="${config.source}", filter=${JSON.stringify(config.filter)}`);
    } else {
        console.log(`❌ ${tableName}: NOT FOUND`);
        allFound = false;
    }
}

console.log('\n📈 Summary:');
console.log(`Total tables with mappings: ${Object.keys(mapping).length}`);
console.log(`Expected discriminated tables found: ${allFound ? 'ALL' : 'SOME MISSING'}`);

if (allFound) {
    console.log('🎉 SUCCESS: All table mappings extracted correctly from schema metadata!');
    process.exit(0);
} else {
    console.log('❌ FAILED: Some expected table mappings are missing');
    process.exit(1);
}
