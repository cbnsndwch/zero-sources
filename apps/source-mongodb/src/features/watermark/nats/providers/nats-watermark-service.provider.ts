import { ClassProvider } from '@nestjs/common';

import { IWatermarkService, TOKEN_WATERMARK_SERVICE } from '../../contracts.js';

import { NatsKvWatermarkService } from '../services/nats-kv-watermark.service.js';

export const natsKvWatermarkServiceProvider: ClassProvider<IWatermarkService> = {
    provide: TOKEN_WATERMARK_SERVICE,
    useClass: NatsKvWatermarkService
};
