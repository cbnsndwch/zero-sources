import { Injectable } from '@nestjs/common';
import type { v0 } from '@rocicorp/zero/change-protocol/v0';

import { 
    parseDiscriminatedConfig, 
    type DiscriminatedTableConfig 
} from '../utils/discriminated-union.js';

type TableSpec = v0.TableCreate['spec'];

/**
 * Mapping of Zero table name to its discriminated configuration
 */
export interface DiscriminatedTableMapping {
    tableName: string;
    config: DiscriminatedTableConfig;
    spec: TableSpec;
}

/**
 * Service that manages discriminated table configurations and mappings
 */
@Injectable()
export class DiscriminatedTableService {
    private discriminatedTables: Map<string, DiscriminatedTableMapping[]> = new Map();
    private fallbackTables: Map<string, TableSpec> = new Map();
    private isInitialized = false;

    /**
     * Initialize the service with table specifications
     */
    initialize(tableSpecs: TableSpec[]): void {
        this.discriminatedTables.clear();
        this.fallbackTables.clear();
        
        for (const spec of tableSpecs) {
            // Try to parse discriminated configuration from the table name/from modifier
            // For now, we'll use a naming convention since we can't store JSON in .from()
            const config = this.getDiscriminatedConfigForTable(spec.name);
            
            if (config) {
                // This is a discriminated table
                const mapping: DiscriminatedTableMapping = {
                    tableName: spec.name,
                    config,
                    spec
                };

                if (!this.discriminatedTables.has(config.source)) {
                    this.discriminatedTables.set(config.source, []);
                }
                this.discriminatedTables.get(config.source)!.push(mapping);
            } else {
                // This is a traditional 1:1 table mapping
                this.fallbackTables.set(spec.name, spec);
            }
        }
        
        this.isInitialized = true;
    }

    /**
     * Gets all discriminated table mappings for a source collection
     */
    getDiscriminatedTables(sourceCollection: string): DiscriminatedTableMapping[] {
        return this.discriminatedTables.get(sourceCollection) || [];
    }

    /**
     * Gets fallback table spec for traditional mapping
     */
    getFallbackTable(tableName: string): TableSpec | undefined {
        return this.fallbackTables.get(tableName);
    }

    /**
     * Gets all source collections that have discriminated tables
     */
    getDiscriminatedSources(): string[] {
        return Array.from(this.discriminatedTables.keys());
    }

    /**
     * Gets all traditional table names
     */
    getFallbackTableNames(): string[] {
        return Array.from(this.fallbackTables.keys());
    }

    /**
     * Gets all collections that should be watched (both discriminated and traditional)
     */
    getAllWatchedCollections(): string[] {
        return [
            ...this.getDiscriminatedSources(),
            ...this.getFallbackTableNames()
        ];
    }

    /**
     * Determines discriminated configuration for a table based on naming convention
     * This is a temporary solution until we can properly extract from Zero schema
     */
    private getDiscriminatedConfigForTable(tableName: string): DiscriminatedTableConfig | null {
        // Define discriminated table configurations based on the ZRocket spec
        const configurations: Record<string, DiscriminatedTableConfig> = {
            'chats': {
                source: 'rooms',
                filter: { t: 'd', archived: { $ne: true } },
                projection: { _id: 1, memberIds: 1, createdAt: 1, lastMessageAt: 1, usernames: 1 }
            },
            'groups': {
                source: 'rooms',
                filter: { t: 'p', archived: { $ne: true } },
                projection: { _id: 1, name: 1, memberIds: 1, createdAt: 1, lastMessageAt: 1, description: 1, topic: 1 }
            },
            'channels': {
                source: 'rooms',
                filter: { t: 'c', archived: { $ne: true } },
                projection: { _id: 1, name: 1, description: 1, memberIds: 1, createdAt: 1, lastMessageAt: 1, topic: 1, featured: 1, default: 1 }
            },
            'textMessages': {
                source: 'messages',
                filter: { t: 'text', hidden: { $ne: true } },
                projection: { _id: 1, roomId: 1, sender: 1, contents: 1, ts: 1, md: 1 }
            },
            'imageMessages': {
                source: 'messages',
                filter: { t: 'image', hidden: { $ne: true } },
                projection: { _id: 1, roomId: 1, sender: 1, imageUrl: 1, caption: 1, imageMetadata: 1, ts: 1 }
            },
            'systemMessages': {
                source: 'messages',
                filter: { t: 'system' },
                projection: { _id: 1, roomId: 1, action: 1, targetUserId: 1, ts: 1, metadata: 1 }
            },
            'userParticipants': {
                source: 'participants',
                filter: { type: 'user' },
                projection: { _id: 1, userId: 1, roomId: 1, role: 1, joinedAt: 1, lastReadAt: 1, 'notificationSettings.muted': 1 }
            },
            'botParticipants': {
                source: 'participants',
                filter: { type: 'bot' },
                projection: { _id: 1, botId: 1, roomId: 1, role: 1, joinedAt: 1, config: 1 }
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