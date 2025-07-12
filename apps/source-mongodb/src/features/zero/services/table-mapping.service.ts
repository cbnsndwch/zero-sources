import { Injectable, Logger } from '@nestjs/common';
import type { Document } from 'mongodb';

import type { UpstreamTableMapping } from '../../../config/contracts.js';

export interface TableMappingConfig {
    /**
     * Maps Zero table names to their upstream collection mappings
     */
    tables: { [zeroTableName: string]: UpstreamTableMapping };
}

export interface TableMatch {
    /**
     * The Zero table name this document matches
     */
    tableName: string;
    
    /**
     * The transformed document after applying projection
     */
    document: Document;
}

/**
 * Service for managing table mappings, filtering, and projections
 * for dynamic Zero tables from upstream MongoDB collections.
 */
@Injectable()
export class TableMappingService {
    private readonly logger = new Logger(TableMappingService.name);

    /**
     * Gets all unique upstream collection names from table mappings
     */
    getSourceCollections(config: TableMappingConfig): string[] {
        const collections = new Set<string>();
        
        for (const mapping of Object.values(config.tables)) {
            collections.add(mapping.source);
        }
        
        return Array.from(collections);
    }

    /**
     * Finds which Zero tables a document from a specific collection should be routed to,
     * applying filters and projections as needed.
     */
    getTableMatches(
        collectionName: string, 
        document: Document, 
        config: TableMappingConfig
    ): TableMatch[] {
        const matches: TableMatch[] = [];

        for (const [tableName, mapping] of Object.entries(config.tables)) {
            // Skip if this mapping is for a different collection
            if (mapping.source !== collectionName) {
                continue;
            }

            // Apply filter if specified
            if (mapping.filter && !this.matchesFilter(document, mapping.filter)) {
                continue;
            }

            // Apply projection if specified
            const projectedDoc = mapping.projection 
                ? this.applyProjection(document, mapping.projection)
                : document;

            matches.push({
                tableName,
                document: projectedDoc
            });
        }

        return matches;
    }

    /**
     * Creates a MongoDB aggregation pipeline for change streams
     * that includes all collections referenced in the table mappings.
     */
    createChangeStreamPipeline(config: TableMappingConfig): any[] {
        const sourceCollections = this.getSourceCollections(config);
        
        return [
            {
                $match: {
                    'ns.coll': { $in: sourceCollections }
                }
            }
        ];
    }

    /**
     * Checks if a document matches a MongoDB query filter.
     * This is a simplified implementation that handles basic equality and $in operators.
     * For production use, consider using a more robust query evaluation library.
     */
    private matchesFilter(document: Document, filter: object): boolean {
        try {
            return this.evaluateFilter(document, filter);
        } catch (error) {
            this.logger.warn(`Failed to evaluate filter: ${error}`, { filter, document });
            return false;
        }
    }

    /**
     * Recursively evaluates a MongoDB-style filter against a document.
     */
    private evaluateFilter(document: Document, filter: any): boolean {
        if (typeof filter !== 'object' || filter === null) {
            return false;
        }

        for (const [key, value] of Object.entries(filter)) {
            if (key.startsWith('$')) {
                // Handle MongoDB operators
                if (!this.evaluateOperator(document, key, value)) {
                    return false;
                }
            } else {
                // Handle field equality and nested operators
                const fieldValue = this.getFieldValue(document, key);
                
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    // Handle field-level operators like { status: { $in: ['active', 'paused'] } }
                    if (!this.evaluateFieldOperators(fieldValue, value)) {
                        return false;
                    }
                } else {
                    // Direct equality check
                    if (fieldValue !== value) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    /**
     * Evaluates MongoDB operators like $and, $or, etc.
     */
    private evaluateOperator(document: Document, operator: string, value: any): boolean {
        switch (operator) {
            case '$and':
                return Array.isArray(value) && value.every(subFilter => this.evaluateFilter(document, subFilter));
            case '$or':
                return Array.isArray(value) && value.some(subFilter => this.evaluateFilter(document, subFilter));
            case '$nor':
                return Array.isArray(value) && !value.some(subFilter => this.evaluateFilter(document, subFilter));
            case '$not':
                return !this.evaluateFilter(document, value);
            default:
                this.logger.warn(`Unsupported operator: ${operator}`);
                return false;
        }
    }

    /**
     * Evaluates field-level operators like $in, $ne, $gt, etc.
     */
    private evaluateFieldOperators(fieldValue: any, operators: object): boolean {
        for (const [op, opValue] of Object.entries(operators)) {
            switch (op) {
                case '$in':
                    if (!Array.isArray(opValue) || !opValue.includes(fieldValue)) {
                        return false;
                    }
                    break;
                case '$nin':
                    if (!Array.isArray(opValue) || opValue.includes(fieldValue)) {
                        return false;
                    }
                    break;
                case '$ne':
                    if (fieldValue === opValue) {
                        return false;
                    }
                    break;
                case '$eq':
                    if (fieldValue !== opValue) {
                        return false;
                    }
                    break;
                case '$gt':
                    if (fieldValue <= opValue) {
                        return false;
                    }
                    break;
                case '$gte':
                    if (fieldValue < opValue) {
                        return false;
                    }
                    break;
                case '$lt':
                    if (fieldValue >= opValue) {
                        return false;
                    }
                    break;
                case '$lte':
                    if (fieldValue > opValue) {
                        return false;
                    }
                    break;
                case '$exists':
                    const exists = fieldValue !== undefined;
                    if (exists !== Boolean(opValue)) {
                        return false;
                    }
                    break;
                default:
                    this.logger.warn(`Unsupported field operator: ${op}`);
                    return false;
            }
        }
        return true;
    }

    /**
     * Gets a field value from a document, supporting dot notation for nested fields.
     */
    private getFieldValue(document: Document, fieldPath: string): any {
        const parts = fieldPath.split('.');
        let value = document;

        for (const part of parts) {
            if (value === null || value === undefined || typeof value !== 'object') {
                return undefined;
            }
            value = value[part];
        }

        return value;
    }

    /**
     * Applies a MongoDB-style projection to a document.
     * This is a simplified implementation that handles basic inclusion/exclusion.
     */
    private applyProjection(document: Document, projection: object): Document {
        if (!projection || typeof projection !== 'object') {
            return document;
        }

        const projectionEntries = Object.entries(projection);
        
        // Determine if this is an inclusion or exclusion projection
        const hasInclusions = projectionEntries.some(([, value]) => value === 1 || value === true);
        const hasExclusions = projectionEntries.some(([, value]) => value === 0 || value === false);

        if (hasInclusions && hasExclusions) {
            // Mixed projections are not allowed (except for _id exclusion)
            const nonIdExclusions = projectionEntries.filter(([key, value]) => 
                key !== '_id' && (value === 0 || value === false)
            );
            
            if (nonIdExclusions.length > 0) {
                this.logger.warn('Mixed inclusion/exclusion projections are not supported');
                return document;
            }
        }

        const result: Document = {};

        if (hasInclusions) {
            // Inclusion projection: only include specified fields
            for (const [fieldPath, value] of projectionEntries) {
                if (value === 1 || value === true) {
                    const fieldValue = this.getFieldValue(document, fieldPath);
                    if (fieldValue !== undefined) {
                        this.setFieldValue(result, fieldPath, fieldValue);
                    }
                }
            }

            // Handle _id exclusion in inclusion projection
            const idProjection = projection['_id' as keyof typeof projection];
            if (idProjection !== 0 && idProjection !== false && document._id !== undefined) {
                result._id = document._id;
            }
        } else {
            // Exclusion projection: exclude specified fields
            Object.assign(result, document);
            
            for (const [fieldPath, value] of projectionEntries) {
                if (value === 0 || value === false) {
                    this.deleteFieldValue(result, fieldPath);
                }
            }
        }

        return result;
    }

    /**
     * Sets a field value in a document, supporting dot notation for nested fields.
     */
    private setFieldValue(document: Document, fieldPath: string, value: any): void {
        const parts = fieldPath.split('.');
        let current = document;

        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!(part in current) || typeof current[part] !== 'object' || current[part] === null) {
                current[part] = {};
            }
            current = current[part];
        }

        current[parts[parts.length - 1]] = value;
    }

    /**
     * Deletes a field value from a document, supporting dot notation for nested fields.
     */
    private deleteFieldValue(document: Document, fieldPath: string): void {
        const parts = fieldPath.split('.');
        let current = document;

        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!(part in current) || typeof current[part] !== 'object' || current[part] === null) {
                return; // Path doesn't exist
            }
            current = current[part];
        }

        delete current[parts[parts.length - 1]];
    }
}