#!/usr/bin/env node

/**
 * Schema Export Build Script
 * 
 * This script exports ZRocket's schema and table mappings to JSON files
 * that can be used by the MongoDB source server in file-based mode.
 * 
 * Usage:
 *   node export-schema.mjs [output-dir]
 * 
 * Environment Variables:
 *   SCHEMA_OUTPUT_DIR - Directory to write schema files (default: ./schemas)
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Import the schema and utilities
import { schema, tableMappings } from '@cbnsndwch/zrocket-contracts/schema';

// Convert Zero schema to table specs (simplified version of utils.ts function)
function tableSpecsFromSchema(schema) {
    return Object.entries(schema.tables).map(([tableName, tableSchema]) => {
        const tableColumns = Object.entries(tableSchema.columns).reduce(
            (acc, [columnName, columnSchema], pos) => {
                acc[columnName] = {
                    pos,
                    dataType: getDataType(columnSchema.type),
                    notNull: !columnSchema.optional
                };
                return acc;
            },
            {}
        );

        const spec = {
            name: tableName,
            primaryKey: [...tableSchema.primaryKey],
            schema: 'public',
            columns: tableColumns
        };

        // Check if this table has mapping metadata
        const tableMapping = tableMappings[tableName];
        if (tableMapping) {
            spec.tableMapping = tableMapping;
        }

        return spec;
    });
}

function getDataType(valueType) {
    const typeMap = {
        boolean: 'boolean',
        json: 'json',
        number: 'numeric',
        null: 'text',
        string: 'text'
    };
    return typeMap[valueType] || 'text';
}

async function exportSchemaFiles() {
    const outputDir = process.argv[2] || process.env.SCHEMA_OUTPUT_DIR || './schemas';
    
    console.log(`📊 Exporting ZRocket schema to: ${outputDir}`);

    // Ensure output directory exists
    await mkdir(outputDir, { recursive: true });

    // Generate schema export
    const schemaExport = {
        version: 1,
        tables: tableSpecsFromSchema(schema),
        metadata: {
            application: 'zrocket',
            exportedAt: new Date().toISOString(),
            sourceVersion: process.env.npm_package_version || '1.0.0'
        }
    };

    // Generate table mappings export
    const tableMappingsExport = {
        version: 1,
        mappings: tableMappings,
        metadata: {
            application: 'zrocket',
            exportedAt: new Date().toISOString(),
            sourceVersion: process.env.npm_package_version || '1.0.0'
        }
    };

    // Write files
    const schemaPath = join(outputDir, 'zrocket-schema.json');
    const mappingsPath = join(outputDir, 'zrocket-table-mappings.json');

    await writeFile(schemaPath, JSON.stringify(schemaExport, null, 2));
    await writeFile(mappingsPath, JSON.stringify(tableMappingsExport, null, 2));

    console.log(`✅ Schema exported to: ${schemaPath}`);
    console.log(`✅ Table mappings exported to: ${mappingsPath}`);
    console.log(`🎯 Configure source server with:`);
    console.log(`   schema.schemaFile: ${schemaPath}`);
    console.log(`   schema.tableMappingsFile: ${mappingsPath}`);
}

// Run the export
exportSchemaFiles().catch(console.error);
