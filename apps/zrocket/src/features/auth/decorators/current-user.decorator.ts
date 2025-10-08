import {
    createParamDecorator,
    UnauthorizedException,
    type ExecutionContext
} from '@nestjs/common';

import type { JwtPayload } from '@cbnsndwch/zrocket-contracts';

export const CurrentUser = createParamDecorator(
    (_data: unknown, context: ExecutionContext): JwtPayload => {
        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            throw new UnauthorizedException(
                'This endpoint requires authentication'
            );
        }

        // const parseResult = validationSchema.safeParse(user);
        // if (!parseResult.success) {
        //     throw new ForbiddenException('Invalid token');
        // }

        return user;
    }
);
