import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { NestExpressApplication } from '@nestjs/platform-express';

import { ZRocketAppModule } from './zrocket-app.module.js';

import { corsDelegate } from './utils/cors.js';
import { setupSwaggerUi } from './utils/oas.js';
import { printStartupBanner } from './utils/startup.js';

const PORT = process.env.PORT ?? 8011; // Different port to avoid conflicts

const logger = new Logger('ZRocket Bootstrap');

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(
        ZRocketAppModule,
        { cors: corsDelegate }
    );

    app.useWebSocketAdapter(new WsAdapter(app));

    setupSwaggerUi(app);

    await app.listen(PORT);

    logger.log('🚀 ZRocket Demo App with Discriminated Union Tables');
    logger.log('📊 Multiple Zero tables created from MongoDB collections');
    logger.log('🔗 API Documentation: http://localhost:' + PORT + '/api-docs');
    logger.log(`🎯 Demo endpoint: http://localhost:${PORT}/zrocket/demo-info`);

    await printStartupBanner(app, logger);
}

void bootstrap();
