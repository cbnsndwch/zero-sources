import { Module } from '@nestjs/common';

import { ZRocketController } from './zrocket.controller.js';
import { MetadataService } from './metadata.service.js';

@Module({
    controllers: [ZRocketController],
    providers: [MetadataService],
    exports: [MetadataService]
})
export class ZRocketModule {}
