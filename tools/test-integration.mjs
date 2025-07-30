import { Test } from '@nestjs/testing';
import { TOKEN_WATERMARK_SERVICE } from '@cbnsndwch/zero-contracts';

import { zrocketGlobalModules } from '../apps/zrocket/src/features/global-modules.js';

async function testZRocketGlobalModules() {
    console.log('Testing ZRocket Global Modules Integration...');
    
    try {
        // Set up some minimal environment variables for the test
        process.env.ZERO_AUTH_TOKEN = 'test-token';
        process.env.ZERO_KV_PROVIDER = 'zqlite';
        process.env.ZERO_KV_ZQLITE_FILE = './test-kv.db';
        process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
        
        const module = await Test.createTestingModule({
            imports: zrocketGlobalModules
        }).compile();

        // Test that the watermark service is available
        const watermarkService = module.get(TOKEN_WATERMARK_SERVICE);
        console.log('✓ Watermark service successfully injected');
        console.log(`✓ Service type: ${watermarkService.constructor.name}`);

        // Clean up
        await module.close();
        console.log('✓ Module closed successfully');
        
        console.log('\n🎉 ZRocket Global Modules integration test passed!');
        
    } catch (error) {
        console.error('❌ Integration test failed:', error);
        throw error;
    }
}

// Run the test
testZRocketGlobalModules().catch(error => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
});
