import { SyncedQueriesModule } from '@cbnsndwch/nest-zero-synced-queries';

import { zrocketGlobalModules } from './global-modules.js';

// infra
import { HealthzModule } from './healthz/healthz.module.js';

// features
import { AuthModule } from './auth/auth.module.js';
import { ChatModule } from './chat/chat.module.js';
import { SchemaExportModule } from './schema-export/schema-export.module.js';
import { UsersModule } from './users/users.module.js';
import { ZRocketModule } from './zrocket/zrocket.module.js';

export default [
    /**
     * Globals with ZRocket discriminated union support
     */
    ...zrocketGlobalModules,
    /**
     * Infra
     */
    HealthzModule,
    /**
     * Zero Synced Queries Infrastructure
     *
     * Provides automatic discovery and HTTP endpoint for @SyncedQuery decorated methods.
     * Query implementations live in their respective domain modules (ChatModule, etc.)
     */
    SyncedQueriesModule.forRoot({
        path: 'api/zero/get-queries',
        getUserFromRequest: req => req.user
    }),
    /**
     * Application Features
     */
    AuthModule,
    ChatModule,
    UsersModule,
    /**
     * Schema Export API for Source Server
     */
    SchemaExportModule,
    /**
     * ZRocket Demo - Discriminated Union tables
     */
    ZRocketModule
];
