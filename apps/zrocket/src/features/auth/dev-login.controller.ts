import { Controller, Get, Logger, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Response } from 'express';

import { JwtAuthService } from './jwt/jwt-auth.service.js';

/**
 * Dev-only authentication controller for testing
 * @security This controller should NEVER be enabled in production
 */
@ApiExcludeController()
@Controller('auth/dev')
export class DevLoginController {
    private readonly logger = new Logger(DevLoginController.name);

    constructor(private jwtAuthService: JwtAuthService) {}

    /**
     * Creates a test user JWT for development
     * GET /api/auth/dev/login
     */
    @Get('login')
    async devLogin(@Res() res: Response) {
        if (process.env.NODE_ENV === 'production') {
            return res
                .status(403)
                .json({ error: 'Dev login not available in production' });
        }

        const testUser = {
            _id: '68e18a8f2ed4c8dc278ad599',
            username: 'alice.johnson',
            name: 'Alice Johnson',
            email: 'alice.johnson@example.com',
            role: 'user'
        } as any;

        const { accessToken } = this.jwtAuthService.login(testUser);

        // Set cookie with settings for localhost:port
        res.cookie('jwt', accessToken, {
            httpOnly: false, // Allow JS access for dev (so we can debug)
            secure: false, // Required for localhost HTTP
            sameSite: 'lax', // Important for SSR redirects
            path: '/', // Important: must be available to all routes
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
            // Don't set domain - let browser use current domain (localhost:8011)
        });

        this.logger.verbose(
            `Setting cookie on domain: ${res.req.headers.host}`
        );
        this.logger.verbose(
            `Cookie settings: httpOnly=false, secure=false, sameSite=lax, path=/`
        );

        // Redirect to home page so the cookie is picked up
        return res.redirect('/');
    }

    /**
     * Clears the JWT cookie
     * GET /api/auth/dev/logout
     */
    @Get('logout')
    async devLogout(@Res() res: Response) {
        if (process.env.NODE_ENV === 'production') {
            return res
                .status(403)
                .json({ error: 'Dev logout not available in production' });
        }

        res.clearCookie('jwt', { path: '/' });

        // Redirect to home after logout
        return res.redirect('/');
    }

    /**
     * Check current auth status
     * GET /api/auth/dev/status
     */
    @Get('status')
    async devStatus(@Res({ passthrough: true }) res: Response) {
        if (process.env.NODE_ENV === 'production') {
            return { error: 'Dev status not available in production' };
        }

        const jwt = (res.req as any).cookies?.jwt;

        return {
            authenticated: !!jwt,
            jwt: jwt ? 'JWT token present' : 'No JWT token found',
            message: jwt
                ? 'You are authenticated. JWT cookie is set.'
                : 'You are not authenticated. Visit /api/auth/dev/login to get a JWT.'
        };
    }
}
