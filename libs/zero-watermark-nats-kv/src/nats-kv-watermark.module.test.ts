// TODO: fix the tests

// import fs from 'node:fs';
// import os from 'node:os';
// import path from 'node:path';

// import { describe, expect, it } from 'vitest';
// import { Test, TestingModule } from '@nestjs/testing';
// import Zqlite from '@rocicorp/zero-sqlite3';

// import { TOKEN_WATERMARK_SERVICE, IWatermarkService } from '@cbnsndwch/zero-contracts';

// import { TOKEN_WATERMARK_NATS_KV_BUCKET } from './contracts.mjs';
// import { NatsKvWatermarkModule } from './nats-kv-watermark.module.js';
// import { NatsKvWatermarkService } from './nats-kv-watermark.service.mjs';

// const TEST_DB_FILE = path.join(os.tmpdir(), 'test.db');
// const TEST_DB_DIR = path.join(os.tmpdir(), 'test_db_dir');

// describe('ZqliteWatermarkModule', () => {
//     let module: TestingModule;
//     let watermarkService: IWatermarkService;

//     it('should be defined', () => {
//         expect(NatsKvWatermarkModule).toBeDefined();
//     });

//     describe('forRootAsync', () => {
//         it('should register the module and provide the watermark service', async () => {
//             module = await Test.createTestingModule({
//                 imports: [
//                     NatsKvWatermarkModule.forRootAsync({
//                         useFactory: () => ({
//                             file: TEST_DB_FILE
//                         })
//                     })
//                 ]
//             }).compile();

//             watermarkService = module.get<IWatermarkService>(TOKEN_WATERMARK_SERVICE);
//             expect(watermarkService).toBeDefined();
//             expect(watermarkService).toBeInstanceOf(ZqliteWatermarkService);
//         });

//         it('should inject dependencies into the useFactory', async () => {
//             fs.writeFileSync(TEST_DB_FILE, '');

//             module = await Test.createTestingModule({
//                 imports: [
//                     NatsKvWatermarkModule.forRootAsync({
//                         inject: [],
//                         useFactory: () => ({
//                             file: TEST_DB_FILE
//                         })
//                     })
//                 ]
//             }).compile();

//             watermarkService = module.get<IWatermarkService>(TOKEN_WATERMARK_SERVICE);
//             expect(watermarkService).toBeDefined();
//         });

//         it('should provide the Zqlite.Database instance', async () => {
//             module = await Test.createTestingModule({
//                 imports: [
//                     NatsKvWatermarkModule.forRootAsync({
//                         useFactory: () => ({
//                             file: TEST_DB_FILE
//                         })
//                     })
//                 ]
//             }).compile();

//             const zqliteDb = module.get<Zqlite.Database>(TOKEN_WATERMARK_NATS_KV_BUCKET);
//             expect(zqliteDb).toBeDefined();
//         });

//         it('should create the database file if it does not exist', async () => {
//             const dbFile = TEST_DB_FILE + Date.now();
            
//             expect(fs.existsSync(dbFile)).toBe(false);

//             await Test.createTestingModule({
//                 imports: [
//                     NatsKvWatermarkModule.forRootAsync({
//                         useFactory: () => ({
//                             file: dbFile
//                         })
//                     })
//                 ]
//             }).compile();

//             expect(fs.existsSync(dbFile)).toBe(true);
//         });

//         it('should throw an error if the file option is not defined', async () => {
//             await expect(
//                 Test.createTestingModule({
//                     imports: [
//                         NatsKvWatermarkModule.forRootAsync({
//                             // eslint-disable-next-line @typescript-eslint/no-explicit-any
//                             useFactory: () => ({ file: undefined }) as any
//                         })
//                     ]
//                 }).compile()
//             ).rejects.toThrowError('ZqliteKvOptions.file must be defined');
//         });

//         it('should throw an error if the file option is a directory', async () => {
//             fs.mkdirSync(TEST_DB_DIR, { recursive: true });

//             await expect(
//                 Test.createTestingModule({
//                     imports: [
//                         NatsKvWatermarkModule.forRootAsync({
//                             useFactory: () => ({
//                                 file: TEST_DB_DIR
//                             })
//                         })
//                     ]
//                 }).compile()
//             ).rejects.toThrowError('ZqliteKvOptions.file must not point to a directory');

//             fs.rmdirSync(TEST_DB_DIR);
//         });
//     });
// });
