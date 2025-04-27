/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import {
    DiscoveryService,
    MetadataScanner,
    Reflector,
    REQUEST
} from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import {
    ClientGroupId,
    MutationArgs,
    MutationClientId,
    ZeroMutation,
    ZeroMutator,
    ZERO_MUTATOR_WATERMARK,
    ZERO_MUTATION_HANDLER_METADATA,
    ZERO_MUTATION_PARAMS_METADATA
} from '../decorators/index.js';
import { ZeroMutatorRegistry } from '../discovery/zero-mutator-registry.service.js';
import { MongoTransaction } from '../v0/custom-mutators/mongo-transaction.js';
import { PushProcessorV1 } from '../v0/custom-mutators/push-processor.js';

// Mock interfaces for test
interface CreateItemArgs {
    id: string;
    name: string;
}

interface UpdateItemArgs {
    id: string;
    name?: string;
    status?: string;
}

// Test mutator class using our decorators
@Injectable()
@ZeroMutator('test')
class TestMutator {
    private calls: Record<string, any[]> = {
        create: [],
        update: [],
        delete: []
    };

    constructor() {
        this.calls = { create: [], update: [], delete: [] };
    }

    getCalls(method: 'create' | 'update' | 'delete'): any[] {
        return this.calls[method] || [];
    }

    @ZeroMutation('create')
    async createItem(
        @MutationArgs args: CreateItemArgs, // Remove ()
        @MutationClientId clientID: string, // Remove ()
        @ClientGroupId clientGroupID: string, // Remove ()
        tx: MongoTransaction // Assuming Transaction decorator is handled elsewhere or not needed for this mock level
    ) {
        this.calls.create?.push({ args, clientID, clientGroupID, tx });
        return true;
    }

    @ZeroMutation('update')
    async updateItem(
        @MutationArgs args: UpdateItemArgs, // Remove ()
        @MutationClientId clientID: string, // Remove ()
        tx: MongoTransaction
    ) {
        this.calls.update?.push({ args, clientID, tx });
        return true;
    }

    @ZeroMutation('delete')
    async deleteItem(
        @MutationArgs args: { id: string }, // Remove ()
        tx: MongoTransaction
    ) {
        this.calls.delete?.push({ args, tx });
        return true;
    }
}

describe('Zero Mutation Decorators', () => {
    let module: TestingModule;
    let registry: ZeroMutatorRegistry;
    let testMutator: TestMutator;
    let pushProcessor: PushProcessorV1;

    const mockRequestObject = {
        // This will be populated by the PushProcessorV1
    };

    beforeAll(async () => {
        // Create a mock connection
        const mockConnection = {
            startSession: vi.fn().mockImplementation(() => ({
                startTransaction: vi.fn(),
                commitTransaction: vi.fn(),
                abortTransaction: vi.fn(),
                endSession: vi.fn()
            })),
            db: {
                collection: vi.fn().mockImplementation(() => ({
                    findOneAndUpdate: vi
                        .fn()
                        .mockResolvedValue({ value: { lmid: 5 } })
                }))
            }
        } as unknown as Connection;

        // Define mocks for DiscoveryService dependencies
        const mockDiscoveryService = {
            getProviders: vi.fn(), // Implementation will be set after instance creation
            getControllers: vi.fn(() => [])
        };
        // Mock MetadataScanner and Reflector (simplified)
        const mockMetadataScanner = {
            scanFromPrototype: vi.fn((instance, prototype, callback) => {
                ['createItem', 'updateItem', 'deleteItem'].forEach(key =>
                    callback(key)
                );
            })
        };
        const mockReflector = {
            get: vi.fn((metadataKey, target) => {
                if (
                    metadataKey === ZERO_MUTATOR_WATERMARK &&
                    target === TestMutator
                )
                    return { namespace: 'test' };
                if (metadataKey === ZERO_MUTATION_HANDLER_METADATA) {
                    if (target === TestMutator.prototype.createItem)
                        return { name: 'create' };
                    if (target === TestMutator.prototype.updateItem)
                        return { name: 'update' };
                    if (target === TestMutator.prototype.deleteItem)
                        return { name: 'delete' };
                }
                if (metadataKey === ZERO_MUTATION_PARAMS_METADATA) {
                    // Simplified mock - real implementation would need more detail
                    if (target === TestMutator.prototype.createItem)
                        return [{ index: 0 }, { index: 1 }, { index: 2 }];
                    if (target === TestMutator.prototype.updateItem)
                        return [{ index: 0 }, { index: 1 }];
                    if (target === TestMutator.prototype.deleteItem)
                        return [{ index: 0 }];
                }
                return undefined;
            })
        };

        // Build the testing module
        const moduleBuilder = Test.createTestingModule({
            // Provide the core services/mutators needed
            imports: [], // Keep imports minimal
            providers: [
                ZeroMutatorRegistry,
                TestMutator,
                PushProcessorV1,
                // Provide other non-overridden dependencies
                { provide: getConnectionToken(), useValue: mockConnection },
                { provide: REQUEST, useValue: mockRequestObject }
                // We will override DiscoveryService, MetadataScanner, and Reflector below
            ]
        });

        // Override all three dependencies before compiling
        module = await moduleBuilder
            .overrideProvider(DiscoveryService)
            .useValue(mockDiscoveryService)
            .overrideProvider(MetadataScanner) // Override MetadataScanner
            .useValue(mockMetadataScanner)
            .overrideProvider(Reflector) // Override Reflector
            .useValue(mockReflector)
            .compile();

        // Get the TestMutator instance *after* compilation
        const testMutatorInstance = module.get(TestMutator);

        // Now set the mock implementation using the actual instance
        mockDiscoveryService.getProviders.mockImplementation(() => [
            { instance: testMutatorInstance, isAlias: false } as any
        ]);

        // Initialize the module (won't call loadMutators automatically anymore)
        await module.init();

        // Assign instances for use in tests
        registry = module.get<ZeroMutatorRegistry>(ZeroMutatorRegistry);

        // Manually call loadMutators *after* init and instance retrieval
        registry.loadMutators();

        testMutator = testMutatorInstance;
        pushProcessor = module.get<PushProcessorV1>(PushProcessorV1);
    });

    afterAll(async () => {
        await module.close();
    });

    it('should have DiscoveryService injected via override', () => {
        // This test runs after the beforeAll setup completes
        expect(registry).toBeDefined();
        // Access the private member for verification in the test
        expect((registry as any).discoveryService).toBeDefined();
        // Verify it's the mock we provided
        const injectedService = module.get(DiscoveryService);
        expect((registry as any).discoveryService).toBe(injectedService);
    });

    it('should register all mutation handlers', () => {
        const mutationNames = registry.getAllMutationNames();
        expect(mutationNames).toContain('test|create');
        expect(mutationNames).toContain('test|update');
        expect(mutationNames).toContain('test|delete');
        expect(mutationNames.length).toBe(3);
    });

    it('should retrieve the correct handler details', () => {
        const createHandler = registry.getHandler('test|create');
        expect(createHandler).toBeDefined();
        if (!createHandler) throw new Error('Handler not found');
        expect(createHandler.instance).toBe(testMutator);
        expect(createHandler.handlerMethodKey).toBe('createItem');
        // Check parameter decorators were registered (using the simplified mock data)
        expect(createHandler.paramFactories.length).toBe(3);
    });

    // Re-enable skipped tests if the basic discovery works
    it('should process mutations through the PushProcessor', async () => {
        const mockQuery = { schema: 'testSchema', appID: 'testApp' };
        const mockBody = {
            pushVersion: 1,
            clientGroupID: 'test-group',
            timestamp: Date.now(),
            requestID: 'req1',
            mutations: [
                {
                    id: 1,
                    clientID: 'client1',
                    type: 'custom' as const,
                    name: 'test|create',
                    args: [{ id: 'item1', name: 'Test Item' }],
                    timestamp: Date.now()
                }
            ]
        };

        // Reset calls before processing
        testMutator['calls'].create = []; // Access private member for test reset

        await pushProcessor.process(mockQuery, mockBody);

        const createCalls = testMutator.getCalls('create');
        expect(createCalls.length).toBe(1);
        expect(createCalls[0].args).toEqual({ id: 'item1', name: 'Test Item' });
        expect(createCalls[0].clientID).toBe('client1');
        expect(createCalls[0].clientGroupID).toBe('test-group'); // This relies on PushProcessor correctly setting request context
        expect(createCalls[0].tx).toBeInstanceOf(MongoTransaction); // This relies on PushProcessor creating/passing the transaction
    });

    it('should throw NotFoundException for unknown mutations', async () => {
        const mockQuery = { schema: 'testSchema', appID: 'testApp' };
        const mockBody = {
            pushVersion: 1,
            clientGroupID: 'test-group',
            timestamp: Date.now(),
            requestID: 'req2',
            mutations: [
                {
                    id: 1,
                    clientID: 'client1',
                    type: 'custom' as const,
                    name: 'test|unknown',
                    args: [{ id: 'item1' }],
                    timestamp: Date.now()
                }
            ]
        };

        await expect(
            pushProcessor.process(mockQuery, mockBody)
        ).rejects.toThrow('Mutation handler not found for test|unknown'); // Check for specific error if possible
    });
});
