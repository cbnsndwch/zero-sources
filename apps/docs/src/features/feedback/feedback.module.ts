import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FeedbackController } from './controllers/index.js';
import { FeedbackService } from './services/index.js';

/**
 * Module for feedback functionality
 * Handles documentation feedback submissions and GitHub issue creation
 */
@Module({
    imports: [ConfigModule],
    controllers: [FeedbackController],
    providers: [FeedbackService],
    exports: [FeedbackService]
})
export class FeedbackModule {}
