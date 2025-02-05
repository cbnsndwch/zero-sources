import { globalModules } from './global-modules.js';

// infra
import { HealthzModule } from './healthz/healthz.module.js';

// features
import { ZeroModule } from './zero/zero.module.js';

export default [
    /**
     * Globals
     */
    ...globalModules,
    /**
     * Infra
     */
    HealthzModule,
    /**
     * Application Feature
     */
    ZeroModule
    /**
     * Maybe: Spikes, POCs, etc.
     */
];
