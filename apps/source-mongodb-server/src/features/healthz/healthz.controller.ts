import { Controller, Get } from '@nestjs/common';
import { type ConfigService } from '@nestjs/config';

import type { AppConfig, DbConfig } from '../../config/contracts.js';

@Controller()
export class HealthzController {
    constructor(private readonly configService: ConfigService<AppConfig>) {}

    @Get()
    async getHello() {
        const upstream = this.configService.get<DbConfig>('db');

        return {
            upstream
        };
    }
}
