import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { IUser } from '../../chat/contracts/index.js';

import type { JwtPayload } from './contracts.js';

@Injectable()
export class JwtAuthService {
    constructor(private jwtService: JwtService) {}

    login(user: IUser) {
        const payload: JwtPayload = {
            sub: user._id.toString(),
            name: user.name,
            email: user.email,
            preferred_username: user.username
        };

        return {
            accessToken: this.jwtService.sign(payload)
        };
    }
}
