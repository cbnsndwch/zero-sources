import { DynamicModule, FactoryProvider, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import {
    TOKEN_ZERO_MYSQL_MODULE_OPTIONS,
    type ZeroMySqlAsyncOptions,
    type ZeroMySqlModuleOptions
} from './contracts/zero-mysql-module-options.contract.js';
import { DrizzleMySqlModule } from '@knaadh/nestjs-drizzle-mysql2';

import { v0ChangeSourceServices } from './v0/index.js';

@Module({})
export class ZeroMySqlModule {
    static forRootAsync(options: ZeroMySqlAsyncOptions): DynamicModule {
        const optionsProvider: FactoryProvider<ZeroMySqlModuleOptions> = {
            provide: TOKEN_ZERO_MYSQL_MODULE_OPTIONS,
            inject: options.inject ?? [],
            useFactory: options.useFactory
        };

        return {
            global: true,
            module: ZeroMySqlModule,
            imports: [
                ConfigModule,

                // Drizzle integration for MySQL metadata DB
                DrizzleMySqlModule.registerAsync({
                    tag: 'DB_ZERO_MYSQL_SOURCE',
                    useFactory() {
                        return {
                            mysql: {
                                connection: 'client',
                                config: {
                                    host: '127.0.0.1',
                                    user: 'root',
                                    database: 'drizzleDB'
                                }
                            },
                            config: { schema: {}, mode: 'default' }
                        };
                    }
                }),

                ...(options.imports || [])
            ],
            providers: [optionsProvider, ...v0ChangeSourceServices],
            exports: []
        };
    }
}
