import { Module } from '@nestjs/common';
import { ZRocketController } from './zrocket.controller.js';

@Module({
    controllers: [ZRocketController]
})
export class ZRocketModule {}