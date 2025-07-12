/**
 * Simple test script to validate the table mapping functionality
 * Run with: node --loader ts-node/esm test-table-mapping.mts
 */

import { TableMappingService } from '../src/features/zero/services/table-mapping.service.js';

const tableMappingService = new TableMappingService();

// Test configuration
const config = {
    tables: {
        users: {
            source: 'entities',
            filter: { entityType: 'user', isActive: true },
            projection: { _id: 1, name: 1, email: 1 }
        },
        organizations: {
            source: 'entities',
            filter: { entityType: 'organization', isDeleted: { $ne: true } },
            projection: { _id: 1, name: 1, domain: 1 }
        },
        allMessages: {
            source: 'messages'
            // No filter or projection
        }
    }
};

console.log('🚀 Testing Table Mapping Service\n');

// Test 1: Get source collections
console.log('1. Source collections:', tableMappingService.getSourceCollections(config));

// Test 2: Test filtering and projection
const testDocuments = [
    {
        _id: '1',
        entityType: 'user',
        isActive: true,
        name: 'John Doe',
        email: 'john@example.com',
        secret: 'should-be-filtered-out'
    },
    {
        _id: '2',
        entityType: 'organization',
        isDeleted: false,
        name: 'Acme Corp',
        domain: 'acme.com',
        internal: 'should-be-filtered-out'
    },
    {
        _id: '3',
        entityType: 'user',
        isActive: false, // Should not match users filter
        name: 'Jane Doe',
        email: 'jane@example.com'
    },
    {
        _id: '4',
        entityType: 'organization',
        isDeleted: true, // Should not match organizations filter
        name: 'Old Corp',
        domain: 'old.com'
    }
];

console.log('\n2. Testing document matching:');
for (const doc of testDocuments) {
    const matches = tableMappingService.getTableMatches('entities', doc, config);
    console.log(`   Document ${doc._id} (${doc.entityType}):`, 
        matches.map(m => `${m.tableName}: ${JSON.stringify(m.document)}`));
}

// Test 3: Test messages collection (no filter/projection)
const messageDoc = {
    _id: 'msg1',
    sender: 'user123',
    content: 'Hello world',
    timestamp: new Date()
};

console.log('\n3. Testing messages collection:');
const messageMatches = tableMappingService.getTableMatches('messages', messageDoc, config);
console.log('   Message matches:', messageMatches.map(m => `${m.tableName}: ${JSON.stringify(m.document)}`));

// Test 4: Change stream pipeline
console.log('\n4. Change stream pipeline:');
console.log('   Pipeline:', JSON.stringify(tableMappingService.createChangeStreamPipeline(config), null, 2));

console.log('\n✅ All tests completed!');