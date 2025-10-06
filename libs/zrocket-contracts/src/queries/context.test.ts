import { describe, it, expect } from 'vitest';
import { isAuthenticated, type QueryContext } from './context.js';

describe('QueryContext', () => {
    describe('type definitions', () => {
        it('should compile with required fields only', () => {
            const ctx: QueryContext = {
                sub: 'user123',
                email: 'user@example.com'
            };
            expect(ctx.sub).toBe('user123');
            expect(ctx.email).toBe('user@example.com');
        });

        it('should compile with all optional fields', () => {
            const ctx: QueryContext = {
                sub: 'user123',
                email: 'user@example.com',
                name: 'Test User',
                preferred_username: 'testuser',
                picture: 'https://example.com/avatar.jpg',
                roles: ['admin', 'moderator']
            };
            expect(ctx.name).toBe('Test User');
            expect(ctx.preferred_username).toBe('testuser');
            expect(ctx.picture).toBe('https://example.com/avatar.jpg');
            expect(ctx.roles).toEqual(['admin', 'moderator']);
        });

        it('should allow single role in roles array', () => {
            const ctx: QueryContext = {
                sub: 'user123',
                email: 'user@example.com',
                roles: ['user']
            };
            expect(ctx.roles).toEqual(['user']);
        });

        it('should allow multiple roles', () => {
            const ctx: QueryContext = {
                sub: 'user123',
                email: 'user@example.com',
                roles: ['user', 'admin', 'moderator']
            };
            expect(ctx.roles?.length).toBe(3);
        });
    });

    describe('isAuthenticated', () => {
        it('should return true for valid context with required fields', () => {
            const ctx: QueryContext = {
                sub: 'user123',
                email: 'user@example.com'
            };
            expect(isAuthenticated(ctx)).toBe(true);
        });

        it('should return false for undefined context', () => {
            const ctx: QueryContext | undefined = undefined;
            expect(isAuthenticated(ctx)).toBe(false);
        });

        it('should return false for context with empty sub', () => {
            const ctx = {
                sub: '',
                email: 'user@example.com'
            } as QueryContext;
            expect(isAuthenticated(ctx)).toBe(false);
        });

        it('should narrow type correctly in type guard', () => {
            const ctx: QueryContext | undefined = {
                sub: 'user123',
                email: 'user@example.com',
                preferred_username: 'testuser'
            };

            if (isAuthenticated(ctx)) {
                // TypeScript should know ctx is QueryContext here, not undefined
                // This should compile without errors
                const userId: string = ctx.sub;
                const email: string = ctx.email;
                expect(userId).toBe('user123');
                expect(email).toBe('user@example.com');
            }
        });

        it('should work with authenticated context with all properties', () => {
            const ctx: QueryContext = {
                sub: 'user123',
                email: 'admin@example.com',
                name: 'Admin User',
                preferred_username: 'admin',
                picture: 'https://example.com/admin.jpg',
                roles: ['admin']
            };
            expect(isAuthenticated(ctx)).toBe(true);
            if (isAuthenticated(ctx)) {
                expect(ctx.name).toBe('Admin User');
                expect(ctx.roles).toContain('admin');
            }
        });
    });
});
