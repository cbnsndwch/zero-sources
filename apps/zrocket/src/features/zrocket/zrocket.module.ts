import { Module } from '@nestjs/common';

import { ZRocketController } from './zrocket.controller.js';

@Module({
    controllers: [ZRocketController],
    providers: [],
    exports: []
})
export class ZRocketModule {}
