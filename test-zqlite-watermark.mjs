import { Test } from '@nestjs/testing';
import { ZqliteWatermarkModule, ZqliteWatermarkService } from './libs/zero-watermark-zqlite/dist/index.js';
import { TOKEN_WATERMARK_SERVICE } from './libs/zero-contracts/dist/index.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

async function testZqliteWatermarkService() {
    console.log('Testing ZQLite Watermark Service...');
    
    // Create a temporary database file
    const tempDbFile = path.join(os.tmpdir(), `test-watermark-${Date.now()}.db`);
    
    try {
        // Create a test module
        const module = await Test.createTestingModule({
            imports: [
                ZqliteWatermarkModule.forRootAsync({
                    useFactory: () => ({
                        file: tempDbFile
                    })
                })
            ]
        }).compile();

        const watermarkService = module.get(TOKEN_WATERMARK_SERVICE);
        console.log('✓ Watermark service created successfully');

        // Test creating a new watermark
        const shardId = 'test-shard';
        const resumeToken = 'test-resume-token-123';
        
        console.log('Testing getOrCreateWatermark...');
        const watermark1 = await watermarkService.getOrCreateWatermark(shardId, resumeToken);
        console.log(`✓ Created watermark: ${watermark1}`);

        // Test retrieving existing watermark
        const watermark2 = await watermarkService.getOrCreateWatermark(shardId, resumeToken);
        console.log(`✓ Retrieved existing watermark: ${watermark2}`);
        
        if (watermark1 !== watermark2) {
            throw new Error('Watermarks should be the same for the same resume token');
        }
        console.log('✓ Watermark consistency test passed');

        // Test retrieving resume token
        console.log('Testing getResumeToken...');
        const retrievedResumeToken = await watermarkService.getResumeToken(shardId, watermark1);
        console.log(`✓ Retrieved resume token: ${retrievedResumeToken}`);
        
        if (retrievedResumeToken !== resumeToken) {
            throw new Error(`Resume token mismatch: expected ${resumeToken}, got ${retrievedResumeToken}`);
        }
        console.log('✓ Resume token retrieval test passed');

        // Test creating multiple watermarks for different resume tokens
        console.log('Testing multiple watermarks...');
        const resumeToken2 = 'test-resume-token-456';
        const watermark3 = await watermarkService.getOrCreateWatermark(shardId, resumeToken2);
        console.log(`✓ Created second watermark: ${watermark3}`);
        
        if (watermark1 === watermark3) {
            throw new Error('Different resume tokens should create different watermarks');
        }
        console.log('✓ Multiple watermarks test passed');

        // Clean up
        await module.close();
        console.log('✓ Module closed successfully');
        
        console.log('\n🎉 All ZQLite Watermark Service tests passed!');
        
    } finally {
        // Clean up the temporary file
        try {
            if (fs.existsSync(tempDbFile)) {
                fs.unlinkSync(tempDbFile);
                console.log('✓ Temporary database file cleaned up');
            }
        } catch (err) {
            console.warn('⚠️ Could not clean up temporary file:', err.message);
        }
    }
}

// Run the test
testZqliteWatermarkService().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});
