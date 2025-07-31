import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';

import type { AppConfig, DbConfig } from '../config/contracts.js';
import loadYamlConfig from '../config/load-yaml-config.js';
import { SchemaModule } from './schema/schema.module.js';

const isLocalhost = (uri: string) =>
    ['localhost', '127.0.0.1'].some(localhost => uri.includes(localhost));

const dbModule = MongooseModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    async useFactory(config: ConfigService<AppConfig>) {
        const { uri } = config.get<DbConfig>('db')!;

        // force IPv4 if DB URI is localhost
        const family = isLocalhost(uri) ? 4 : undefined;

        return {
            uri,
            family
        } satisfies MongooseModuleFactoryOptions;
    }
});

const configModule = ConfigModule.forRoot({
    isGlobal: true,
    load: [loadYamlConfig]
});

const schemaLoaderModule = SchemaModule.forRoot();

export const globalModules = [configModule, dbModule, schemaLoaderModule];
