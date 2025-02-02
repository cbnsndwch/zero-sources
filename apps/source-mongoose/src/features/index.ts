import { globalModules } from './global-modules.js';

// infra
import { HealthzModule } from './healthz/healthz.module.js';
import { MigrationsModule } from './migrations/migrations.module.js';
import { pokemonEntities } from './pokemon/entities/index.js';

// features
// import { BugsModule } from './bugs/bugs.module.js';
import { PokemonModule } from './pokemon/pokemon.module.js';
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
    MigrationsModule,
    // MetricsModule,
    /**
     * Application Feature
     */
    // BugsModule,
    PokemonModule,
    ZeroModule.forEntities([...pokemonEntities])
    /**
     * Maybe: Spikes, POCs, etc.
     */
];
