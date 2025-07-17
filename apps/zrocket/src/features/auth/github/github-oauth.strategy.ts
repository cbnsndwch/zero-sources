import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import type { AppConfig } from '../../../config/contracts.js';
import { UserService } from '../../users/services/user.service.js';

import type { AuthConfig } from '../config/auth-config.contracts.js';

import { Strategy, type GithubProfile } from './passport/index.js';

@Injectable()
export class GithubOauthStrategy extends PassportStrategy(Strategy, 'github') {
    #userService: UserService;

    constructor(
        configService: ConfigService<AppConfig>,
        usersService: UserService
    ) {
        const { github } = configService.get<AuthConfig>('auth')!;

        super({
            clientId: github.clientId,
            clientSecret: github.clientSecret,
            callbackURL: github.callbackUrl,
            scope: ['read:user', 'user:email']
        });

        this.#userService = usersService;
    }

    async validate(
        accessToken: string,
        _refreshToken: string,
        profile: GithubProfile
    ) {
        // For each strategy, Passport will call the verify function (implemented with this
        // `validate()` method in @nestjs/passport) using an appropriate strategy-specific set of
        // parameters. For the passport-github strategy Passport expects a `validate()` method with
        // the following signature:
        //   `validate(accessToken: string, refreshToken: string, profile: Profile): any`
        // As you can see from this, `validate()` receives the access token and optional refresh
        // token, as well as profile which contains the authenticated user's GitHub profile.
        // We can pass these information to find or create the user in our system.
        // The Passport library expects this method to return a full user if the validation
        // succeeds, or a null if it fails. When returning a user, Passport will complete its tasks
        // (e.g., creating the user property on the Request object), and the request
        // handling pipeline can continue.

        let user = await this.#userService.findByExternalId(
            `github/${profile.id}`
        );

        if (!user) {
            user = await this.#userService.create({
                name: profile.displayName,
                username: profile.username ?? `github_${profile.id}`,
                providerId: `github/${profile.id}`,
                email: profile.mainEmail,
                additionalEmails: profile.additionalEmails,
                avatarUrl: profile.photos?.length
                    ? profile.photos[0]
                    : undefined
            });
        }

        if (!user) {
            // TODO Depending on the concrete implementation of findOrCreate(), throwing the
            // UnauthorizedException here might not make sense...
            throw new UnauthorizedException();
        }

        return user;
    }
}
