import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFile } from 'fs/promises';
import { join } from 'path';

import type { TableSpec } from '@cbnsndwch/zero-source-mongodb';

import { AppConfig, SchemaConfig } from '../../config/contracts.js';

export interface LoadedSchema {
    tables: TableSpec[];
    tableMappings: Record<string, any>;
    metadata: {
        version: number;
        loadedAt: string;
        source: string;
    };
}

@Injectable()
export class SchemaLoaderService {
    private readonly logger = new Logger(SchemaLoaderService.name);
    private cachedSchema: LoadedSchema | null = null;

    constructor(private readonly configService: ConfigService<AppConfig>) {}

    /**
     * Loads schema and table mappings based on configuration
     */
    async loadSchema(): Promise<LoadedSchema> {
        if (this.cachedSchema) {
            return this.cachedSchema;
        }

        const schemaConfig = this.configService.get<SchemaConfig>('schema')!;
        
        let schema: LoadedSchema;

        switch (schemaConfig.source) {
            case 'file':
                schema = await this.loadFromFiles(schemaConfig);
                break;
            case 'url':
                schema = await this.loadFromUrls(schemaConfig);
                break;
            case 'inline':
                schema = this.loadFromInline(schemaConfig);
                break;
            default:
                throw new Error(`Unsupported schema source: ${(schemaConfig as any).source}`);
        }

        this.cachedSchema = schema;
        this.logger.log(`Schema loaded successfully from ${schemaConfig.source}`);
        return schema;
    }

    /**
     * Clears the cached schema (useful for testing or hot-reloading)
     */
    clearCache(): void {
        this.cachedSchema = null;
        this.logger.log('Schema cache cleared');
    }

    /**
     * Load schema from local files
     */
    private async loadFromFiles(config: SchemaConfig): Promise<LoadedSchema> {
        if (!config.schemaFile) {
            throw new Error('schemaFile is required when source is "file"');
        }

        try {
            // Load schema file
            const schemaPath = this.resolveFilePath(config.schemaFile);
            const schemaContent = await readFile(schemaPath, 'utf-8');
            const schemaData = JSON.parse(schemaContent);

            // Load table mappings file (optional)
            let tableMappings: Record<string, any> = {};
            if (config.tableMappingsFile) {
                const mappingsPath = this.resolveFilePath(config.tableMappingsFile);
                const mappingsContent = await readFile(mappingsPath, 'utf-8');
                tableMappings = JSON.parse(mappingsContent);
            }

            return {
                tables: this.extractTableSpecs(schemaData),
                tableMappings,
                metadata: {
                    version: schemaData.version || 1,
                    loadedAt: new Date().toISOString(),
                    source: `file:${config.schemaFile}`
                }
            };
        } catch (error) {
            this.logger.error(`Failed to load schema from files: ${error}`);
            throw new Error(`Schema loading failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Load schema from HTTP URLs
     */
    private async loadFromUrls(config: SchemaConfig): Promise<LoadedSchema> {
        if (!config.schemaUrl) {
            throw new Error('schemaUrl is required when source is "url"');
        }

        try {
            // Fetch schema
            const schemaResponse = await fetch(config.schemaUrl);
            if (!schemaResponse.ok) {
                throw new Error(`HTTP ${schemaResponse.status}: ${schemaResponse.statusText}`);
            }
            const schemaData = await schemaResponse.json() as any;

            // Fetch table mappings (optional)
            let tableMappings: Record<string, any> = {};
            if (config.tableMappingsUrl) {
                const mappingsResponse = await fetch(config.tableMappingsUrl);
                if (mappingsResponse.ok) {
                    tableMappings = await mappingsResponse.json() as Record<string, any>;
                } else {
                    this.logger.warn(`Could not fetch table mappings from ${config.tableMappingsUrl}`);
                }
            }

            return {
                tables: this.extractTableSpecs(schemaData),
                tableMappings,
                metadata: {
                    version: schemaData.version || 1,
                    loadedAt: new Date().toISOString(),
                    source: `url:${config.schemaUrl}`
                }
            };
        } catch (error) {
            this.logger.error(`Failed to load schema from URLs: ${error}`);
            throw new Error(`Schema loading failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Load schema from inline configuration
     */
    private loadFromInline(config: SchemaConfig): LoadedSchema {
        if (!config.inlineSchema) {
            throw new Error('inlineSchema is required when source is "inline"');
        }

        return {
            tables: this.extractTableSpecs(config.inlineSchema),
            tableMappings: config.inlineTableMappings || {},
            metadata: {
                version: config.inlineSchema.version || 1,
                loadedAt: new Date().toISOString(),
                source: 'inline'
            }
        };
    }

    /**
     * Extract TableSpec array from schema data
     */
    private extractTableSpecs(schemaData: any): TableSpec[] {
        // This method should convert the schema format to TableSpec[]
        // The exact implementation depends on your schema format
        
        if (Array.isArray(schemaData.tables)) {
            return schemaData.tables;
        }

        if (schemaData.tables && typeof schemaData.tables === 'object') {
            // Convert from object format to array format
            return Object.entries(schemaData.tables).map(([name, tableConfig]: [string, any]) => ({
                schema: 'public',
                name,
                primaryKey: tableConfig.primaryKey || ['_id'],
                columns: this.extractColumns(tableConfig.columns || {})
            }));
        }

        throw new Error('Invalid schema format: expected tables array or object');
    }

    /**
     * Extract column specifications from table configuration
     */
    private extractColumns(columnsConfig: any): Record<string, any> {
        const columns: Record<string, any> = {};
        let pos = 1;

        for (const [columnName, columnConfig] of Object.entries(columnsConfig)) {
            columns[columnName] = {
                pos: pos++,
                dataType: this.mapDataType(columnConfig),
                notNull: (columnConfig as any)?.notNull || false
            };
        }

        return columns;
    }

    /**
     * Map Zero data types to PostgreSQL-compatible types
     */
    private mapDataType(columnConfig: any): string {
        // This is a simplified mapping - you might need to extend this
        // based on your actual Zero schema types
        const typeMapping: Record<string, string> = {
            'string': 'varchar',
            'number': 'numeric',
            'boolean': 'boolean',
            'json': 'jsonb',
            'date': 'timestamp'
        };

        const columnType = (columnConfig as any)?.type || 'string';
        return typeMapping[columnType] || 'varchar';
    }

    /**
     * Resolve file path relative to app root or as absolute path
     */
    private resolveFilePath(filePath: string): string {
        if (filePath.startsWith('/')) {
            return filePath; // Absolute path
        }
        
        // Relative to app root
        return join(process.cwd(), filePath);
    }
}
