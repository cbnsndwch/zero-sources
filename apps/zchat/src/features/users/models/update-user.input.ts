import { PartialType } from '@nestjs/mapped-types';

import { CreateUserInput } from './create-user.input.js';

export class UpdateUserInput extends PartialType(CreateUserInput) {}
