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
    const tableSpecs = Object.values(schema.tables).map(tableSpecFromTableSchema);
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

    return {
        name: table.name,
        primaryKey: [...table.primaryKey],
        schema: 'public',
        columns: tableColumns
    } satisfies TableSpec;
}

export function columnSpecFromColSchema(column: ColSchema, pos: number) {
    return {
        pos,
        dataType: VALUE_TYPE_TO_PG_TYPE[column.type],
        notNull: !column.optional
    } satisfies ColumnSpec;
}
