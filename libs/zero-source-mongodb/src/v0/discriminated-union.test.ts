import { describe, it, expect } from 'vitest';
import { 
    matchesFilter, 
    applyProjection, 
    parseDiscriminatedConfig 
} from '../utils/discriminated-union.js';

describe('Discriminated Union Utilities', () => {
    describe('parseDiscriminatedConfig', () => {
        it('should parse valid JSON configuration', () => {
            const jsonConfig = JSON.stringify({
                source: 'rooms',
                filter: { t: 'd', archived: { $ne: true } },
                projection: { _id: 1, memberIds: 1 }
            });

            const result = parseDiscriminatedConfig(jsonConfig);
            expect(result).toEqual({
                source: 'rooms',
                filter: { t: 'd', archived: { $ne: true } },
                projection: { _id: 1, memberIds: 1 }
            });
        });

        it('should return null for invalid JSON', () => {
            const result = parseDiscriminatedConfig('invalid-json');
            expect(result).toBeNull();
        });

        it('should return null for config without source', () => {
            const jsonConfig = JSON.stringify({ filter: { t: 'd' } });
            const result = parseDiscriminatedConfig(jsonConfig);
            expect(result).toBeNull();
        });
    });

    describe('matchesFilter', () => {
        const sampleDoc = {
            _id: 'room1',
            t: 'd',
            memberIds: ['alice', 'bob'],
            archived: false,
            nested: {
                property: 'value'
            }
        };

        it('should match direct field equality', () => {
            expect(matchesFilter(sampleDoc, { t: 'd' })).toBe(true);
            expect(matchesFilter(sampleDoc, { t: 'c' })).toBe(false);
        });

        it('should match $ne operator', () => {
            expect(matchesFilter(sampleDoc, { archived: { $ne: true } })).toBe(true);
            expect(matchesFilter(sampleDoc, { archived: { $ne: false } })).toBe(false);
        });

        it('should match $in operator', () => {
            expect(matchesFilter(sampleDoc, { t: { $in: ['d', 'p'] } })).toBe(true);
            expect(matchesFilter(sampleDoc, { t: { $in: ['c', 'p'] } })).toBe(false);
        });

        it('should match nested properties', () => {
            expect(matchesFilter(sampleDoc, { 'nested.property': 'value' })).toBe(true);
            expect(matchesFilter(sampleDoc, { 'nested.property': 'other' })).toBe(false);
        });

        it('should match multiple filters (AND logic)', () => {
            const filter = { 
                t: 'd', 
                archived: { $ne: true } 
            };
            expect(matchesFilter(sampleDoc, filter)).toBe(true);

            const failingFilter = { 
                t: 'd', 
                archived: { $ne: false } 
            };
            expect(matchesFilter(sampleDoc, failingFilter)).toBe(false);
        });

        it('should return true for empty filter', () => {
            expect(matchesFilter(sampleDoc, {})).toBe(true);
        });
    });

    describe('applyProjection', () => {
        const sampleDoc = {
            _id: 'room1',
            t: 'd',
            memberIds: ['alice', 'bob'],
            archived: false,
            nested: {
                property: 'value',
                other: 'data'
            },
            extra: 'field'
        };

        it('should include only specified fields with inclusion projection', () => {
            const projection = { _id: 1, memberIds: 1 };
            const result = applyProjection(sampleDoc, projection);
            
            expect(result).toEqual({
                _id: 'room1',
                memberIds: ['alice', 'bob']
            });
        });

        it('should include nested fields with dot notation', () => {
            const projection = { _id: 1, 'nested.property': 1 };
            const result = applyProjection(sampleDoc, projection);
            
            expect(result).toEqual({
                _id: 'room1',
                nested: {
                    property: 'value'
                }
            });
        });

        it('should exclude _id when explicitly excluded', () => {
            const projection = { _id: 0, memberIds: 1 };
            const result = applyProjection(sampleDoc, projection);
            
            expect(result).toEqual({
                memberIds: ['alice', 'bob']
            });
        });

        it('should exclude specified fields with exclusion projection', () => {
            const projection = { extra: 0, archived: 0 };
            const result = applyProjection(sampleDoc, projection);
            
            expect(result).toEqual({
                _id: 'room1',
                t: 'd',
                memberIds: ['alice', 'bob'],
                nested: {
                    property: 'value',
                    other: 'data'
                }
            });
        });

        it('should return copy of document for empty projection', () => {
            const result = applyProjection(sampleDoc, {});
            expect(result).toEqual(sampleDoc);
            expect(result).not.toBe(sampleDoc); // Should be a copy
        });
    });
});