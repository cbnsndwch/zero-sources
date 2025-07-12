import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ZRocketDemoController } from './features/zrocket/controllers/zrocket-demo.controller.js';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        })
    ],
    controllers: [
        ZRocketDemoController
    ]
})
export class DemoAppModule {}