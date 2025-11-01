import { describe, it, expect, beforeEach } from 'vitest';
import { Test, type TestingModule } from '@nestjs/testing';

import { ArrayDiffService } from './array-diff.service.js';

describe('ArrayDiffService', () => {
    let service: ArrayDiffService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ArrayDiffService]
        }).compile();

        service = module.get<ArrayDiffService>(ArrayDiffService);
    });

    describe('Identity-based matching', () => {
        it('should detect added elements by identity', () => {
            const old = [{ id: 'u1', name: 'Alice' }];
            const newArr = [
                { id: 'u1', name: 'Alice' },
                { id: 'u2', name: 'Bob' }
            ];

            const diff = service.computeDiff(old, newArr, {
                identityField: 'id'
            });

            expect(diff.added).toHaveLength(1);
            expect(diff.added[0]!.value.id).toBe('u2');
            expect(diff.added[0]!.value.name).toBe('Bob');
            expect(diff.removed).toHaveLength(0);
            expect(diff.modified).toHaveLength(0);
        });

        it('should detect removed elements by identity', () => {
            const old = [
                { id: 'u1', name: 'Alice' },
                { id: 'u2', name: 'Bob' },
                { id: 'u3', name: 'Charlie' }
            ];
            const newArr = [{ id: 'u1', name: 'Alice' }];

            const diff = service.computeDiff(old, newArr, {
                identityField: 'id'
            });

            expect(diff.removed).toHaveLength(2);
            expect(diff.removed[0]!.value.id).toBe('u2');
            expect(diff.removed[1]!.value.id).toBe('u3');
            expect(diff.added).toHaveLength(0);
            expect(diff.modified).toHaveLength(0);
        });

        it('should detect modified elements by identity', () => {
            const old = [
                { id: 'u1', name: 'Alice', role: 'member' },
                { id: 'u2', name: 'Bob', role: 'member' }
            ];
            const newArr = [
                { id: 'u1', name: 'Alice', role: 'admin' },
                { id: 'u2', name: 'Bob', role: 'member' }
            ];

            const diff = service.computeDiff(old, newArr, {
                identityField: 'id'
            });

            expect(diff.modified).toHaveLength(1);
            expect(diff.modified[0]!.newValue.id).toBe('u1');
            expect(diff.modified[0]!.newValue.role).toBe('admin');
            expect(diff.modified[0]!.oldValue.role).toBe('member');
            expect(diff.added).toHaveLength(0);
            expect(diff.removed).toHaveLength(0);
        });

        it('should handle array reordering without changes', () => {
            const old = [
                { id: 'u1', name: 'Alice' },
                { id: 'u2', name: 'Bob' },
                { id: 'u3', name: 'Charlie' }
            ];
            const newArr = [
                { id: 'u3', name: 'Charlie' },
                { id: 'u1', name: 'Alice' },
                { id: 'u2', name: 'Bob' }
            ];

            const diff = service.computeDiff(old, newArr, {
                identityField: 'id'
            });

            expect(diff.added).toHaveLength(0);
            expect(diff.removed).toHaveLength(0);
            expect(diff.modified).toHaveLength(0);
        });

        it('should handle complex scenario with multiple changes', () => {
            const old = [
                { id: 'u1', name: 'Alice', role: 'admin' },
                { id: 'u2', name: 'Bob', role: 'member' },
                { id: 'u3', name: 'Charlie', role: 'member' }
            ];
            const newArr = [
                { id: 'u1', name: 'Alice', role: 'owner' }, // Modified
                { id: 'u3', name: 'Charlie', role: 'member' }, // Unchanged
                { id: 'u4', name: 'David', role: 'member' } // Added
                // u2 removed
            ];

            const diff = service.computeDiff(old, newArr, {
                identityField: 'id'
            });

            expect(diff.modified).toHaveLength(1);
            expect(diff.modified[0]!.newValue.id).toBe('u1');
            expect(diff.modified[0]!.newValue.role).toBe('owner');

            expect(diff.removed).toHaveLength(1);
            expect(diff.removed[0]!.value.id).toBe('u2');

            expect(diff.added).toHaveLength(1);
            expect(diff.added[0]!.value.id).toBe('u4');
        });
    });

    describe('Index-based matching', () => {
        it('should use index-based matching when no identity field', () => {
            const old = ['a', 'b', 'c'];
            const newArr = ['a', 'b', 'c', 'd'];

            const diff = service.computeDiff(old, newArr);

            expect(diff.added).toHaveLength(1);
            expect(diff.added[0]!.value).toBe('d');
            expect(diff.added[0]!.index).toBe(3);
        });

        it('should detect removals with index-based matching', () => {
            const old = ['a', 'b', 'c', 'd'];
            const newArr = ['a', 'b'];

            const diff = service.computeDiff(old, newArr);

            expect(diff.removed).toHaveLength(2);
            expect(diff.removed[0]!.value).toBe('c');
            expect(diff.removed[1]!.value).toBe('d');
        });

        it('should detect modifications at same index', () => {
            const old = [
                { name: 'Alice' },
                { name: 'Bob' },
                { name: 'Charlie' }
            ];
            const newArr = [
                { name: 'Alice' },
                { name: 'Robert' },
                { name: 'Charlie' }
            ];

            const diff = service.computeDiff(old, newArr);

            expect(diff.modified).toHaveLength(1);
            expect(diff.modified[0]!.index).toBe(1);
            expect(diff.modified[0]!.oldValue.name).toBe('Bob');
            expect(diff.modified[0]!.newValue.name).toBe('Robert');
        });

        it('should treat reordering as modifications', () => {
            const old = ['a', 'b', 'c'];
            const newArr = ['c', 'b', 'a'];

            const diff = service.computeDiff(old, newArr);

            // Without identity field, reordering is seen as modifications
            expect(diff.modified).toHaveLength(2); // First and last swapped
            expect(diff.modified[0]!.oldValue).toBe('a');
            expect(diff.modified[0]!.newValue).toBe('c');
            expect(diff.modified[1]!.oldValue).toBe('c');
            expect(diff.modified[1]!.newValue).toBe('a');
        });
    });

    describe('Edge cases', () => {
        it('should handle empty arrays', () => {
            const diff = service.computeDiff([], [], { identityField: 'id' });

            expect(diff.added).toHaveLength(0);
            expect(diff.removed).toHaveLength(0);
            expect(diff.modified).toHaveLength(0);
        });

        it('should handle null arrays', () => {
            const diff = service.computeDiff(null, null, {
                identityField: 'id'
            });

            expect(diff.added).toHaveLength(0);
            expect(diff.removed).toHaveLength(0);
            expect(diff.modified).toHaveLength(0);
        });

        it('should handle undefined arrays', () => {
            const diff = service.computeDiff(undefined, undefined, {
                identityField: 'id'
            });

            expect(diff.added).toHaveLength(0);
            expect(diff.removed).toHaveLength(0);
            expect(diff.modified).toHaveLength(0);
        });

        it('should handle transition from null to array', () => {
            const diff = service.computeDiff(
                null,
                [{ id: 'u1', name: 'Alice' }],
                { identityField: 'id' }
            );

            expect(diff.added).toHaveLength(1);
            expect(diff.added[0]!.value.id).toBe('u1');
        });

        it('should handle transition from array to null', () => {
            const diff = service.computeDiff(
                [{ id: 'u1', name: 'Alice' }],
                null,
                { identityField: 'id' }
            );

            expect(diff.removed).toHaveLength(1);
            expect(diff.removed[0]!.value.id).toBe('u1');
        });

        it('should handle missing identity field in elements', () => {
            const old = [
                { id: 'u1', name: 'Alice' },
                { name: 'Bob' } // Missing id
            ];
            const newArr = [
                { id: 'u1', name: 'Alice' },
                { name: 'Charlie' } // Missing id, different content
            ];

            const diff = service.computeDiff(old, newArr, {
                identityField: 'id'
            });

            // Elements with undefined identity get mapped to same key,
            // causing last-write-wins behavior in Map
            // The element with undefined id is seen as modified
            expect(diff.modified).toHaveLength(1);
            expect(diff.modified[0]?.oldValue.name).toBe('Bob');
            expect(diff.modified[0]?.newValue.name).toBe('Charlie');
        });

        it('should handle duplicate identity values', () => {
            const old = [
                { id: 'u1', name: 'Alice' },
                { id: 'u1', name: 'Alice Clone' }
            ];
            const newArr = [
                { id: 'u1', name: 'Alice Updated' },
                { id: 'u1', name: 'Alice Clone Updated' }
            ];

            // With duplicate IDs, the last one wins in the Map
            const diff = service.computeDiff(old, newArr, {
                identityField: 'id'
            });

            // Behavior with duplicates: Map keeps last occurrence
            expect(diff.modified).toHaveLength(1);
        });
    });

    describe('Deep equality', () => {
        it('should detect nested object changes', () => {
            const old = [
                {
                    id: 'u1',
                    profile: { name: 'Alice', age: 30 }
                }
            ];
            const newArr = [
                {
                    id: 'u1',
                    profile: { name: 'Alice', age: 31 }
                }
            ];

            const diff = service.computeDiff(old, newArr, {
                identityField: 'id'
            });

            expect(diff.modified).toHaveLength(1);
            expect(diff.modified[0]!.newValue.profile.age).toBe(31);
        });

        it('should detect array changes in elements', () => {
            const old = [
                {
                    id: 'u1',
                    tags: ['admin', 'moderator']
                }
            ];
            const newArr = [
                {
                    id: 'u1',
                    tags: ['admin', 'moderator', 'verified']
                }
            ];

            const diff = service.computeDiff(old, newArr, {
                identityField: 'id'
            });

            expect(diff.modified).toHaveLength(1);
            expect(diff.modified[0]!.newValue.tags).toHaveLength(3);
        });

        it('should compare dates correctly', () => {
            const date1 = new Date('2024-01-01');
            const date2 = new Date('2024-01-02');

            const old = [{ id: 'u1', createdAt: date1 }];
            const newArr = [{ id: 'u1', createdAt: date2 }];

            const diff = service.computeDiff(old, newArr, {
                identityField: 'id'
            });

            expect(diff.modified).toHaveLength(1);
        });

        it('should detect no changes in deeply equal objects', () => {
            const old = [
                {
                    id: 'u1',
                    profile: {
                        name: 'Alice',
                        contact: { email: 'alice@example.com' }
                    }
                }
            ];
            const newArr = [
                {
                    id: 'u1',
                    profile: {
                        name: 'Alice',
                        contact: { email: 'alice@example.com' }
                    }
                }
            ];

            const diff = service.computeDiff(old, newArr, {
                identityField: 'id'
            });

            expect(diff.added).toHaveLength(0);
            expect(diff.removed).toHaveLength(0);
            expect(diff.modified).toHaveLength(0);
        });
    });

    describe('Performance characteristics', () => {
        it('should handle large arrays efficiently', () => {
            const old = Array.from({ length: 1000 }, (_, i) => ({
                id: `u${i}`,
                name: `User ${i}`
            }));
            const newArr = [
                ...old.slice(0, 500),
                { id: 'u500', name: 'User 500 Updated' }, // Modified
                ...old.slice(501, 999) // Removed last element
            ];

            const start = Date.now();
            const diff = service.computeDiff(old, newArr, {
                identityField: 'id'
            });
            const duration = Date.now() - start;

            expect(diff.modified).toHaveLength(1);
            expect(diff.removed).toHaveLength(1);
            expect(duration).toBeLessThan(100); // Should be fast
        });
    });
});
