import { globalModules } from './global-modules.js';

// infra
import { HealthzModule } from './healthz/healthz.module.js';
import { MigrationsModule } from './migrations/migrations.module.js';

// features
// import { BugsModule } from './bugs/bugs.module.js';
import { PokemonModule } from './pokemon/pokemon.module.js';

export default [
    /**
     * Globals
     */
    ...globalModules,
    /**
     * Infra
     */
    HealthzModule,
    MigrationsModule,
    // MetricsModule,
    /**
     * Application Feature
     */
    // BugsModule,
    PokemonModule
    /**
     * Maybe: Spikes, POCs, etc.
     */
];
