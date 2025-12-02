import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfigService } from '@nestjs/config';

import { FeedbackService } from './feedback.service.js';

// import type { SubmitFeedbackInput } from '../models/index.js';

describe('FeedbackService', () => {
    let service: FeedbackService;

    const configValues: Record<string, string> = {
        GITHUB_TOKEN: 'test-token',
        GITHUB_REPO_OWNER: 'test-owner',
        GITHUB_REPO_NAME: 'test-repo',
        DB_URL: 'http://test-db.com',
        DB_TOKEN: 'test-db-token',
        BASE_ID: 'test-base',
        USER_TABLE_ID: 'test-user-table',
        FEEDBACK_TABLE_ID: 'test-feedback-table'
    };

    const mockConfigService = {
        get: vi.fn((key: string, defaultValue?: string) => {
            return configValues[key] ?? defaultValue;
        })
    } as unknown as ConfigService;

    beforeEach(() => {
        // Reset the mock before each test
        vi.mocked(mockConfigService.get).mockClear();
        vi.mocked(mockConfigService.get).mockImplementation(
            (key: string, defaultValue?: string) => {
                return configValues[key as keyof typeof configValues] ?? defaultValue;
            }
        );

        // Directly instantiate the service with the mock
        service = new FeedbackService(mockConfigService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('submitFeedback', () => {
        it('should generate unique display names', () => {
            // Access private method via any for testing
            const name1 = (service as any).generateDisplayName();
            const name2 = (service as any).generateDisplayName();

            expect(name1).toBeTruthy();
            expect(name2).toBeTruthy();
            expect(name1).not.toBe(name2);
            // nanoid produces URL-safe characters including alphanumeric, -, and _
            expect(name1).toMatch(/^\w+ \w+ [a-zA-Z0-9_-]{5}$/);
        });

        it('should construct correct NocoDB URLs', () => {
            const usersUrl = (service as any).getUsersTableUrl();
            const feedbackUrl = (service as any).getFeedbackTableUrl();

            expect(usersUrl).toBe(
                'http://test-db.com/api/v3/data/test-base/test-user-table'
            );
            expect(feedbackUrl).toBe(
                'http://test-db.com/api/v3/data/test-base/test-feedback-table'
            );
        });

        // Add more tests for actual feedback submission with mocked fetch
        // and Octokit when implementing full test suite
    });
});
