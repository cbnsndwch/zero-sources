import { getTableMappings } from './libs/zero-contracts/dist/index.js';
import { schema } from './libs/zrocket-contracts/dist/schema/index.js';

async function debugSchema() {
    console.log('🔍 Debugging schema structure...');
    
    try {
        console.log('\n🏗️ Schema type:', typeof schema);
        console.log('🏗️ Schema keys:', Object.keys(schema));
        
        if (schema.tables) {
            console.log('\n📊 Tables structure:');
            for (const [tableName, tableBuilder] of Object.entries(schema.tables)) {
                console.log(`\n📄 Table: ${tableName}`);
                console.log(`   Type: ${typeof tableBuilder}`);
                console.log(`   Constructor: ${tableBuilder.constructor.name}`);
                console.log(`   Keys: ${Object.keys(tableBuilder)}`);
                
                // Check if it has the mapping symbol
                const symbols = Object.getOwnPropertySymbols(tableBuilder);
                console.log(`   Symbols: ${symbols.length} found`);
                for (const symbol of symbols) {
                    console.log(`     Symbol: ${symbol.toString()}`);
                }
            }
        }
        
        // Try extracting mappings anyway
        console.log('\n🧪 Attempting to extract mappings...');
        const tableMappings = getTableMappings(schema);
        console.log('Result:', tableMappings);
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the debug
debugSchema();
