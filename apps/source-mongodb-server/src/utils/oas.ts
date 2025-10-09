import path from 'node:path';

import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwaggerUi(app: NestExpressApplication) {
    // serve static assets (if any)
    app.useStaticAssets(path.resolve('public'));

    const options = new DocumentBuilder()
        .setTitle('Zero Source Mongo')
        .setDescription('A MongoDB Custom Source for Zero Cache')
        .setVersion('0.1.0')
        .addBasicAuth()
        .addBearerAuth()
        //    .addSecurityRequirements('bearer')
        .build();

    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup('docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true
        },
        customSiteTitle: 'Zero Source Mongo API Docs',
        customCssUrl: '/css/oas-theme.css'
    });
}
