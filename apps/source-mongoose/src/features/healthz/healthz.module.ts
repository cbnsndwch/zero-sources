import { Module } from '@nestjs/common';

import { genericControllers } from './controllers/index.js';
import { genericServices } from './services/index.js';

@Module({
    controllers: [...genericControllers],
    providers: [...genericServices]
})
export class HealthzModule {}
