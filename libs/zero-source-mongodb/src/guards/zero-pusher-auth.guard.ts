import { CanActivate, ExecutionContext } from '@nestjs/common';

export class ZeroPusherAuthGuard implements CanActivate {
    constructor() {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        await Promise.resolve();

        const request = context.switchToHttp().getRequest();

        const jwt = request.headers.authorization?.replace('Bearer ', '');
        const apiKey = request.headers['x-api-key'];

        if (!jwt && !apiKey) {
            return false;
        }

        return true;
    }
}
