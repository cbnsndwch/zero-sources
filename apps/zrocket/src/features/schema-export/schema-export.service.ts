import { Injectable } from '@nestjs/common';
import { schema, mapping } from '@cbnsndwch/zrocket-contracts/schema';

import { tableSpecsFromSchema } from '../utils.js';

export interface ExportedSchema {
    version: number;
    tables: any[];
    metadata: {
        application: string;
        exportedAt: string;
        sourceVersion: string;
    };
}

export interface ExportedTableMappings {
    version: number;
    mappings: Record<string, any>;
    metadata: {
        application: string;
        exportedAt: string;
        sourceVersion: string;
    };
}

@Injectable()
export class SchemaExportService {
    /**
     * Export the Zero schema in a format that the source server can consume
     */
    exportSchema(): ExportedSchema {
        const tableSpecs = tableSpecsFromSchema(schema);
        
        return {
            version: 1,
            tables: tableSpecs,
            metadata: {
                application: 'zrocket',
                exportedAt: new Date().toISOString(),
                sourceVersion: process.env.npm_package_version || '1.0.0'
            }
        };
    }

    /**
     * Export table mappings for MongoDB collection to table mappings
     */
    exportTableMappings(): ExportedTableMappings {
        return {
            version: 1,
            mappings: mapping,
            metadata: {
                application: 'zrocket',
                exportedAt: new Date().toISOString(),
                sourceVersion: process.env.npm_package_version || '1.0.0'
            }
        };
    }

    /**
     * Export both schema and mappings as a combined configuration
     */
    exportCombinedConfig() {
        return {
            schema: this.exportSchema(),
            mapping: this.exportTableMappings(),
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Generate configuration files for the source server
     */
    generateSourceServerConfig() {
        const schema = this.exportSchema();
        const mappings = this.exportTableMappings();

        return {
            // Configuration that the source server can use
            sourceServerConfig: {
                schema: {
                    source: 'url',
                    schemaUrl: `${process.env.BASE_URL || 'http://localhost:8011'}/api/schema/export`,
                    tableMappingsUrl: `${process.env.BASE_URL || 'http://localhost:8011'}/api/schema/table-mappings`
                }
            },
            // Direct file contents for file-based configuration
            files: {
                'zrocket-schema.json': schema,
                'zrocket-table-mappings.json': mappings
            }
        };
    }
}
