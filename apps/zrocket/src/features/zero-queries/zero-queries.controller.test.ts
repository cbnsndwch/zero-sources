import { UnauthorizedException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ZeroQueryAuth } from './auth.helper.js';
import { ZeroQueriesController } from './zero-queries.controller.js';

describe('ZeroQueriesController', () => {
    let controller: ZeroQueriesController;
    let mockAuth: ZeroQueryAuth;

    beforeEach(() => {
        // Create mock authentication helper
        mockAuth = {
            authenticateRequest: vi.fn()
        } as unknown as ZeroQueryAuth;

        // Create controller instance with mocked auth
        controller = new ZeroQueriesController(mockAuth);
    });

    describe('handleQueries', () => {
        it('should be defined', () => {
            expect(controller).toBeDefined();
            expect(controller.handleQueries).toBeDefined();
        });

        it('should authenticate request and return response for authenticated user', async () => {
            // Arrange
            const mockContext = {
                sub: 'user-123',
                email: 'test@example.com',
                name: 'Test User'
            };

            const mockRequest = new Request('http://localhost/api/zero/get-queries', {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer valid-token',
                    'Content-Type': 'application/json'
                }
            });

            vi.mocked(mockAuth.authenticateRequest).mockResolvedValue(
                mockContext
            );

            // Act
            const result = await controller.handleQueries(mockRequest);

            // Assert
            expect(mockAuth.authenticateRequest).toHaveBeenCalledWith(
                mockRequest
            );
            expect(result).toEqual({
                queries: {},
                timestamp: expect.any(Number)
            });
        });

        it('should handle anonymous requests (no auth header)', async () => {
            // Arrange
            const mockRequest = new Request('http://localhost/api/zero/get-queries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            vi.mocked(mockAuth.authenticateRequest).mockResolvedValue(
                undefined
            );

            // Act
            const result = await controller.handleQueries(mockRequest);

            // Assert
            expect(mockAuth.authenticateRequest).toHaveBeenCalledWith(
                mockRequest
            );
            expect(result).toEqual({
                queries: {},
                timestamp: expect.any(Number)
            });
        });

        it('should propagate authentication errors', async () => {
            // Arrange
            const mockRequest = new Request('http://localhost/api/zero/get-queries', {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer invalid-token',
                    'Content-Type': 'application/json'
                }
            });

            vi.mocked(mockAuth.authenticateRequest).mockRejectedValue(
                new UnauthorizedException('Invalid token')
            );

            // Act & Assert
            await expect(
                controller.handleQueries(mockRequest)
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should return response with queries and timestamp', async () => {
            // Arrange
            const mockContext = {
                sub: 'user-456',
                email: 'user@example.com'
            };

            const mockRequest = new Request('http://localhost/api/zero/get-queries', {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer token',
                    'Content-Type': 'application/json'
                }
            });

            vi.mocked(mockAuth.authenticateRequest).mockResolvedValue(
                mockContext
            );

            // Act
            const result = await controller.handleQueries(mockRequest);

            // Assert
            expect(result).toHaveProperty('queries');
            expect(result).toHaveProperty('timestamp');
            expect(typeof (result as any).timestamp).toBe('number');
            expect((result as any).timestamp).toBeGreaterThan(0);
        });
    });
});
