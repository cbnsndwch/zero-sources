import { Module } from '@nestjs/common';

import { HealthzController } from './healthz.controller.js';

@Module({ controllers: [HealthzController] })
export class HealthzModule {}
