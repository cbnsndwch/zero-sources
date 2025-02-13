import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Database } from '@rocicorp/zero-sqlite3';

import { ZqliteWatermarkService } from './zqlite-watermark.service.mjs';

type MockFn = ReturnType<typeof vi.fn>;

describe('ZqliteWatermarkService', () => {
    let service: ZqliteWatermarkService;
    let db: Database;

    beforeEach(() => {
        db = {
            prepare: vi.fn().mockReturnValue({
                get: vi.fn(),
                run: vi.fn()
            })
        } as unknown as Database;
        service = new ZqliteWatermarkService(db);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getResumeToken', () => {
        it('should retrieve the resume token for a given shard and watermark', async () => {
            const shardId = 'test_shard';
            const watermark = '00';
            const key = `zero_${shardId}.${watermark}`;
            const expectedResumeToken = 'test-resume-token';

            (db.prepare as MockFn).mockReturnValue({
                get: vi.fn().mockReturnValue({ key, value: expectedResumeToken })
            });

            const resumeToken = await service.getResumeToken(shardId, watermark);

            expect(db.prepare).toHaveBeenCalledWith('SELECT key, value FROM zero_kv WHERE key = ?');
            expect(db.prepare('').get as MockFn).toHaveBeenCalledWith(key);
            expect(resumeToken).toBe(expectedResumeToken);
        });

        it('should return undefined if no resume token is found', async () => {
            const shardId = 'test_shard';
            const watermark = '0000000000000001';

            (db.prepare as MockFn).mockReturnValue({
                get: vi.fn().mockReturnValue(undefined)
            });

            const resumeToken = await service.getResumeToken(shardId, watermark);

            expect(resumeToken).toBeUndefined();
        });
    });

    describe('getOrCreateWatermark', () => {
        it('should return existing watermark if found', async () => {
            const shardId = 'test_shard';
            const resumeToken = 'test-resume-token';
            const key = `zero_${shardId}.${resumeToken}`;
            const existingWatermark = '0000000000000002';

            (db.prepare as MockFn).mockReturnValue({
                get: vi.fn().mockReturnValue({ key, value: existingWatermark })
            });

            const watermark = await service.getOrCreateWatermark(shardId, resumeToken);

            expect(db.prepare).toHaveBeenCalledWith('SELECT key, value FROM zero_kv WHERE key = ?');
            expect(db.prepare('').get as MockFn).toHaveBeenCalledWith(key);
            expect(watermark).toBe(existingWatermark);
        });

        it('should create a new watermark if one does not exist', async () => {
            const shardId = 'test_shard';
            const resumeToken = 'test-resume-token';
            const key = `zero_${shardId}.${resumeToken}`;
            const newWatermark = '01';

            const dbPrepareRun = vi.fn();
            const dbPrepareGetUndef = vi.fn().mockReturnValue(undefined);
            const dbPrepareGetWithValue = vi.fn().mockReturnValue({ key, value: newWatermark });

            (db.prepare as MockFn).mockImplementation((query: string) => {
                return {
                    get:
                        query === 'SELECT key, value FROM zero_kv WHERE key = ?'
                            ? dbPrepareGetUndef
                            : dbPrepareGetWithValue,
                    run: dbPrepareRun
                };
            });

            vi.spyOn(service, '_nextWatermark').mockResolvedValue(newWatermark);

            const watermark = await service.getOrCreateWatermark(shardId, resumeToken);

            expect(db.prepare).toHaveBeenCalledWith('SELECT key, value FROM zero_kv WHERE key = ?');

            expect(dbPrepareGetUndef as MockFn).toHaveBeenCalledWith(key);
            expect(service._nextWatermark).toHaveBeenCalledWith(shardId);
            expect(db.prepare).toHaveBeenCalledWith(
                'INSERT INTO zero_kv (key, value) VALUES (?, ?)'
            );

            expect(dbPrepareRun).toHaveBeenCalledWith(key, newWatermark);
            expect(dbPrepareRun).toHaveBeenCalledWith(
                `zero_${shardId}.${newWatermark}`,
                resumeToken
            );

            expect(watermark).toBe(newWatermark);
        });
    });

    describe('_nextWatermark', () => {
        it('should create a new LSN entry if one does not exist', async () => {
            const shardId = 'test_shard';
            const shardLsnKey = `zero_${shardId}.lsn`;
            const initialWatermark = '01';

            const dbPrepareRun = vi.fn();
            const dbPrepareGet = vi.fn().mockReturnValue(undefined);

            (db.prepare as MockFn).mockImplementation(() => {
                return {
                    get: dbPrepareGet,
                    run: dbPrepareRun
                };
            });

            const watermark = await service._nextWatermark(shardId);

            expect(db.prepare).toHaveBeenCalledWith('SELECT key, value FROM zero_kv WHERE key = ?');
            expect(db.prepare('').get as MockFn).toHaveBeenCalledWith(shardLsnKey);
            expect(db.prepare).toHaveBeenCalledWith(
                'INSERT INTO zero_kv (key, value) VALUES (?, ?)'
            );
            expect(db.prepare('').run as MockFn).toHaveBeenCalledWith(
                shardLsnKey,
                initialWatermark
            );
            expect(watermark).toBe(initialWatermark);
        });

        it('should increment the LSN if one exists', async () => {
            const shardId = 'test_shard';
            const shardLsnKey = `zero_${shardId}.lsn`;
            const previousWatermark = '01';
            const incrementedWatermark = '02';

            const dbPrepareRun = vi.fn();
            const dbPrepareGet = vi
                .fn()
                .mockReturnValue({ key: shardLsnKey, value: previousWatermark });

            (db.prepare as MockFn).mockImplementation((query: string) => {
                if (query === 'SELECT key, value FROM zero_kv WHERE key = ?') {
                    return {
                        get: dbPrepareGet
                    };
                } else if (query === 'UPDATE zero_kv SET value = ? WHERE key = ?') {
                    return {
                        run: dbPrepareRun
                    };
                }

                return {
                    get: vi.fn(),
                    run: vi.fn()
                };
            });

            const watermark = await service._nextWatermark(shardId);

            expect(db.prepare).toHaveBeenCalledWith('SELECT key, value FROM zero_kv WHERE key = ?');
            expect(dbPrepareGet).toHaveBeenCalledWith(shardLsnKey);
            expect(db.prepare).toHaveBeenCalledWith('UPDATE zero_kv SET value = ? WHERE key = ?');
            expect(dbPrepareRun).toHaveBeenCalledWith(incrementedWatermark, shardLsnKey);

            expect(watermark).toBe(incrementedWatermark);
        });

        it('should retry on race condition', async () => {
            const shardId = 'test_shard';
            const shardLsnKey = `zero_${shardId}.lsn`;
            const previousWatermark = '01';
            const incrementedWatermark = '02';

            let attempt = 0;

            const dbPrepareGet = vi
                .fn()
                .mockReturnValue({ key: shardLsnKey, value: previousWatermark });
            const dbPrepareRun = vi.fn().mockImplementation(() => {
                if (attempt === 0) {
                    attempt++;
                    throw new Error('Simulated race condition');
                }
            });

            (db.prepare as MockFn).mockImplementation((query: string) => {
                if (query === 'SELECT key, value FROM zero_kv WHERE key = ?') {
                    return {
                        get: dbPrepareGet
                    };
                } else if (query === 'UPDATE zero_kv SET value = ? WHERE key = ?') {
                    return {
                        run: dbPrepareRun
                    };
                }
                return {
                    get: vi.fn(),
                    run: vi.fn()
                };
            });

            const watermark = await service._nextWatermark(shardId);

            expect(db.prepare).toHaveBeenCalledWith('SELECT key, value FROM zero_kv WHERE key = ?');
            expect(dbPrepareGet).toHaveBeenCalledWith(shardLsnKey);

            expect(db.prepare).toHaveBeenCalledWith('UPDATE zero_kv SET value = ? WHERE key = ?');
            expect(dbPrepareRun).toHaveBeenCalledWith(incrementedWatermark, shardLsnKey);

            expect(watermark).toBe(incrementedWatermark);
        });
    });
});
