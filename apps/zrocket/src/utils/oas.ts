import path from 'node:path';

import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwaggerUi(app: NestExpressApplication) {
    // serve static assets (if any)
    app.useStaticAssets(path.resolve('public'));

    const options = new DocumentBuilder()
        .setTitle('ZChat')
        .setDescription('A Zero-powered chat app inspired by RocketChat')
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
        customSiteTitle: 'ZChat API Docs',
        customCssUrl: '/css/oas-theme.css'
    });
}
