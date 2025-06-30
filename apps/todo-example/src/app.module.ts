import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ZeroMongoModule } from '@cbnsndwch/zero-source-mongodb';
import { ZqliteWatermarkModule } from '@cbnsndwch/zero-watermark-zqlite';
import { TodoModule } from './todos/todo.module.js';

@Module({
    imports: [
        // Environment configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env']
        }),

        // MongoDB connection
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/todo-example')
            })
        }),

        // Zero watermark storage (SQLite-based)
        ZqliteWatermarkModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                file: configService.get<string>('WATERMARK_DB_PATH', './watermarks.db')
            })
        }),

        // Zero MongoDB change source
        ZeroMongoModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                tables: [
                    {
                        schema: 'public',
                        name: 'todos',
                        primaryKey: ['_id'],
                        columns: {
                            _id: {
                                pos: 1,
                                dataType: 'character',
                                notNull: true
                            },
                            title: {
                                pos: 2,
                                dataType: 'varchar',
                                notNull: true
                            },
                            description: {
                                pos: 3,
                                dataType: 'text',
                                notNull: false
                            },
                            completed: {
                                pos: 4,
                                dataType: 'boolean',
                                notNull: true
                            },
                            dueDate: {
                                pos: 5,
                                dataType: 'timestamp',
                                notNull: false
                            },
                            priority: {
                                pos: 6,
                                dataType: 'varchar',
                                notNull: true
                            },
                            createdAt: {
                                pos: 7,
                                dataType: 'timestamp',
                                notNull: true
                            },
                            updatedAt: {
                                pos: 8,
                                dataType: 'timestamp',
                                notNull: true
                            }
                        }
                    }
                ],
                streamerToken: configService.get<string>('ZERO_STREAMER_TOKEN'),
                logLevel: configService.get<string>('LOG_LEVEL', 'info') as any
            })
        }),

        // Feature modules
        TodoModule
    ]
})
export class AppModule {}
