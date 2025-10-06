import { describe, it, expect } from 'vitest';
import { isAuthenticated, type QueryContext } from './context.js';

describe('QueryContext', () => {
    describe('type definitions', () => {
        it('should compile with valid QueryContext', () => {
            const ctx: QueryContext = {
                userID: 'user123'
            };
            expect(ctx.userID).toBe('user123');
        });

        it('should compile with optional role and username', () => {
            const ctx: QueryContext = {
                userID: 'user123',
                role: 'admin',
                username: 'testuser'
            };
            expect(ctx.role).toBe('admin');
            expect(ctx.username).toBe('testuser');
        });

        it('should allow user role', () => {
            const ctx: QueryContext = {
                userID: 'user123',
                role: 'user'
            };
            expect(ctx.role).toBe('user');
        });
    });

    describe('isAuthenticated', () => {
        it('should return true for valid context with userID', () => {
            const ctx: QueryContext = {
                userID: 'user123'
            };
            expect(isAuthenticated(ctx)).toBe(true);
        });

        it('should return false for undefined context', () => {
            const ctx: QueryContext | undefined = undefined;
            expect(isAuthenticated(ctx)).toBe(false);
        });

        it('should return false for context with empty userID', () => {
            const ctx = {
                userID: ''
            } as QueryContext;
            expect(isAuthenticated(ctx)).toBe(false);
        });

        it('should narrow type correctly in type guard', () => {
            const ctx: QueryContext | undefined = {
                userID: 'user123',
                username: 'testuser'
            };

            if (isAuthenticated(ctx)) {
                // TypeScript should know ctx is QueryContext here, not undefined
                // This should compile without errors
                const userId: string = ctx.userID;
                expect(userId).toBe('user123');
            }
        });

        it('should work with authenticated context with all properties', () => {
            const ctx: QueryContext = {
                userID: 'user123',
                role: 'admin',
                username: 'Admin User'
            };
            expect(isAuthenticated(ctx)).toBe(true);
            if (isAuthenticated(ctx)) {
                expect(ctx.username).toBe('Admin User');
            }
        });
    });
});
