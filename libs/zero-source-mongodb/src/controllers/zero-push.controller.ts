import {
    Body,
    Controller,
    Logger,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import type { ServerMutationBody } from '../contracts/mutation.contracts.js';
import { ZeroPusherAuthGuard } from '../guards/index.js';

import { PushProcessorV1 } from '../v0/custom-mutators/push-processor.js';

@ApiTags('zero/push')
@Controller('zero/push')
@UseGuards(ZeroPusherAuthGuard)
export class ZeroPushController {
    #logger = new Logger(ZeroPushController.name);

    #push: PushProcessorV1;

    constructor(push: PushProcessorV1) {
        this.#push = push;
    }

    @Post('v0')
    async push(
        @Query() query: { schema: string; appID: string }, // Updated type annotation
        @Body() body: ServerMutationBody
    ) {
        this.#logger.debug('push input', body);

        const result = await this.#push.process(query, body);

        return result;
    }
}
