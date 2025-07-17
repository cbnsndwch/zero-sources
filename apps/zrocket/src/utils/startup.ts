import type { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';

import { makeTable } from './string-utils.js';

export async function printStartupBanner(
    app: NestExpressApplication,
    logger: Logger
) {
    const baseUrl = await app.getUrl();
    const banner = makeTable(
        {
            'Base URL': baseUrl,
            SwaggerUI: `${baseUrl}/api-docs`,
            'ZRocket Demo': `${baseUrl}/zrocket/demo-info`
        },
        `🚀 ZRocket Server running 🚀`
    );
    banner.forEach(line => logger.log(line));
}
