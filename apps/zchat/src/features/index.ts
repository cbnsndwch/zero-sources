import { globalModules } from './global-modules.js';

// infra
import { HealthzModule } from './healthz/healthz.module.js';

// features
import { ChatModule } from './chat/chat.module.js';

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
    ChatModule
    /**
     * Maybe: Spikes, POCs, etc.
     */
];
