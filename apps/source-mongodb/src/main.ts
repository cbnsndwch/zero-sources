import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';

import { AppModule } from './app.module.js';
import { corsDelegate } from './utils/cors.js';

const logger = new Logger('Bootstrap');

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        cors: corsDelegate
    });

    app.useWebSocketAdapter(new WsAdapter(app));

    await app.listen(process.env.PORT ?? 8000);

    logger.log(`Application is running on: ${await app.getUrl()}`);
}

void bootstrap();
