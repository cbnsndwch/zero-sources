import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { AppConfig } from '../../../config/contracts.js';

import { HelloService } from '../services/index.js';

@Controller()
export class HelloController {
    constructor(
        private readonly configService: ConfigService<AppConfig>,
        private readonly helloService: HelloService
    ) {}

    @Get()
    async getHello() {
        const hello = this.helloService.getHello();

        const upstream = this.configService.get('db');

        return {
            hello,
            upstream
        };
    }
}
