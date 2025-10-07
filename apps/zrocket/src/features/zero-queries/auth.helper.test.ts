import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request as ExpressRequest } from 'express';
import type { JwtPayload } from '@cbnsndwch/zrocket-contracts';

import { ZeroQueryAuth } from './auth.helper.js';

describe('ZeroQueryAuth - Basic Tests', () => {
    let authHelper: ZeroQueryAuth;
    let mockVerifyAsync: ReturnType<typeof vi.fn>;

    // Sample valid JWT payload
    const validPayload: JwtPayload = {
        sub: '68e18a8f2ed4c8dc278ad599',
        email: 'alice@example.com',
        name: 'Alice Johnson',
        preferred_username: 'alice.johnson',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    };

    beforeEach(() => {
        // Create a fresh mock for each test
        mockVerifyAsync = vi.fn();

        // Create the auth helper with the mocked JWT service
        const jwtService = {
            verifyAsync: mockVerifyAsync
        } as unknown as JwtService;

        authHelper = new ZeroQueryAuth(jwtService);
    });

    describe('valid JWT tokens', () => {
        it('should return QueryContext for valid Bearer token', async () => {
            // Arrange
            const mockRequest = {
                headers: {
                    authorization: 'Bearer valid.jwt.token'
                }
            } as unknown as ExpressRequest;

            mockVerifyAsync.mockResolvedValue(validPayload);

            // Act
            const result = await authHelper.authenticateRequest(mockRequest);

            // Assert
            expect(result).toEqual(validPayload);
            expect(mockVerifyAsync).toHaveBeenCalledWith('valid.jwt.token');
        });

        it('should handle token with extra whitespace', async () => {
            // Arrange
            const mockRequest = {
                headers: {
                    authorization: 'Bearer   valid.jwt.token   '
                }
            } as unknown as ExpressRequest;

            mockVerifyAsync.mockResolvedValue(validPayload);

            // Act
            const result = await authHelper.authenticateRequest(mockRequest);

            // Assert
            expect(result).toEqual(validPayload);
            expect(mockVerifyAsync).toHaveBeenCalledWith('valid.jwt.token');
        });

        it('should preserve all JWT claims', async () => {
            // Arrange
            const payloadWithRoles: JwtPayload = {
                ...validPayload,
                roles: ['user', 'moderator'],
                picture: 'https://example.com/avatar.jpg'
            };

            const mockRequest = {
                headers: {
                    authorization: 'Bearer valid.jwt.token'
                }
            } as unknown as ExpressRequest;

            mockVerifyAsync.mockResolvedValue(payloadWithRoles);

            // Act
            const result = await authHelper.authenticateRequest(mockRequest);

            // Assert
            expect(result).toEqual(payloadWithRoles);
            expect(result?.roles).toEqual(['user', 'moderator']);
            expect(result?.picture).toBe('https://example.com/avatar.jpg');
        });
    });

    describe('missing Authorization header', () => {
        it('should return undefined for anonymous access', async () => {
            // Arrange
            const mockRequest = {
                headers: {}
            } as unknown as ExpressRequest;

            // Act
            const result = await authHelper.authenticateRequest(mockRequest);

            // Assert
            expect(result).toBeUndefined();
            expect(mockVerifyAsync).not.toHaveBeenCalled();
        });

        it('should return undefined when header is empty string', async () => {
            // Arrange
            const mockRequest = {
                headers: {
                    authorization: ''
                }
            } as unknown as ExpressRequest;

            // Act
            const result = await authHelper.authenticateRequest(mockRequest);

            // Assert
            expect(result).toBeUndefined();
            expect(mockVerifyAsync).not.toHaveBeenCalled();
        });
    });

    describe('malformed Authorization header', () => {
        it('should throw for missing Bearer prefix', async () => {
            // Arrange
            const mockRequest = {
                headers: {
                    authorization: 'valid.jwt.token'
                }
            } as unknown as ExpressRequest;

            // Act & Assert
            await expect(
                authHelper.authenticateRequest(mockRequest)
            ).rejects.toThrow(UnauthorizedException);
            await expect(
                authHelper.authenticateRequest(mockRequest)
            ).rejects.toThrow('Invalid authorization header format');
            expect(mockVerifyAsync).not.toHaveBeenCalled();
        });

        it('should throw for empty token after Bearer', async () => {
            // Arrange
            const mockRequest = {
                headers: {
                    authorization: 'Bearer '
                }
            } as unknown as ExpressRequest;

            // Act & Assert
            await expect(
                authHelper.authenticateRequest(mockRequest)
            ).rejects.toThrow(UnauthorizedException);
            await expect(
                authHelper.authenticateRequest(mockRequest)
            ).rejects.toThrow('Authorization header contains empty token');
            expect(mockVerifyAsync).not.toHaveBeenCalled();
        });
    });

    describe('invalid or expired tokens', () => {
        it('should throw for expired token', async () => {
            // Arrange
            const mockRequest = {
                headers: {
                    authorization: 'Bearer expired.jwt.token'
                }
            } as unknown as ExpressRequest;

            mockVerifyAsync.mockRejectedValue(new Error('jwt expired'));

            // Act & Assert
            await expect(
                authHelper.authenticateRequest(mockRequest)
            ).rejects.toThrow(UnauthorizedException);
            await expect(
                authHelper.authenticateRequest(mockRequest)
            ).rejects.toThrow('Invalid or expired authentication token');
        });

        it('should throw for invalid signature', async () => {
            // Arrange
            const mockRequest = {
                headers: {
                    authorization: 'Bearer invalid.jwt.token'
                }
            } as unknown as ExpressRequest;

            mockVerifyAsync.mockRejectedValue(new Error('invalid signature'));

            // Act & Assert
            await expect(
                authHelper.authenticateRequest(mockRequest)
            ).rejects.toThrow(UnauthorizedException);
            await expect(
                authHelper.authenticateRequest(mockRequest)
            ).rejects.toThrow('Invalid or expired authentication token');
        });
    });
});
