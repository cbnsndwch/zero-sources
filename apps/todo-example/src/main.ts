import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS for frontend access
    app.enableCors({
        origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:5173'],
        credentials: true
    });

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
    }));

    // API documentation with Swagger
    const config = new DocumentBuilder()
        .setTitle('Todo Example API')
        .setDescription('A simple todo API demonstrating MongoDB change source integration with Zero')
        .setVersion('1.0')
        .build();
        
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const port = process.env.PORT || 3001;
    await app.listen(port);
    
    console.log(`🚀 Todo Example API is running on: http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api`);
    console.log(`🔄 Zero Change Stream: ws://localhost:${port}/changes/v0/stream`);
}

bootstrap().catch(err => {
    console.error('Failed to start the application:', err);
    process.exit(1);
});
