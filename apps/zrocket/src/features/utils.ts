import type { ValueType, TableSchema, Schema } from '@rocicorp/zero';
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
    // For discriminated schemas, we need to preserve original table identifiers
    // and map them to clean names while preserving .from() configurations
    const tableSpecs = Object.entries(schema.tables).map(([tableIdentifier, tableSchema]) => {
        const spec = tableSpecFromTableSchema(tableSchema);
        
        // If this table has a .from() field (discriminated union config),
        // use the original table identifier as the name, not the .from() value
        if ((spec as any).from && spec.name.startsWith('{')) {
            spec.name = tableIdentifier;
        }
        
        return spec;
    });
    return tableSpecs;
}

export function tableSpecFromTableSchema(table: TableSchema) {
    const tableColumns = Object.entries(table.columns).reduce(
        (acc, [columnName, column]: [string, ColSchema], pos) => {
            acc[columnName] = columnSpecFromColSchema(column, pos);
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
