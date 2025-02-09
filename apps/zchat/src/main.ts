import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module.js';
import { corsDelegate } from './utils/cors.js';
import { makeTable } from './utils/string-utils.js';
import { setupSwaggerUi } from './utils/oas.js';

const PORT = process.env.PORT ?? 8000;

const logger = new Logger('Bootstrap');

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        cors: corsDelegate
    });

    app.useWebSocketAdapter(new WsAdapter(app));

    setupSwaggerUi(app);

    await app.listen(PORT);

    const baseUrl = await app.getUrl();
    const banner = makeTable(
        {
            'Base URL': baseUrl,
            SwaggerUI: `${baseUrl}/docs`
        },
        `🚀 Server running 🚀`
    );
    banner.forEach(line => logger.log(line));
}

void bootstrap();
