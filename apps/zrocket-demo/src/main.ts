import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';

import { AppModule } from './app.module.js';

const logger = new Logger('ZRocket Bootstrap');

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        cors: true
    });

    app.useWebSocketAdapter(new WsAdapter(app));

    await app.listen(process.env.PORT ?? 8001);

    logger.log(`ZRocket Demo App is running on: ${await app.getUrl()}`);
}

void bootstrap();