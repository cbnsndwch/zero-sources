import { zrocketGlobalModules } from './global-modules.js';

// infra
import { HealthzModule } from './healthz/healthz.module.js';

// features
import { AuthModule } from './auth/auth.module.js';
import { ChatModule } from './chat/chat.module.js';
import { SchemaExportModule } from './schema-export/schema-export.module.js';
import { UsersModule } from './users/users.module.js';
import { ZeroQueriesModule } from './zero-queries/zero-queries.module.js';
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
     * Application Features
     */
    AuthModule,
    ChatModule,
    UsersModule,
    ZeroQueriesModule,
    /**
     * Schema Export API for Source Server
     */
    SchemaExportModule,
    /**
     * ZRocket Demo - Discriminated Union tables
     */
    ZRocketModule
];
