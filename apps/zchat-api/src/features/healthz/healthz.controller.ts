import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import type { AppConfig, DbConfig } from '../../config/contracts.js';

@ApiTags('health')
@Controller()
export class HealthzController {
    constructor(private readonly configService: ConfigService<AppConfig>) {}

    @Get('health')
    @ApiOperation({
        summary: 'Simple health check',
        description: 'Returns OK status for Docker health checks'
    })
    @ApiResponse({
        status: 200,
        description: 'Application is healthy',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'ok' },
                timestamp: { type: 'string', format: 'date-time' }
            }
        }
    })
    async health() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString()
        };
    }

    @Get('healthcheck')
    @ApiOperation({
        summary: 'Detailed health check endpoint',
        description:
            'Returns database connection information to verify system health'
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
