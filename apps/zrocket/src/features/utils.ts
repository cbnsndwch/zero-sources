import type { Schema, TableSchema, ValueType } from '@rocicorp/zero';

import { mapping } from '@cbnsndwch/zrocket-contracts/schema';
import type { TableSpec } from '@cbnsndwch/zero-source-mongodb';

type ColSchema = TableSchema['columns'][string];
type ColumnsSpec = TableSpec['columns'];
type ColumnSpec = ColumnsSpec[string];
type PgType = 'numeric' | 'date' | 'text' | 'boolean' | 'json';

const VALUE_TYPE_TO_PG_TYPE: Record<ValueType, PgType> = {
    boolean: 'boolean',
    json: 'json',
    number: 'numeric',
    null: 'text',
    string: 'text'
} as const;

export function tableSpecsFromSchema(schema: Schema) {
    // Extract table specifications with proper metadata handling
    const tableSpecs = Object.entries(schema.tables).map(
        ([tableName, tableSchema]) => {
            const spec = tableSpecFromTableSchema(tableSchema);

            // Use the table identifier as the name (this is the clean table name)
            spec.name = tableName;

            // Check if this table has discriminated union metadata
            const tableMapping = mapping[tableName];
            if (tableMapping) {
                // Attach the table mapping configuration to the spec for the change source
                (spec as any).tableMapping = tableMapping;
            }

            return spec;
        }
    );

    return tableSpecs;
}

export function tableSpecFromTableSchema(table: TableSchema) {
    const tableColumns = Object.entries(table.columns).reduce(
        (acc, [columnName, columnSchema]: [string, ColSchema], pos) => {
            acc[columnName] = columnSpecFromColSchema(columnSchema, pos);
            return acc;
        },
        {} as ColumnsSpec
    );

    const spec: TableSpec = {
        name: table.name,
        primaryKey: [...table.primaryKey],
        schema: 'public',
        columns: tableColumns
    };

    // Preserve the .from() field if it exists (discriminated union configuration)
    if ((table as any).from) {
        (spec as any).from = (table as any).from;
    }

    return spec;
}

export function columnSpecFromColSchema(column: ColSchema, pos: number) {
    return {
        pos,
        dataType: VALUE_TYPE_TO_PG_TYPE[column.type],
        notNull: !column.optional
    } satisfies ColumnSpec;
}
