import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import type { AppConfig, DbConfig } from '../../config/contracts.js';

@ApiTags('health')
@Controller('healthcheck')
export class HealthzController {
    constructor(private readonly configService: ConfigService<AppConfig>) {}

    @Get()
    @ApiOperation({
        summary: 'Health check endpoint',
        description: 'Returns database connection information to verify system health'
    })
    @ApiResponse({
        status: 200,
        description: 'Application is healthy',
        schema: {
            type: 'object',
            properties: {
                upstream: {
                    type: 'object',
                    properties: {
                        uri: { type: 'string' },
                        name: { type: 'string' }
                    }
                }
            }
        }
    })
    async getHello() {
        const upstream = this.configService.get<DbConfig>('db');

        return {
            upstream
        };
    }
}
