import 'dotenv/config';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';

import { corsDelegate } from '@cbnsndwch/zero-contracts';

import { AppModule } from './app.module.js';

import { mountReactRouterHandler } from './react-router.js';
import { NEST_LOG_LEVEL } from './utils/logger.js';
import { printStartupBanner } from './utils/startup.js';

const PORT = process.env.PORT ?? 8016;

const logger = new Logger('Bootstrap');

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        cors: corsDelegate,
        logger: NEST_LOG_LEVEL
    });

    // silence is golden
    app.disable('x-powered-by');

    // enable support for cookie auth
    app.use(cookieParser());

    // serve NestJS routes under `/api/*`
    app.setGlobalPrefix('api');

    // mount RR7 handler for frontend routes
    await mountReactRouterHandler(app);

    await app.listen(PORT);

    await printStartupBanner(app, logger);
}

void bootstrap();
