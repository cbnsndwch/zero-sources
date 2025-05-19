import { Injectable, Logger } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';

import {
    ZERO_MUTATOR_WATERMARK,
    ZERO_MUTATION_HANDLER_METADATA,
    ZERO_MUTATION_PARAMS_METADATA,
    ZeroParamData
} from '../decorators/zero-mutator.constants.js';
import { Schema } from '@rocicorp/zero';

export interface MutationHandlerDetails {
    instance: object;
    handlerMethodKey: string | symbol; // The method name on the instance
    paramFactories: ZeroParamData[]; // Factories for parameter injection
}

/**
 * Service that discovers and registers Zero mutation handlers using the
 * NestJS discovery system and class/method decorators.
 */
@Injectable()
export class ZeroMutatorRegistry<S extends Schema> {
    private readonly logger = new Logger(ZeroMutatorRegistry.name);
    private readonly mutatorMap = new Map<string, MutationHandlerDetails>();

    constructor(
        private readonly discoveryService: DiscoveryService,
        private readonly metadataScanner: MetadataScanner,
        private readonly reflector: Reflector
    ) {}

    /**
     * Gets the handler details for a specific mutation name
     */
    getHandler(mutationName: string): MutationHandlerDetails | undefined {
        return this.mutatorMap.get(mutationName);
    }

    /**
     * Gets all registered mutation names
     */
    getAllMutationNames(): string[] {
        return Array.from(this.mutatorMap.keys());
    }

    // Removed onModuleInit() {}

    // Make loadMutators public so it can be called from the test
    public loadMutators() {
        const providers = this.discoveryService.getProviders();
        const controllers = this.discoveryService.getControllers();

        // Removed InstanceWrapper type annotation from wrapper
        [...providers, ...controllers].forEach(wrapper => {
            const { instance } = wrapper;
            if (
                !instance ||
                !Object.getPrototypeOf(instance) ||
                wrapper.isAlias
            ) {
                return;
            }

            const mutatorMetadata = this.reflector.get<{ namespace: string }>( // Use this.reflector
                ZERO_MUTATOR_WATERMARK,
                instance.constructor
            );

            if (!mutatorMetadata) {
                return; // Not a @ZeroMutator class
            }

            this.metadataScanner.scanFromPrototype(
                // Use this.metadataScanner
                instance,
                Object.getPrototypeOf(instance),
                (methodKey: string) =>
                    this.registerMutatorHandler(
                        // Use this.registerMutatorHandler
                        instance,
                        methodKey,
                        mutatorMetadata.namespace
                    )
            );
        });
    }

    // Use standard private method syntax if preferred, or keep #
    private registerMutatorHandler(
        instance: object,
        methodKey: string,
        namespace: string
    ) {
        const methodRef = instance[methodKey as keyof typeof instance];
        if (typeof methodRef !== 'function') {
            return;
        }

        const handlerMetadata = this.reflector.get<{ name: string }>(
            ZERO_MUTATION_HANDLER_METADATA,
            methodRef
        );

        if (!handlerMetadata) {
            return; // Not a @Mutation method
        }

        const mutationName = namespace
            ? `${namespace}|${handlerMetadata.name}`
            : handlerMetadata.name;

        if (this.mutatorMap.has(mutationName)) {
            this.logger.warn(
                `Duplicate mutation handler found for: ${mutationName}. Overwriting.`
            );
        }

        // Get parameter metadata using the key we defined
        const paramMetadata: ZeroParamData[] =
            this.reflector.get(
                // Use this.reflector
                ZERO_MUTATION_PARAMS_METADATA,
                methodRef // Target should be the method reference, not constructor
            ) || [];

        // Sort by index to ensure correct order during invocation
        paramMetadata.sort((a, b) => a.index - b.index);

        this.mutatorMap.set(mutationName, {
            instance,
            handlerMethodKey: methodKey,
            paramFactories: paramMetadata
        });

        this.logger.log(
            `Registered mutation handler: ${mutationName} -> ${instance.constructor.name}.${methodKey}`
        );
    }
}
