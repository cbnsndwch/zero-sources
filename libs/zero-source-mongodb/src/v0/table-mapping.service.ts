import { Injectable } from '@nestjs/common';
import type { v0 } from '@rocicorp/zero/change-protocol/v0';

import type { TableMapping } from '@cbnsndwch/zero-contracts';

import { parseTableMapping } from '../utils/table-mapping.js';
import { ConfigService } from '@nestjs/config';

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

    
    // constructor(
    //     config: ConfigService
    // ) {
    //     this.mappings = config.get<ZeroConfig>('tableMapping') || [];    
    // }

    /**
     * Initialize the service with table specifications
     */
    initialize(tableSpecs: TableSpec[]): void {
        this.mappedTables.clear();
        this.fallbackTables.clear();

        for (const spec of tableSpecs) {
            // Try to parse discriminated configuration from the .from() modifier
            const config = this.parseDiscriminatedConfigFromSpec(spec);

            if (config) {
                // This is a mapped table
                const cleanTableName = this.getCleanTableName(spec.name);
                const mapping: MappedTableMapping = {
                    tableName: cleanTableName,
                    config,
                    spec
                };

                if (!this.mappedTables.has(config.source)) {
                    this.mappedTables.set(config.source, []);
                }
                this.mappedTables.get(config.source)!.push(mapping);
            } else {
                // This is a traditional 1:1 table mapping
                const cleanTableName = this.getCleanTableName(spec.name);
                this.fallbackTables.set(cleanTableName, spec);
            }
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
     * Gets fallback table spec for traditional mapping
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
     * Gets all traditional table names
     */
    getFallbackTableNames(): string[] {
        return Array.from(this.fallbackTables.keys());
    }

    /**
     * Parses discriminated configuration from a TableSpec using the from field
     */
    private parseDiscriminatedConfigFromSpec(
        spec: TableSpec
    ): TableMapping | null {
        // Check if the spec has a from field with JSON configuration
        if ((spec as any).from && typeof (spec as any).from === 'string') {
            const config = parseTableMapping((spec as any).from);
            if (config) {
                return config;
            }
        }

        // Fallback to the hardcoded naming convention as backup
        return this.getDiscriminatedConfigForTable(spec.name);
    }

    /**
     * Maps JSON configuration strings to clean table names
     */
    private getCleanTableName(configOrName: string): string {
        // If it's a JSON config string, extract the clean table name
        if (configOrName.startsWith('{')) {
            try {
                const config = JSON.parse(configOrName);

                // Map based on source and filter to clean table names
                if (config.source === 'rooms') {
                    if (config.filter?.t === 'd') return 'chats';
                    if (config.filter?.t === 'p') return 'groups';
                    if (config.filter?.t === 'c') return 'channels';
                }

                if (config.source === 'messages') {
                    if (config.filter?.t === 'text') return 'textMessages';
                    if (config.filter?.t === 'image') return 'imageMessages';
                    if (config.filter?.t === 'system') return 'systemMessages';
                }

                if (config.source === 'users') {
                    return 'users';
                }

                // Fallback: use source name if no specific mapping
                return config.source;
            } catch {
                // If JSON parsing fails, return as-is
                return configOrName;
            }
        }

        // If it's already a clean name, return as-is
        return configOrName;
    }

    /**
     * Gets all collections that should be watched (both mapped and traditional)
     */
    getAllWatchedCollections(): string[] {
        return [...this.getMappedSources(), ...this.getFallbackTableNames()];
    }

    /**
     * Determines mapped table configuration for a table based on naming convention
     * This is now a fallback solution when no JSON config is found in the .from() field
     */
    private getDiscriminatedConfigForTable(
        tableName: string
    ): TableMapping | null {
        // Define mapped table configurations based on the ZRocket spec
        const configurations: Record<string, TableMapping> = {
            chats: {
                source: 'rooms',
                filter: { t: 'd', archived: { $ne: true } },
                projection: {
                    _id: 1,
                    memberIds: 1,
                    createdAt: 1,
                    lastMessageAt: 1,
                    usernames: 1
                }
            },
            groups: {
                source: 'rooms',
                filter: { t: 'p', archived: { $ne: true } },
                projection: {
                    _id: 1,
                    name: 1,
                    memberIds: 1,
                    createdAt: 1,
                    lastMessageAt: 1,
                    description: 1,
                    topic: 1
                }
            },
            channels: {
                source: 'rooms',
                filter: { t: 'c', archived: { $ne: true } },
                projection: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    memberIds: 1,
                    createdAt: 1,
                    lastMessageAt: 1,
                    topic: 1,
                    featured: 1,
                    default: 1
                }
            },
            textMessages: {
                source: 'messages',
                filter: { t: 'text', hidden: { $ne: true } },
                projection: {
                    _id: 1,
                    roomId: 1,
                    sender: 1,
                    contents: 1,
                    ts: 1,
                    md: 1
                }
            },
            imageMessages: {
                source: 'messages',
                filter: { t: 'image', hidden: { $ne: true } },
                projection: {
                    _id: 1,
                    roomId: 1,
                    sender: 1,
                    imageUrl: 1,
                    caption: 1,
                    imageMetadata: 1,
                    ts: 1
                }
            },
            systemMessages: {
                source: 'messages',
                filter: { t: 'system' },
                projection: {
                    _id: 1,
                    roomId: 1,
                    action: 1,
                    targetUserId: 1,
                    ts: 1,
                    metadata: 1
                }
            },
            userParticipants: {
                source: 'participants',
                filter: { type: 'user' },
                projection: {
                    _id: 1,
                    userId: 1,
                    roomId: 1,
                    role: 1,
                    joinedAt: 1,
                    lastReadAt: 1,
                    'notificationSettings.muted': 1
                }
            },
            botParticipants: {
                source: 'participants',
                filter: { type: 'bot' },
                projection: {
                    _id: 1,
                    botId: 1,
                    roomId: 1,
                    role: 1,
                    joinedAt: 1,
                    config: 1
                }
            }
        };

        return configurations[tableName] || null;
    }

    /**
     * Checks if the service has been initialized
     */
    get initialized(): boolean {
        return this.isInitialized;
    }
}
