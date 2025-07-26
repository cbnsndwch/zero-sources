import { Injectable } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';
import { discriminatedSchema } from '@cbnsndwch/zrocket-contracts';

export interface SchemaMetadata {
    _id?: string;
    version: number;
    tableConfigurations: Record<string, any[]>;
    permissions: any;
    lastUpdated: string;
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
    private client: MongoClient | null = null;
    private db: Db | null = null;

    async connect(
        mongoUri: string = process.env.MONGODB_URI ||
            'mongodb://localhost:27017/zrocket'
    ) {
        if (!this.client) {
            this.client = new MongoClient(mongoUri);
            await this.client.connect();
            this.db = this.client.db();
        }
        return this.db;
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.db = null;
        }
    }

    async getSchemaMetadata(): Promise<SchemaMetadata> {
        const db = await this.connect();

        // Try to get schema from MongoDB first
        const storedSchema = await db
            .collection<SchemaMetadata>('_zero_schemas')
            .findOne({ version: 1 });

        if (storedSchema) {
            return storedSchema;
        }

        // Fallback to extracting from hardcoded schema
        const fallbackSchema: SchemaMetadata = {
            version: 1,
            tableConfigurations: this.extractTableConfigurations(),
            permissions: this.extractPermissions(),
            lastUpdated: new Date().toISOString()
        };

        // Store the fallback schema for future use
        await this.saveSchemaMetadata(fallbackSchema);

        return fallbackSchema;
    }

    async saveSchemaMetadata(metadata: SchemaMetadata): Promise<void> {
        const db = await this.connect();
        metadata.lastUpdated = new Date().toISOString();

        await db
            .collection<SchemaMetadata>('_zero_schemas')
            .replaceOne({ version: metadata.version }, metadata, {
                upsert: true
            });
    }

    async getClientInterests(
        clientId: string
    ): Promise<InterestMetadata | null> {
        const db = await this.connect();
        return await db
            .collection<InterestMetadata>('_zero_interests')
            .findOne({ clientId });
    }

    async saveClientInterests(interests: InterestMetadata): Promise<void> {
        const db = await this.connect();
        interests.lastUpdated = new Date().toISOString();

        await db
            .collection<InterestMetadata>('_zero_interests')
            .replaceOne({ clientId: interests.clientId }, interests, {
                upsert: true
            });
    }

    async listAllSchemas(): Promise<SchemaMetadata[]> {
        const db = await this.connect();
        return await db
            .collection<SchemaMetadata>('_zero_schemas')
            .find()
            .toArray();
    }

    async listAllInterests(): Promise<InterestMetadata[]> {
        const db = await this.connect();
        return await db
            .collection<InterestMetadata>('_zero_interests')
            .find()
            .toArray();
    }

    private extractTableConfigurations(): Record<string, any[]> {
        const configurations: Record<string, any[]> = {};
        const tables = discriminatedSchema.tables;
        const sourceGroups: Record<string, any[]> = {};

        for (const table of Object.values(tables)) {
            const tableName = (table as any).name;
            const fromConfig = (table as any).from;

            if (fromConfig && typeof fromConfig === 'string') {
                try {
                    const config = JSON.parse(fromConfig);
                    if (config.source && config.filter) {
                        if (!sourceGroups[config.source]) {
                            sourceGroups[config.source] = [];
                        }
                        sourceGroups[config.source].push({
                            name: tableName,
                            filter: config.filter,
                            projection: config.projection || {},
                            description: this.getTableDescription(
                                tableName,
                                config.filter
                            )
                        });
                    }
                } catch {
                    // Ignore non-JSON from configs (traditional tables)
                }
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

    private extractPermissions(): any {
        // Extract permissions from the discriminated schema
        // For now, return a simplified version
        return {
            defaultPolicy: 'ANYONE_CAN_READ_NOBODY_CAN_WRITE',
            tableOverrides: {
                users: 'READ_ONLY',
                textMessages: 'SENDER_CAN_EDIT',
                imageMessages: 'SENDER_CAN_EDIT',
                systemMessages: 'READ_ONLY'
            }
        };
    }

    private getTableDescription(tableName: string, filter: any): string {
        const descriptions: Record<string, string> = {
            chats: 'Direct message rooms',
            groups: 'Private group rooms',
            channels: 'Public channel rooms',
            textMessages: 'Text-based messages',
            imageMessages: 'Image messages with metadata',
            systemMessages: 'System-generated messages for events',
            userParticipants: 'Human user participants',
            botParticipants: 'Bot participants with configuration'
        };

        return (
            descriptions[tableName] ||
            `Table filtered by ${JSON.stringify(filter)}`
        );
    }
}
