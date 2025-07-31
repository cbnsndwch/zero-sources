import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MetadataController } from './metadata.controller.js';
import { MetadataService } from './metadata.service.js';

@Module({
    imports: [ConfigModule],
    controllers: [MetadataController],
    providers: [MetadataService],
    exports: [MetadataService]
})
export class MetadataModule {}
