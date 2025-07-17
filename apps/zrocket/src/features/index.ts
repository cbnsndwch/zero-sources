import { globalModules } from './global-modules.js';

// infra
import { HealthzModule } from './healthz/healthz.module.js';

// features
import { AuthModule } from './auth/auth.module.js';
import { ChatModule } from './chat/chat.module.js';
import { UsersModule } from './users/users.module.js';

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
    AuthModule,
    ChatModule,
    UsersModule
    /**
     * Maybe: Spikes, POCs, etc.
     */
];
