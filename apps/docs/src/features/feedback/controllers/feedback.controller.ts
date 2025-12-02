import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    ValidationPipe
} from '@nestjs/common';

import type { SubmitFeedbackInput } from '../models/index.js';
import { FeedbackService } from '../services/index.js';

/**
 * Controller for handling feedback submissions
 * Provides API endpoints for users to submit documentation feedback
 */
@Controller('feedback')
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) {}

    /**
     * Submit feedback about documentation
     * Creates a GitHub issue and stores feedback in NocoDB
     *
     * @param input - Feedback submission data
     * @returns GitHub issue URL and number
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async submitFeedback(
        @Body(new ValidationPipe({ transform: true, whitelist: true }))
        input: SubmitFeedbackInput
    ) {
        const result = await this.feedbackService.submitFeedback(input);

        return result;
    }
}
