import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import imports from './features/index.js';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env']
        }),
        ...imports
    ]
})
export class AppModule {}
