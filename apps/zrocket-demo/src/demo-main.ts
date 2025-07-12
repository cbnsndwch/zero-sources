import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { DemoAppModule } from './demo-app.module.js';

const logger = new Logger('ZRocket Demo Bootstrap');

async function bootstrap() {
    const app = await NestFactory.create(DemoAppModule, {
        cors: true
    });

    await app.listen(process.env.PORT ?? 8001);

    logger.log(`ZRocket Demo (without MongoDB) is running on: ${await app.getUrl()}`);
    logger.log(`Visit http://localhost:${process.env.PORT ?? 8001}/zrocket to see the discriminated union demo`);
}

void bootstrap();