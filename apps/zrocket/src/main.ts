import 'dotenv/config';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { WsAdapter } from '@nestjs/platform-ws';
import { corsDelegate } from '@cbnsndwch/zero-contracts';

import { AppModule } from './app.module.js';
import { mountReactRouterHandler } from './react-router.js';
import { setupSwaggerUi } from './utils/oas.js';
import { printStartupBanner } from './utils/startup.js';

const PORT = process.env.PORT ?? 8011;

const logger = new Logger('Bootstrap');

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        cors: corsDelegate
    });

    app.useWebSocketAdapter(new WsAdapter(app));

    // Set API prefix for NestJS routes
    app.setGlobalPrefix('api');

    setupSwaggerUi(app);

    // Mount React Router handler for frontend routes
    await mountReactRouterHandler(app);

    await app.listen(PORT);

    await printStartupBanner(app, logger);
}

void bootstrap();
