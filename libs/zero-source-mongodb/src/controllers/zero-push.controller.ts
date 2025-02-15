import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import type { JSONObject } from '@rocicorp/zero';

import { ZeroPusherAuthGuard } from '../guards/index.js';

@ApiTags('zero/push')
@UseGuards(ZeroPusherAuthGuard)
@Controller('zero/push')
export class ZeroPushController {
    #logger = new Logger(ZeroPushController.name);

    @Post('v0')
    async push(@Body() input: JSONObject) {
        this.#logger.debug('push input', input);

        return Promise.resolve({ msg: 'ok' });
    }
}
