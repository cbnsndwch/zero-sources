import { ClassProvider } from '@nestjs/common';

import { IWatermarkService, TOKEN_WATERMARK_SERVICE } from '../../contracts.js';

import { ZqliteWatermarkService } from '../services/zqlite-watermark.service.js';

export const zqliteWatermarkServiceProvider: ClassProvider<IWatermarkService> = {
    provide: TOKEN_WATERMARK_SERVICE,
    useClass: ZqliteWatermarkService
};
