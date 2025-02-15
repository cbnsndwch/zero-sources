import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module.js';

import { corsDelegate } from './utils/cors.js';
import { setupSwaggerUi } from './utils/oas.js';
import { printStartupBanner } from './utils/startup.js';

const PORT = process.env.PORT ?? 8011;

const logger = new Logger('Bootstrap');

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        cors: corsDelegate
    });

    app.useWebSocketAdapter(new WsAdapter(app));

    setupSwaggerUi(app);

    await app.listen(PORT);

    await printStartupBanner(app, logger);
}

void bootstrap();
