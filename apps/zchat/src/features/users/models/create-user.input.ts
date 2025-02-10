import { PickType } from '@nestjs/swagger';

import { User } from '../entities/user.entity.js';

export class CreateUserInput extends PickType(User, [
    'name',
    'username',
    'email',
    'additionalEmails',
    'avatarUrl',
    'providerId'
] as const) {}
