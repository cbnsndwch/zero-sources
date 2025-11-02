import type { ActionFunctionArgs } from 'react-router';

import { recordFeedback, type FeedbackPayload } from '@/lib/feedback';
import { assertRequestMethod } from '@/lib/guards';
import { clientError, internalServerError } from '@/lib/responses';

/**
 * API route to handle feedback submissions and create GitHub issues
 * Server-side only - uses process.env to keep secrets secure
 */
export async function action({ request }: ActionFunctionArgs) {
    assertRequestMethod(request, 'POST');

    try {
        const body = (await request.json()) as FeedbackPayload;
        const {
            name = 'Anonymous',
            email = 'anonymous@nope.lol',
            url,
            opinion,
            message
        } = body;

        // Validate input
        if (!email || !name || !message) {
            return clientError('Missing required fields');
        }

        const result = await recordFeedback({
            url,
            opinion,
            email,
            name,
            message
        });

        return result;
    } catch (error) {
        console.error('Error processing feedback:', error);
        return internalServerError('Failed to process feedback', error);
    }
}
