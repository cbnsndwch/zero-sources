import { getTableMappings } from './libs/zero-contracts/dist/index.js';
import { schema } from './libs/zrocket-contracts/dist/schema/index.js';

async function inspectSchema() {
    console.log('🔍 Inspecting schema structure...');
    
    try {
        // Get the table mappings
        const tableMappings = getTableMappings(schema);
        
        console.log('\n📊 Available tables:');
        for (const tableName of Object.keys(tableMappings)) {
            console.log(`   - ${tableName}`);
        }
        
        console.log('\n📋 Full table mappings:');
        console.log(JSON.stringify(tableMappings, null, 2));
        
        // Also check the raw schema structure
        console.log('\n🏗️ Schema structure:');
        console.log('Tables in schema:', Object.keys(schema.tables));
        
    } catch (error) {
        console.error('❌ Inspection failed:', error.message);
        throw error;
    }
}

// Run the inspection
inspectSchema().catch(error => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
});
