import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtPayload } from '@cbnsndwch/zrocket-contracts';

import type { AppConfig } from '../../../config/contracts.js';
import type { AuthConfig } from '../config/auth-config.contracts.js';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
    #logger = new Logger(JwtAuthStrategy.name);

    constructor(private configService: ConfigService<AppConfig>) {
        super({
            // available options: https://github.com/mikenicholson/passport-jwt#configure-strategy
            jwtFromRequest: ExtractJwt.fromExtractors([
                // the client can the JWT token either as a bearer token in the authorization header
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                // OR in a cookie named "jwt"
                (request: Request) => request?.cookies?.jwt ?? null
            ]),
            secretOrKey: configService.get<AuthConfig>('auth')!.jwt.secret,
            ignoreExpiration: false
        });
    }

    async validate(payload: JwtPayload) {
        // For the jwt-strategy, Passport first verifies the JWT's signature and decodes the JSON.
        // It then invokes our validate() method passing the decoded JSON as its single parameter.
        // Based on the way JWT signing works, we're guaranteed that we're receiving a valid token
        // that we have previously signed and issued to a valid user.
        // `payload` is that what JwtAuthService#login() has created and what thereafter
        // GithubOauthController#githubAuthCallback() has saved as cookie named "jwt".

        this.#logger.verbose(
            `${JwtAuthStrategy.name}#${this.validate.name}(): payload = ${JSON.stringify(payload)}`
        );

        // Passport assigns the value we return from this method to the Request object as `req.user`.
        // AppController#getProfile() uses this as an example.
        return payload;
    }
}
