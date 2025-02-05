import { Global, Module } from '@nestjs/common';

import { natsKvWatermarkProviders } from './providers/index.js';

@Global()
@Module({
    providers: natsKvWatermarkProviders,
    exports: natsKvWatermarkProviders
})
export class NatsKvWatermarkModule {}
