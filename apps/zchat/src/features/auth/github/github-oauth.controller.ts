import { Controller, Get, Logger, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { IUser } from '../../chat/contracts/index.js';

import { GithubOauthGuard } from './github-oauth.guard.js';
import { JwtAuthService } from '../jwt/jwt-auth.service.js';

@ApiTags('auth')
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
    async githubAuthCallback(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        // Passport automatically creates a `user` object, based on the return value of our
        // GithubOauthStrategy#validate() method, and assigns it to the Request object as `req.user`
        const user = req.user as IUser;

        this.#logger.verbose(
            `GET /auth/github/callback: req.user = ${JSON.stringify(user)}`
        );

        const { accessToken } = this.#jwtAuthService.login(user);
        res.cookie('jwt', accessToken);

        return { accessToken };
    }
}
