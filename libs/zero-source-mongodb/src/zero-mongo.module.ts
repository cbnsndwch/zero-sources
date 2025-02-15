import { DynamicModule, FactoryProvider, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import {
    TOKEN_MODULE_OPTIONS,
    type ZeroMongoModuleAsyncOptions,
    type ZeroMongoModuleOptions
} from './contracts/zero-mongo-module-options.contract.js';

import { zeroEntities } from './entities/index.js';
import { zeroControllers } from './controllers/index.js';

import { v0ChangeSourceServices } from './v0/index.js';

@Module({})
export class ZeroMongoModule {
    static forRootAsync(options: ZeroMongoModuleAsyncOptions): DynamicModule {
        const optionsProvider: FactoryProvider<ZeroMongoModuleOptions> = {
            provide: TOKEN_MODULE_OPTIONS,
            inject: options.inject ?? [],
            useFactory: options.useFactory
        };

        return {
            global: true,
            module: ZeroMongoModule,
            imports: [
                ConfigModule,
                // own
                MongooseModule.forFeature(zeroEntities)
            ],
            controllers: [
                ...zeroControllers
                //
            ],
            providers: [
                // collection schemas
                optionsProvider,
                // webSocket gateways and services
                ...v0ChangeSourceServices
            ]
        };
    }
}
