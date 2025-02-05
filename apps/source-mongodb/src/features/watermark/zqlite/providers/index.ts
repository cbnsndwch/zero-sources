import { Provider } from '@nestjs/common';

import { zqliteDbProvider } from './zqlite-client.provider.js';
import { zqliteWatermarkServiceProvider } from './zqlite-watermark-service.provider.js';

export const zqliteWatermarkProviders: Provider[] = [
    zqliteDbProvider,
    zqliteWatermarkServiceProvider
];
