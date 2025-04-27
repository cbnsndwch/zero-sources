import { Module, Global } from '@nestjs/common';
import { DiscoveryModule as NestDiscoveryModule } from '@nestjs/core';

import { ZeroMutatorRegistry } from './zero-mutator-registry.service.js';

/**
 * A global module that provides the ZeroMutatorRegistry service.
 * This module handles discovery of Zero mutation handlers using NestJS's discovery system.
 */
@Global()
@Module({
    imports: [NestDiscoveryModule],
    providers: [ZeroMutatorRegistry],
    // Export both the registry and the underlying discovery module
    exports: [ZeroMutatorRegistry, NestDiscoveryModule]
})
export class ZeroDiscoveryModule {}
