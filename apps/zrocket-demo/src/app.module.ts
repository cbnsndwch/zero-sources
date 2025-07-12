import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { ZRocketModule } from './features/zrocket/zrocket.module.js';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MongooseModule.forRoot(
            process.env.MONGODB_URI || 'mongodb://localhost:27017/zrocket-demo'
        ),
        ZRocketModule
    ]
})
export class AppModule {}