import { Global, Module } from '@nestjs/common';

import { zqliteWatermarkProviders } from './providers/index.js';

@Global()
@Module({
    providers: zqliteWatermarkProviders,
    exports: zqliteWatermarkProviders
})
export class ZqliteWatermarkModule {}
