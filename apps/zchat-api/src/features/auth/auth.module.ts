import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import type { AppConfig } from '../../config/contracts.js';

import type { AuthConfig } from './config/auth-config.contracts.js';

import { githubAuthControllers } from './github/index.js';
import { jwtAuthServices } from './jwt/index.js';

@Global()
@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: async (configService: ConfigService<AppConfig>) => {
                const { jwt } = configService.get<AuthConfig>('auth')!;
                return {
                    secret: jwt.secret,
                    signOptions: {
                        expiresIn: jwt.tokenLifetime
                    }
                };
            }
        })
    ],
    controllers: [...githubAuthControllers],
    providers: [...jwtAuthServices],
    exports: [...jwtAuthServices]
})
export class AuthModule {}
