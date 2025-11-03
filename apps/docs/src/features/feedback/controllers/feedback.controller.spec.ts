import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { FeedbackService } from '../services/index.js';
import type { SubmitFeedbackInput } from '../models/index.js';

import { FeedbackController } from './feedback.controller.js';

describe('FeedbackController', () => {
    let controller: FeedbackController;
    let service: FeedbackService;

    const mockFeedbackService = {
        submitFeedback: vi.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FeedbackController],
            providers: [
                {
                    provide: FeedbackService,
                    useValue: mockFeedbackService
                }
            ]
        }).compile();

        controller = module.get<FeedbackController>(FeedbackController);
        service = module.get<FeedbackService>(FeedbackService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('submitFeedback', () => {
        it('should call service.submitFeedback with DTO', async () => {
            const dto: SubmitFeedbackInput = {
                name: 'Test User',
                email: 'test@example.com',
                url: 'https://docs.example.com/test',
                opinion: 'good',
                message: 'Great docs!'
            };

            const expectedResult = {
                githubUrl: 'https://github.com/test/test/issues/1',
                issueNumber: 1
            };

            mockFeedbackService.submitFeedback.mockResolvedValue(
                expectedResult
            );

            const result = await controller.submitFeedback(dto);

            expect(service.submitFeedback).toHaveBeenCalledWith(dto);
            expect(result).toEqual(expectedResult);
        });

        it('should propagate service errors', async () => {
            const dto: SubmitFeedbackInput = {
                name: 'Test User',
                email: 'test@example.com',
                url: 'https://docs.example.com/test',
                opinion: 'bad',
                message: 'Needs improvement'
            };

            const error = new Error('Service error');
            mockFeedbackService.submitFeedback.mockRejectedValue(error);

            await expect(controller.submitFeedback(dto)).rejects.toThrow(
                'Service error'
            );
        });
    });
});
