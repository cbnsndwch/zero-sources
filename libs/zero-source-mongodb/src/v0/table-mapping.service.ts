import { Injectable } from '@nestjs/common';
import type { v0 } from '@rocicorp/zero/change-protocol/v0';

import type { TableMapping } from '@cbnsndwch/zero-contracts';

type TableSpec = v0.TableCreate['spec'];

/**
 * Mapping of Zero table name to its mapped table configuration
 */
export interface MappedTableMapping {
    tableName: string;
    config: TableMapping;
    spec: TableSpec;
}

// Legacy export for backwards compatibility
export type DiscriminatedTableMapping = MappedTableMapping;

/**
 * Service that manages mapped table configurations and mappings
 */
@Injectable()
export class TableMappingService {
    private mappedTables: Map<string, MappedTableMapping[]> = new Map();
    private fallbackTables: Map<string, TableSpec> = new Map();
    private isInitialized = false;

    /**
     * Initialize the service with table specifications
     */
    initialize(
        tableSpecs: TableSpec[],
        tableMappings: Record<string, TableMapping<any>> = {}
    ): void {
        this.mappedTables.clear();
        this.fallbackTables.clear();

        for (const spec of tableSpecs) {
            const tableMapping = tableMappings[spec.name];

            // this is a verbatim 1:1 table, no mapping
            if (!tableMapping) {
                this.fallbackTables.set(spec.name, spec);
                continue;
            }

            // This is a mapped table
            const mapping: MappedTableMapping = {
                tableName: spec.name,
                config: tableMapping,
                spec
            };

            if (!this.mappedTables.has(tableMapping.source)) {
                this.mappedTables.set(tableMapping.source, []);
            }
            this.mappedTables.get(tableMapping.source)!.push(mapping);
        }

        this.isInitialized = true;
    }

    /**
     * Gets all mapped table mappings for a source collection
     */
    getMappedTables(sourceCollection: string): MappedTableMapping[] {
        return this.mappedTables.get(sourceCollection) || [];
    }

    /**
     * @deprecated Use getMappedTables instead
     */
    getDiscriminatedTables(sourceCollection: string): MappedTableMapping[] {
        return this.getMappedTables(sourceCollection);
    }

    /**
     * Gets fallback table spec for direct mapping
     */
    getFallbackTable(tableName: string): TableSpec | undefined {
        return this.fallbackTables.get(tableName);
    }

    /**
     * Gets all source collections that have mapped tables
     */
    getMappedSources(): string[] {
        return Array.from(this.mappedTables.keys());
    }

    /**
     * @deprecated Use getMappedSources instead
     */
    getDiscriminatedSources(): string[] {
        return this.getMappedSources();
    }

    /**
     * Gets all direct table names
     */
    getFallbackTableNames(): string[] {
        return Array.from(this.fallbackTables.keys());
    }

    /**
     * Gets all collections that should be watched (both mapped and direct)
     */
    getAllWatchedCollections(): string[] {
        return [...this.getMappedSources(), ...this.getFallbackTableNames()];
    }

    /**
     * Checks if the service has been initialized
     */
    get initialized(): boolean {
        return this.isInitialized;
    }
}
