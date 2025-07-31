import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient, Db } from 'mongodb';

import { SchemaLoaderService, LoadedSchema } from '../schema/schema-loader.service.js';
import { AppConfig, DbConfig } from '../../config/contracts.js';

export interface SchemaMetadata {
    _id?: string;
    version: number;
    tableConfigurations: Record<string, any[]>;
    permissions: any;
    lastUpdated: string;
    source: string;
}

export interface InterestMetadata {
    _id?: string;
    clientId: string;
    interests: string[];
    filters: Record<string, any>;
    lastUpdated: string;
}

@Injectable()
export class MetadataService {
    private readonly logger = new Logger(MetadataService.name);
    private client: MongoClient | null = null;
    private db: Db | null = null;

    constructor(
        private readonly configService: ConfigService<AppConfig>,
        private readonly schemaLoader: SchemaLoaderService
    ) {}

    async connect(): Promise<Db> {
        if (!this.client) {
            const dbConfig = this.configService.get<DbConfig>('db')!;
            this.client = new MongoClient(dbConfig.uri);
            await this.client.connect();
            this.db = this.client.db();
        }
        return this.db!;
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.db = null;
        }
    }

    /**
     * Get schema metadata (combines loaded schema with stored metadata)
     */
    async getSchemaMetadata(): Promise<SchemaMetadata> {
        const db = await this.connect();

        try {
            // Try to get stored metadata from MongoDB first
            const storedSchema = await db
                .collection<SchemaMetadata>('_zero_schemas')
                .findOne({ version: 1 });

            if (storedSchema && this.isRecentEnough(storedSchema.lastUpdated)) {
                return storedSchema;
            }

            // Load fresh schema and generate metadata
            const loadedSchema = await this.schemaLoader.loadSchema();
            const metadata = await this.generateSchemaMetadata(loadedSchema);

            // Store the metadata for future use
            await this.saveSchemaMetadata(metadata);

            return metadata;
        } catch (error) {
            this.logger.error(`Failed to get schema metadata: ${error}`);
            throw error;
        }
    }

    /**
     * Get table configurations from loaded schema
     */
    async getTableConfigurations(): Promise<Record<string, any[]>> {
        const metadata = await this.getSchemaMetadata();
        return metadata.tableConfigurations;
    }

    /**
     * Get information about discriminated tables
     */
    async getDiscriminatedTablesInfo(): Promise<{
        discriminatedTables: Record<string, string[]>;
        traditionalTables: string[];
        totalTables: number;
        metadata: any;
    }> {
        const loadedSchema = await this.schemaLoader.loadSchema();
        const tableConfigurations = await this.getTableConfigurations();

        const discriminatedTables: Record<string, string[]> = {};
        const traditionalTables: string[] = [];

        // Extract discriminated tables by source
        for (const [sourceName, tables] of Object.entries(tableConfigurations)) {
            const sourceKey = sourceName
                .replace('from', '')
                .replace('Collection', '')
                .toLowerCase();
            discriminatedTables[sourceKey] = (tables as any[]).map(t => t.name);
        }

        // Get traditional tables (non-discriminated)
        const allTableNames = loadedSchema.tables.map(table => table.name);
        const discriminatedTableNames = new Set(
            Object.values(discriminatedTables).flat()
        );

        for (const tableName of allTableNames) {
            if (!discriminatedTableNames.has(tableName)) {
                traditionalTables.push(tableName);
            }
        }

        return {
            discriminatedTables,
            traditionalTables,
            totalTables: allTableNames.length,
            metadata: {
                discriminatedCount: Object.values(discriminatedTables).reduce(
                    (sum, tables) => sum + tables.length,
                    0
                ),
                traditionalCount: traditionalTables.length,
                generatedAt: new Date().toISOString(),
                schemaSource: loadedSchema.metadata.source
            }
        };
    }

    /**
     * Save schema metadata to MongoDB
     */
    async saveSchemaMetadata(metadata: SchemaMetadata): Promise<void> {
        const db = await this.connect();
        metadata.lastUpdated = new Date().toISOString();

        await db
            .collection<SchemaMetadata>('_zero_schemas')
            .replaceOne({ version: metadata.version }, metadata, {
                upsert: true
            });
    }

    /**
     * Get client interests
     */
    async getClientInterests(clientId: string): Promise<InterestMetadata | null> {
        const db = await this.connect();
        return await db
            .collection<InterestMetadata>('_zero_interests')
            .findOne({ clientId });
    }

    /**
     * Save client interests
     */
    async saveClientInterests(interests: InterestMetadata): Promise<void> {
        const db = await this.connect();
        interests.lastUpdated = new Date().toISOString();

        await db
            .collection<InterestMetadata>('_zero_interests')
            .replaceOne({ clientId: interests.clientId }, interests, {
                upsert: true
            });
    }

    /**
     * List all stored schemas
     */
    async listAllSchemas(): Promise<SchemaMetadata[]> {
        const db = await this.connect();
        return await db
            .collection<SchemaMetadata>('_zero_schemas')
            .find()
            .toArray();
    }

    /**
     * List all client interests
     */
    async listAllInterests(): Promise<InterestMetadata[]> {
        const db = await this.connect();
        return await db
            .collection<InterestMetadata>('_zero_interests')
            .find()
            .toArray();
    }

    /**
     * Generate metadata from loaded schema
     */
    private async generateSchemaMetadata(loadedSchema: LoadedSchema): Promise<SchemaMetadata> {
        const tableConfigurations = this.extractTableConfigurations(loadedSchema);
        
        return {
            version: loadedSchema.metadata.version,
            tableConfigurations,
            permissions: this.extractPermissions(loadedSchema),
            lastUpdated: new Date().toISOString(),
            source: loadedSchema.metadata.source
        };
    }

    /**
     * Extract table configurations from loaded schema
     */
    private extractTableConfigurations(loadedSchema: LoadedSchema): Record<string, any[]> {
        const configurations: Record<string, any[]> = {};
        const { tableMappings } = loadedSchema;

        if (!tableMappings || Object.keys(tableMappings).length === 0) {
            // No discriminated unions, return empty configurations
            return configurations;
        }

        // Group tables by their source collection
        const sourceGroups: Record<string, any[]> = {};

        for (const [tableName, config] of Object.entries(tableMappings)) {
            if (config && (config as any).source) {
                const source = (config as any).source;
                if (!sourceGroups[source]) {
                    sourceGroups[source] = [];
                }
                sourceGroups[source].push({
                    name: tableName,
                    filter: (config as any).filter,
                    projection: (config as any).projection || {},
                    description: this.getTableDescription(tableName, (config as any).filter)
                });
            }
        }

        // Map source collections to readable names
        const sourceNames: Record<string, string> = {
            rooms: 'fromRoomsCollection',
            messages: 'fromMessagesCollection',
            participants: 'fromParticipantsCollection'
        };

        for (const [source, tables] of Object.entries(sourceGroups)) {
            const readableName =
                sourceNames[source] ||
                `from${source.charAt(0).toUpperCase() + source.slice(1)}Collection`;
            configurations[readableName] = tables;
        }

        return configurations;
    }

    /**
     * Extract permissions from loaded schema
     */
    private extractPermissions(loadedSchema: LoadedSchema): any {
        // This could be enhanced to read actual permissions from schema
        // For now, return a default policy
        return {
            defaultPolicy: 'ANYONE_CAN_READ_NOBODY_CAN_WRITE',
            tableOverrides: {},
            source: loadedSchema.metadata.source
        };
    }

    /**
     * Get description for a table based on its name and filter
     */
    private getTableDescription(tableName: string, filter: any): string {
        const descriptions: Record<string, string> = {
            chats: 'Direct message rooms',
            groups: 'Private group rooms',
            channels: 'Public channel rooms',
            messages: 'User messages (text, images, etc.)',
            systemMessages: 'System-generated messages for events',
            users: 'User accounts and profiles'
        };

        return (
            descriptions[tableName] ||
            `Table filtered by ${JSON.stringify(filter)}`
        );
    }

    /**
     * Check if metadata is recent enough to avoid reloading
     */
    private isRecentEnough(lastUpdated: string): boolean {
        const lastUpdate = new Date(lastUpdated);
        const now = new Date();
        const ageInMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
        
        // Consider metadata fresh for 5 minutes
        return ageInMinutes < 5;
    }
}
