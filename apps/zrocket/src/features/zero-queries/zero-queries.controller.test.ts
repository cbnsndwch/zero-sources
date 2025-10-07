import { UnauthorizedException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request } from 'express';

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

        it('should return empty array when no queries requested (authenticated user)', async () => {
            // Arrange
            const mockContext = {
                sub: 'user-123',
                email: 'test@example.com',
                name: 'Test User'
            };

            // Express Request format with empty body array
            const mockRequest = {
                headers: {
                    authorization: 'Bearer valid-token'
                },
                body: [] // Zero protocol: array of query requests
            } as Request;

            vi.mocked(mockAuth.authenticateRequest).mockResolvedValue(
                mockContext
            );

            // Act
            const result = await controller.handleQueries(mockRequest);

            // Assert
            expect(mockAuth.authenticateRequest).toHaveBeenCalledWith(
                mockRequest
            );
            expect(result).toEqual([]); // Zero protocol: array response
        });

        it('should return array with query responses when queries requested', async () => {
            // Arrange
            const mockContext = {
                sub: 'user-123',
                email: 'test@example.com'
            };

            // Zero protocol: array of query requests
            const mockRequest = {
                headers: {
                    authorization: 'Bearer valid-token'
                },
                body: [
                    { id: 'q1', name: 'myChats', args: [] },
                    { id: 'q2', name: 'publicChannels', args: [] }
                ]
            } as Request;

            vi.mocked(mockAuth.authenticateRequest).mockResolvedValue(
                mockContext
            );

            // Act
            const result = await controller.handleQueries(mockRequest);

            // Assert
            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);
            expect(result[0]).toMatchObject({
                id: 'q1',
                name: 'myChats',
                ast: expect.any(Object)
            });
            expect(result[1]).toMatchObject({
                id: 'q2',
                name: 'publicChannels',
                ast: expect.any(Object)
            });
        });

        it('should handle anonymous requests (no auth header)', async () => {
            // Arrange
            const mockRequest = {
                headers: {},
                body: []
            } as Request;

            vi.mocked(mockAuth.authenticateRequest).mockResolvedValue(
                undefined
            );

            // Act
            const result = await controller.handleQueries(mockRequest);

            // Assert
            expect(mockAuth.authenticateRequest).toHaveBeenCalledWith(
                mockRequest
            );
            expect(result).toEqual([]); // Empty array for no queries
        });

        it('should propagate authentication errors', async () => {
            // Arrange
            const mockRequest = {
                headers: {
                    authorization: 'Bearer invalid-token'
                },
                body: []
            } as Request;

            vi.mocked(mockAuth.authenticateRequest).mockRejectedValue(
                new UnauthorizedException('Invalid token')
            );

            // Act & Assert
            await expect(controller.handleQueries(mockRequest)).rejects.toThrow(
                UnauthorizedException
            );
        });

        it('should handle missing body gracefully', async () => {
            // Arrange
            const mockContext = {
                sub: 'user-456',
                email: 'user@example.com'
            };

            // Request with no body (edge case)
            const mockRequest = {
                headers: {
                    authorization: 'Bearer token'
                }
                // No body property
            } as Request;

            vi.mocked(mockAuth.authenticateRequest).mockResolvedValue(
                mockContext
            );

            // Act
            const result = await controller.handleQueries(mockRequest);

            // Assert - should return empty array when body is undefined
            expect(Array.isArray(result)).toBe(true);
            expect(result).toEqual([]);
        });

        it('should include correct AST structure in response', async () => {
            // Arrange
            const mockRequest = {
                headers: {},
                body: [{ id: 'q1', name: 'myRooms', args: [] }]
            } as Request;

            vi.mocked(mockAuth.authenticateRequest).mockResolvedValue(
                undefined
            );

            // Act
            const result = await controller.handleQueries(mockRequest);

            // Assert - verify AST structure
            expect((result[0] as any).ast).toMatchObject({
                table: expect.any(String),
                where: expect.any(Array)
            });
        });
    });
});
