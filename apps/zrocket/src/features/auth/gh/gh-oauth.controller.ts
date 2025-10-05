import type { IUser } from '@cbnsndwch/zrocket-contracts';
import { Controller, Get, Logger, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { JwtAuthService } from '../jwt/jwt-auth.service.js';

import { GithubOauthGuard } from './gh-oauth.guard.js';

@ApiTags('auth/github')
@Controller('auth/github')
export class GithubOauthController {
    #logger = new Logger(GithubOauthController.name);

    #jwtAuthService: JwtAuthService;

    constructor(jwtAuthService: JwtAuthService) {
        this.#jwtAuthService = jwtAuthService;
    }

    @Get()
    @UseGuards(GithubOauthGuard)
    async githubAuth() {
        // With `@UseGuards(GithubOauthGuard)` we are using an AuthGuard that @nestjs/passport
        // automatically provisioned for us when we extended the passport-github strategy.
        // The Guard initiates the passport-github flow.
    }

    @Get('callback')
    @ApiOperation({ operationId: 'githubOAuthCallback' })
    @UseGuards(GithubOauthGuard)
    async githubAuthCallback(@Req() req: Request, @Res() res: Response) {
        // Passport automatically creates a `user` object, based on the return value of our
        // GithubOauthStrategy#validate() method, and assigns it to the Request object as `req.user`
        const user = req.user as IUser;

        this.#logger.verbose(
            `GET /auth/github/callback: req.user = ${JSON.stringify(user)}`
        );

        const { accessToken } = this.#jwtAuthService.login(user);
        res.cookie('jwt', accessToken, {
            httpOnly: false, // Allow JS access for debugging
            secure: false, // Required for localhost HTTP
            sameSite: 'lax', // Important for SSR redirects
            path: '/', // Available to all routes
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
            // Don't set domain - let browser use current domain (localhost:8011)
        });

        this.#logger.verbose(`Setting cookie on domain: ${req.headers.host}`);

        // Redirect to home after successful auth
        return res.redirect('/');
    }
}
